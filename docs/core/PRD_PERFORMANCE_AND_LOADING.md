# PRD_PERFORMANCE_AND_LOADING.md
_Last updated: April 12, 2026_  
_Status: Performance and loading draft v0.1_

## 1. Purpose

This document defines the current executable PRD baseline for performance and loading behavior.

Its job is to make PRD's loading story explicit without inventing streaming, range-request, or network semantics that the current format and reference stack do not actually guarantee.

---

## 2. Scope

This draft defines:

- the current loading baseline for core PRD packages
- the distinction between packaging strategy and runtime loading strategy
- the current reference viewer loading truth
- practical guidance for larger works under the current foundation

This draft does not define:

- manifest size limits
- streaming or range-request requirements
- worker-based unzip requirements
- lazy section fetch requirements
- package mutation or optimization behavior
- future advanced renderer performance tiers

---

## 3. Loading Philosophy

Current loading direction:

- PRD core remains packaged-first and offline-first
- base validity does not depend on live services
- packaged structure and portability matter more than speculative optimization claims
- segmentation and cross-package relationships must not be mistaken for load graphs

The current reference stack should tell the truth plainly:

- packages are validated as packaged files
- the reference viewer eagerly loads one package into memory
- any media-level lazy presentation remains implementation detail, not format canon

---

## 4. Current Executable Baseline

The current executable loading baseline is:

- one package opens from one manifest
- the public readable path is package-local
- current core validity does **not** require:
  - streaming
  - range requests
  - workers
  - partial unzip
  - lazy section fetch
- the current reference viewer baseline is **eager whole-package in-memory loading**

This means a valid PRD package is not invalid simply because a reference viewer opens it eagerly.

---

## 5. Packaging Strategy vs Loading Strategy

PRD currently has several packaging rules that improve discipline without creating runtime loading guarantees.

### 5.1 Segmentation

`general-document` segmentation is a packaging rule for larger single-package works.

It means:

- one document root may reference packaged section files
- the package stays smaller and more maintainable than one giant `content/root.json`

It does **not** mean:

- lazy loading is required
- viewers owe section-by-section fetch behavior
- segmented sections define a network or streaming contract

### 5.2 Collection and series metadata

Collection and series metadata relate multiple PRD packages to one another.

They mean:

- ordered or grouped relationships can be declared durably

They do **not** mean:

- one package loads another automatically
- viewers owe cross-package prefetch behavior
- the manifest defines a package load graph

### 5.3 Attachments

Attachments remain supplemental material.

They must not block the base open path, and linked attachments do not redefine PRD's packaged-first loading baseline.

---

## 6. Practical Guidance For Larger Works

Under the current core baseline, larger ongoing works should prefer:

1. segmentation for one larger `general-document`
2. multiple PRD packages tied together through series metadata for serialized works
3. packaged assets in core
4. linked attachments only as supplemental references

This keeps PRD smaller and more portable without pretending the current stack already guarantees advanced loading behavior.

---

## 7. Reference Tooling Guidance

The current reference tooling should expose loading-relevant facts truthfully.

Useful inspection facts include:

- file count
- total bytes
- asset and attachment counts
- localization presence
- segmentation presence
- entry mode
- the current reference load mode

Those facts inform tooling and users, but they do not create new validity rules by themselves.

---

## 8. Open Questions

- When should PRD define optional performance tiers for advanced viewers?
- When should worker-based unzip or progressive section loading become capability-level behavior instead of implementation detail?
- Should later drafts define non-normative package-size guidance for publishers without turning size into validity?
- How should future renderer optimizations stay truthful without confusing packaging strategy with loading guarantees?
