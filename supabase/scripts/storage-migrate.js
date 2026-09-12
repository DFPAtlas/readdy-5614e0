/**
 * GuardianHub — Storage Object Migration Script
 * Phase 22D recovery tooling
 *
 * Migrates all Storage objects from one Supabase project to another.
 * Use ONLY for recovery drills targeting an isolated recovery project.
 *
 * Source: Supabase official documentation
 * https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
 *
 * Usage:
 *   OLD_PROJECT_URL=https://xxx.supabase.co \
 *   OLD_PROJECT_SERVICE_KEY=xxx \
 *   NEW_PROJECT_URL=https://yyy.supabase.co \
 *   NEW_PROJECT_SERVICE_KEY=yyy \
 *   node supabase/scripts/storage-migrate.js
 *
 * NEVER run with production service keys as NEW_PROJECT_SERVICE_KEY.
 * NEVER commit credentials to the repository.
 * NEVER run against the production project as the target.
 */

const { createClient } = require('@supabase/supabase-js')

const OLD_PROJECT_URL = process.env.OLD_PROJECT_URL
const OLD_PROJECT_SERVICE_KEY = process.env.OLD_PROJECT_SERVICE_KEY
const NEW_PROJECT_URL = process.env.NEW_PROJECT_URL
const NEW_PROJECT_SERVICE_KEY = process.env.NEW_PROJECT_SERVICE_KEY

if (!OLD_PROJECT_URL || !OLD_PROJECT_SERVICE_KEY || !NEW_PROJECT_URL || !NEW_PROJECT_SERVICE_KEY) {
  console.error('ERROR: All four environment variables are required:')
  console.error('  OLD_PROJECT_URL, OLD_PROJECT_SERVICE_KEY, NEW_PROJECT_URL, NEW_PROJECT_SERVICE_KEY')
  console.error('Do not commit credentials. Pass via environment only.')
  process.exit(1)
}

if (NEW_PROJECT_URL === OLD_PROJECT_URL) {
  console.error('SAFETY CHECK FAILED: Source and target project URLs are identical.')
  console.error('This script must only run with an isolated recovery project as the target.')
  process.exit(1)
}

const oldSupabase = createClient(OLD_PROJECT_URL, OLD_PROJECT_SERVICE_KEY)
const newSupabase = createClient(NEW_PROJECT_URL, NEW_PROJECT_SERVICE_KEY)

async function listAllFiles(bucket, path = '') {
  const { data, error } = await oldSupabase.storage.from(bucket).list(path, { limit: 1000 })
  if (error) throw new Error(`Error listing files in '${bucket}${path ? '/' + path : ''}': ${error.message}`)
  if (!data || data.length === 0) return []

  let files = []
  for (const item of data) {
    if (!item.metadata) {
      const subFiles = await listAllFiles(bucket, `${path}${item.name}/`)
      files = files.concat(subFiles)
    } else {
      files.push({ fullPath: `${path}${item.name}`, metadata: item.metadata })
    }
  }
  return files
}

async function ensureBucketExists(bucketName, options = {}) {
  const { data: existing, error } = await newSupabase.storage.getBucket(bucketName)
  if (error && !error.message.includes('not found')) {
    throw new Error(`Error checking bucket '${bucketName}': ${error.message}`)
  }
  if (!existing) {
    console.log(`Creating bucket '${bucketName}' in recovery project...`)
    const { error: createError } = await newSupabase.storage.createBucket(bucketName, options)
    if (createError) throw new Error(`Failed to create bucket '${bucketName}': ${createError.message}`)
    console.log(`Created bucket '${bucketName}'`)
  }
}

async function migrateFile(sourceBucket, targetBucket, file) {
  const { data, error: downloadError } = await oldSupabase.storage
    .from(sourceBucket)
    .download(file.fullPath)
  if (downloadError) {
    return { success: false, path: file.fullPath, error: `Download: ${downloadError.message}` }
  }

  const { error: uploadError } = await newSupabase.storage
    .from(targetBucket)
    .upload(file.fullPath, data, {
      upsert: true,
      contentType: file.metadata?.mimetype,
      cacheControl: file.metadata?.cacheControl,
    })
  if (uploadError) {
    return { success: false, path: file.fullPath, error: `Upload: ${uploadError.message}` }
  }

  return { success: true, path: file.fullPath }
}

async function run() {
  console.log('GuardianHub Storage Migration (Recovery Drill Tool)')
  console.log(`Source: ${OLD_PROJECT_URL}`)
  console.log(`Target: ${NEW_PROJECT_URL}`)
  console.log()
  console.log('SAFETY: Verify that the target is the isolated recovery project.')
  console.log('Press Ctrl+C within 5 seconds to cancel...')
  await new Promise((r) => setTimeout(r, 5000))

  const { data: buckets, error: listError } = await oldSupabase.storage.listBuckets()
  if (listError) throw new Error(`Failed to list source buckets: ${listError.message}`)

  console.log(`\nFound ${buckets.length} buckets to migrate.`)

  let totalFiles = 0
  let succeeded = 0
  let failed = 0
  const failures = []

  for (const bucket of buckets) {
    console.log(`\nProcessing bucket: ${bucket.name} (public: ${bucket.public})`)
    await ensureBucketExists(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.file_size_limit,
      allowedMimeTypes: bucket.allowed_mime_types,
    })

    const files = await listAllFiles(bucket.name)
    console.log(`  Found ${files.length} files`)
    totalFiles += files.length

    for (let i = 0; i < files.length; i += 10) {
      const batch = files.slice(i, i + 10)
      const results = await Promise.all(batch.map((f) => migrateFile(bucket.name, bucket.name, f)))
      for (const r of results) {
        if (r.success) {
          succeeded++
        } else {
          failed++
          failures.push(`${bucket.name}/${r.path}: ${r.error}`)
          console.error(`  FAILED: ${r.path} — ${r.error}`)
        }
      }
    }
  }

  console.log('\n=== Migration Summary ===')
  console.log(`Total files: ${totalFiles}`)
  console.log(`Succeeded:   ${succeeded}`)
  console.log(`Failed:      ${failed}`)

  if (failures.length > 0) {
    console.log('\nFailed files:')
    failures.forEach((f) => console.log(`  - ${f}`))
    process.exit(1)
  } else {
    console.log('\nMigration completed successfully.')
    console.log('IMPORTANT: Verify checksums and access controls before declaring storage recovery complete.')
    process.exit(0)
  }
}

run().catch((err) => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})