# Build Status

## 2026-04-15

- Added explicit viewer UI rendering-mode messages in `apps/prd-viewer-web` to distinguish:
  - structured JSON entry rendering,
  - HTML fallback rendering,
  - unsupported entry mode detection.
- Clarified messaging that validator package validity and viewer rendering capability are separate concerns.
- Expanded `packages/prd-viewer-core` tests to verify viewer unsupported/fallback states can still coexist with validator-valid packages.
