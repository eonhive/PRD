# PRD_SEGMENTATION_MODEL.md
_Last updated: April 12, 2026_  
_Status: Segmentation model draft v0.1_

## 1. Purpose

This document defines the current executable PRD baseline for segmented large-document packaging.

Its job is to let larger `general-document` works split content into packaged section files without reviving a heavy spine model or turning small documents into bloated file trees.

---

## 2. Scope

This draft defines:

- the current segmentation rule for `general-document`
- the difference between the canonical entry root and packaged section files
- the current file-path and validator rules
- the current viewer expectation for resolving segmented sections

This draft does not define:

- collection or series behavior beyond staying separate from segmentation
- comic or storyboard segmentation
- lazy loading or streaming policy
- section-level locale files
- reader navigation semantics

---

## 3. Segmentation Philosophy

Current segmentation direction:

- segmentation is a packaging rule for larger works
- segmentation does not replace the manifest entry contract
- segmentation does not create a separate collection system
- segmentation should stay small and predictable in v0.1

The canonical document open path remains:

- `manifest.entry` -> `content/root.json`

Segmented section files remain part of that same document.

---

## 4. Current Executable Model

### 4.1 Canonical root

The base `general-document` root remains:

- `profile: "general-document"`
- `type: "document"`
- `children: [...]`

### 4.2 Section forms

In v0.1, a `section` node has two legal authored forms:

1. Inline section

```json
{
  "type": "section",
  "id": "overview",
  "title": "Overview",
  "children": []
}
```

2. Segmented top-level section

```json
{
  "type": "section",
  "id": "chapter-01",
  "title": "Chapter 01",
  "src": "content/sections/chapter-01.json"
}
```

Rules:

- `src` and `children` are mutually exclusive
- segmented `section` nodes are allowed only at the top level of the document root in v0.1
- nested segmented sections are not allowed in v0.1

### 4.3 Section file root

Referenced section files use this root shape:

```json
{
  "schemaVersion": "1.0",
  "profile": "general-document",
  "type": "document-section",
  "id": "chapter-01",
  "title": "Chapter 01",
  "children": []
}
```

Rules:

- `id` must match the parent section node `id`
- `title` must match the parent section node `title`
- `children` must be a non-empty array of supported `general-document` nodes

---

## 5. Path Rules

Current executable path rule:

- segmented section files must resolve under `content/sections/`

Examples:

- valid: `content/sections/chapter-01.json`
- invalid: `content/appendices/a.json`
- invalid: `chapters/chapter-01.json`

This keeps large-work packaging predictable and avoids arbitrary file-tree drift.

---

## 6. Viewer Expectations

A viewer implementing this baseline should:

- open the canonical root from `manifest.entry`
- resolve segmented top-level sections from packaged section files
- render the resolved result as one continuous `general-document`
- keep truthful fallback behavior if segmentation is unsupported

Current reference behavior:

- resolve segmented sections before applying localized node overrides
- do not add routing, lazy fetch, or reading-order UI in this slice
- do not treat segmentation as an interoperable lazy-loading contract
- current reference loading still happens through eager whole-package in-memory package opening

---

## 7. Validator Implications

A validator implementing this baseline should check at least:

1. segmented `section` nodes only appear at the top level
2. `src` and `children` are not used together
3. segmented `src` paths resolve under `content/sections/`
4. referenced section files exist
5. referenced section files parse as JSON
6. referenced section files use `type: "document-section"`
7. referenced section `id` and `title` match the parent section node
8. nested segmented section references are rejected in v0.1
9. repeated section-file graphs are rejected in v0.1

---

## 8. Open Questions

- When should segmentation expand beyond `general-document`?
- Should later drafts add section-level locale resources?
- When should lazy loading become part of the interoperable runtime model rather than viewer-specific optimization?
- How should later drafts coordinate segmented large single-package works with cross-package series relationships without duplicating sequence metadata?
