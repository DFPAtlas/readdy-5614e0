import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const db = new PGlite();
try {
  for (const file of [
    "tests/phase-one/schema-fixture.sql",
    "supabase/migrations/20261003090033_guardianhub_phase_one_journeys.sql",
    "tests/phase-one/privilege-assertions.sql",
    "tests/phase-one/behaviour.sql",
  ]) {
    await db.exec(await readFile(path.join(root, file), "utf8"));
  }
  console.log(
    "Phase 1 SQL passed: migration, tenant/client isolation, invoice status visibility, queries, viewer denial, request history/replies and shift acknowledgements.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await db.close();
}
