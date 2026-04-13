# Changesets

This repo uses Changesets for npm package release management.

Public releases cover only:

- `@eonhive/prd-types`
- `@eonhive/prd-validator`
- `@eonhive/prd-packager`
- `@eonhive/prd-cli`

Create a release note entry with:

```bash
pnpm changeset
```

Versioning and publishing are handled by the release workflow on `main`.
