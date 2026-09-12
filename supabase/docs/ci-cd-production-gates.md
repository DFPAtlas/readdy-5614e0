# CI/CD Production Gates — GuardianHub Phase 14

The CI workflow below could not be written to `.github/workflows/` in this workspace (protected path), so it is captured here for setup in the repository's GitHub Actions.

## Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main, staging]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then npm ci; else npm install; fi
      - name: TypeScript check
        run: npx tsc --noEmit
      - name: Production build
        run: npm run build
      - name: Dependency audit (production)
        run: npm audit --omit=dev --audit-level=high
      - name: Secret scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - name: Generate SBOM
        run: npm sbom --omit=dev > sbom.spdx.json || true
      - name: Lint
        run: npm run lint
        continue-on-error: true
```

## Production deployment gates

Production promotion must:
1. Pass all CI checks (clean install, typecheck, build, dependency audit, secret scan).
2. Use reviewed migrations only.
3. Write a `deployment_records` row (commit SHA, version, environment).
4. Provide a rollback target (`rollback_to`).
5. Run smoke tests (sign-in, health-check ready, one test webhook, one guard check-in).
6. Stop promotion when any critical check fails.

## Manual setup

- Commit `package-lock.json` (run `npm install` locally to generate it) so `npm ci` is used.
- Add ESLint (`eslint`, `eslint-config-next`) to make the lint gate blocking.
- Configure Gitleaks allowlist if the initial scan flags safe fixtures.