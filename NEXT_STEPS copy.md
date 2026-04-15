# Next Steps

1. Add dedicated web app tests for rendering-mode UI messages in `apps/prd-viewer-web` (structured JSON, HTML fallback, unsupported mode).
2. Add a cross-package integration test (validator + viewer-core + web state mapping) to ensure support-state messaging remains aligned.
3. Consider exposing a typed `renderMode` helper from `@eonhive/prd-viewer-core` so viewer clients can consume a canonical capability classification.
