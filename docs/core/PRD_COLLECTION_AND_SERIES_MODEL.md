# PRD_COLLECTION_AND_SERIES_MODEL.md
_Last updated: April 12, 2026_  
_Status: Collection and series model draft v0.1_

## 1. Purpose

This document defines the current executable PRD baseline for collection and series relationships across packages.

Its job is to give larger works a lean grouping and ordering model without turning one PRD package into a package-of-packages container or reviving a heavy spine.

---

## 2. Scope

This draft defines:

- the distinction between a single package and a multi-package work
- the current lean manifest relationship lanes for `series` and `collections`
- the current sequence model for ordered series membership
- validator and viewer expectations for the relationship baseline

This draft does not define:

- a shared collection manifest file
- package indexes or libraries inside the core package layout
- live sync or feed behavior
- multiple simultaneous series memberships
- per-series rights, payment, or protection behavior
- viewer navigation across multiple PRD packages

---

## 3. Relationship Philosophy

Current collection and series direction:

- one PRD package still opens through one manifest and one declared `entry`
- segmentation handles one larger document inside one package
- collection and series metadata relate multiple packages to one another
- the base manifest stays lean
- collection and series metadata are not a package load graph

This model exists for grouping and ordering, not for replacing the canonical open path.

---

## 4. Executable v0.1 Model

### 4.1 Durable relationship lane

Durable cross-package references live under `identity`.

Current executable shapes:

```json
{
  "identity": {
    "series": {
      "ref": "urn:prd-series:example:sequential-dawn",
      "sequence": {
        "volume": 1,
        "issue": 1
      }
    },
    "collections": [
      {
        "ref": "urn:prd-collection:example:launch-shelf"
      }
    ]
  }
}
```

Rules:

- `identity.series`, when present, is the primary ordered membership lane
- `identity.series.ref` must be a non-empty durable reference
- `identity.series.sequence`, when present, must contain one or more positive integers
- v0.1 sequence fields are:
  - `index`
  - `volume`
  - `issue`
  - `chapter`
  - `episode`
  - `part`
- `identity.collections`, when present, must be a non-empty array of unique `ref` values
- collections are unordered in v0.1

### 4.2 Lean display lane

Reader-facing labels live under `public`.

Current executable shapes:

```json
{
  "public": {
    "series": {
      "title": "Sequential Dawn"
    },
    "collections": [
      {
        "title": "Launch Shelf"
      }
    ]
  }
}
```

Rules:

- `public.series` is optional
- `public.series.title`, when used, must stay small and reader-facing
- `public.collections`, when used, must stay small and reader-facing
- rich "about the series" material still belongs in content or attachments

### 4.3 Lane alignment

Current executable alignment rules:

- `public.series` requires a matching durable `identity.series.ref`
- `public.collections` requires matching durable `identity.collections`
- when both collection arrays are present, they align by item order and must use the same item count

This keeps the machine-facing grouping stable while giving viewers small display labels.

---

## 5. What This Model Is Not

This model does **not** create:

- a package spine
- a shared root entry across multiple packages
- a required library database
- a bundle format for many PRDs in one PRD
- automatic cross-package navigation semantics

Those are later ecosystem or extension questions, not part of the current core baseline.

---

## 6. Viewer and Library Guidance

Viewers or library/catalog surfaces implementing this baseline should be able to:

- group packages by `identity.series.ref`
- order series members by the available sequence fields
- group packages by `identity.collections[*].ref`
- show reader-facing labels from `public.series.title` and `public.collections[*].title`

The current reference web viewer may surface this data as manifest metadata, but it does not owe the user a multi-package library or reading shelf in the core baseline.

Current loading implication:

- one package still loads as one package
- series and collection metadata do not imply prefetch, chained open, or progressive multi-package loading behavior

---

## 7. Validator Implications

A validator implementing this baseline should check at least:

1. `identity.series`, when present, is an object with a non-empty `ref`
2. `identity.series.sequence`, when present, is an object with one or more positive integer fields
3. `identity.collections`, when present, is a non-empty array of unique non-empty `ref` values
4. `public.series`, when present, is an object with a non-empty `title`
5. `public.collections`, when present, is a non-empty array of objects with non-empty `title`
6. `public.series` is not used without `identity.series`
7. `public.collections` are not used without matching `identity.collections`
8. `public.collections` and `identity.collections` use the same item count when both are present

---

## 8. Example

```json
{
  "prdVersion": "1.0",
  "manifestVersion": "1.0",
  "id": "urn:prd:example:comic-issue",
  "profile": "comic",
  "title": "Issue 01",
  "entry": "content/root.json",
  "identity": {
    "series": {
      "ref": "urn:prd-series:example:sequential-dawn",
      "sequence": {
        "volume": 1,
        "issue": 1
      }
    },
    "collections": [
      {
        "ref": "urn:prd-collection:example:starter-shelf"
      }
    ]
  },
  "public": {
    "summary": "Opening issue of a structured comic series.",
    "series": {
      "title": "Sequential Dawn"
    },
    "collections": [
      {
        "title": "Starter Shelf"
      }
    ]
  }
}
```

---

## 9. Open Questions

- Should a later draft allow multiple simultaneous `series` memberships when a work belongs to more than one ordered line?
- Should later drafts define explicit sequence precedence rules when several sequence fields are present?
- Should PRD later define a separate optional collection manifest for richer offline library bundles without weakening the one-package baseline?
- How should later ecosystem/library surfaces reconcile local grouping heuristics with explicit manifest relationships?
