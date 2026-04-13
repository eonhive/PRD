# PRD_ASSETS_AND_ATTACHMENTS.md
_Last updated: April 12, 2026_  
_Status: Assets and attachments draft v0.1_

## 1. Purpose

This document defines the current executable PRD baseline for packaged assets and attachments.

Its job is to keep package growth disciplined without turning every PRD into a random file dump.

---

## 2. Scope

This draft defines:

- the difference between assets and attachments
- the current executable path rules for each
- bundled vs linked attachment behavior
- validator expectations
- minimal viewer expectations

This draft does not define large-work chunking or streaming strategy directly.
Segmentation now lives in `PRD_SEGMENTATION_MODEL.md`, and collection/series behavior now lives in `PRD_COLLECTION_AND_SERIES_MODEL.md`.

---

## 3. Baseline Distinction

Current executable distinction:

- `assets` are declared reusable package resources that the document or profile root actively references
- `attachments` are declared supplemental files or links that travel with the package or point outward without becoming the base open path

Rules:

- assets may be required by the intended reading experience
- attachments must remain optional relative to the base open path
- unsupported attachment behavior must not block the public package from opening
- media-level lazy presentation may exist in a viewer, but it is not a core format guarantee

---

## 4. Asset Baseline

Current executable asset baseline:

- assets are declared through `manifest.assets`
- `assets` must be an array when present
- each asset declaration must include a non-empty `href`
- `id`, when present, must be a unique non-empty string
- `type`, when present, must be a non-empty string
- current executable asset `href` values must be package-internal relative paths
- current executable asset `href` values must resolve under `assets/`
- declared bundled asset files must exist in the package
- external asset URLs are not part of the interoperable core baseline

Rationale:

- keeps packaged resources predictable
- keeps runtime asset resolution local and portable
- avoids hidden external asset dependencies in the base path

External asset resolution remains future extension work, not part of the current executable baseline.

---

## 5. Attachment Baseline

Current executable attachment baseline:

- attachments are declared through `manifest.attachments`
- `attachments` must be an array when present
- each attachment declaration must include a non-empty `href`
- `id`, when present, must be a unique non-empty string
- `type`, when present, must be a non-empty string

Current executable attachment kinds:

1. Bundled attachments
- use package-internal relative paths
- must resolve under `attachments/`
- must exist in the package

2. Linked attachments
- use absolute `http` or `https` URLs
- are allowed as supplemental references
- must not replace the packaged base open path

This keeps the attachment model small while still allowing practical supplemental material.

---

## 6. Viewer Expectations

A viewer implementing this baseline should:

- ignore attachments safely if it has no attachment UI
- preserve base document opening even when attachments are unsupported
- when attachment UI exists, expose bundled or linked attachments truthfully as supplemental material
- keep attachments supplemental even when they are large or external

Attachments are not the same thing as embedded document nodes.
They are manifest-declared side materials.

---

## 7. Validator Implications

A validator implementing this baseline should check at least:

1. `assets`, when present as an array, uses object declarations with non-empty `href`
2. asset `id` values are unique when present
3. asset `href` values resolve to package-internal paths under `assets/`
4. asset `href` values do not use external URLs
5. declared bundled asset files exist in the package
6. `attachments`, when present, is an array of objects
7. attachment `id` values are unique when present
8. bundled attachment `href` values resolve under `attachments/`
9. bundled attachment files exist in the package
10. linked attachment `href` values use `http` or `https`

Validators may remain permissive about attachment file types in this baseline.

---

## 8. Example

```json
{
  "assets": [
    {
      "id": "cover",
      "href": "assets/cover.svg",
      "type": "image/svg+xml"
    }
  ],
  "attachments": [
    {
      "id": "reading-checklist",
      "href": "attachments/checklist.txt",
      "type": "text/plain"
    },
    {
      "id": "external-reference",
      "href": "https://example.com/reference.pdf",
      "type": "application/pdf"
    }
  ]
}
```

---

## 9. Open Questions

- Should PRD later define richer attachment classes such as source files, research packets, or linked PRD references?
- Should a future PRD extension standardize external asset references without weakening the packaged-first core baseline?
- How should very large attachment sets be indexed without bloating the base manifest?
