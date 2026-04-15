# Build Status

## 2026-04-15

- Added an MVP smoke-gate script for `examples/document-basic` that runs pack, source validate, packed validate, and packed inspect in a strict sequence.
- Added root script target `examples:smoke:document-basic` with a prebuild hook for `@eonhive/prd-cli`.
- Verified the new smoke-gate command succeeds end-to-end.
