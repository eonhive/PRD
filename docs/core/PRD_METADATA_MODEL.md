# PRD_METADATA_MODEL.md
_Last updated: April 12, 2026_  
_Status: Metadata model draft v0.1_

## 1. Purpose

This document defines the current PRD metadata split.

Its job is to keep the manifest lean while still giving PRD a clear place for:

- required package identity and opening data
- optional durable reference metadata
- optional reader-facing discovery metadata

This is a format/spec document. It does not define product-specific library UX, marketplace taxonomies, or service-side catalog schemas.

---

## 2. Metadata Philosophy

PRD metadata should stay:

- lean
- declarative
- public-first where interoperability matters
- layered rather than dumped into one blob
- compatible with profile-based behavior without replacing profile identity

The manifest should not become a giant biography container, publishing CMS payload, or service database export.

The current PRD metadata split keeps:

- required package-opening fields at the manifest top level
- supplemental durable references in `identity`
- reader-facing display and discovery metadata in `public`
- rich about/creator/series material in content, attachments, or later profile-specific payloads

---

## 3. Metadata Lanes

### 3.1 Required base manifest lane

The required package-opening lane remains the accepted minimal baseline:

- `prdVersion`
- `manifestVersion`
- `id`
- `profile`
- `title`
- `entry`

These fields identify the package and let a minimal viewer open it.

This lane must not be replaced by a revived nested `header` object.

### 3.2 Optional `identity` lane

`identity` is the supplemental durable-reference lane.

It exists for stable machine-facing references beyond the required top-level `id`.

Recommended uses include:

- `revisionId`
- `parentId`
- `originId`
- `authorRefs`
- `publisherRef`
- reserved `ownerRef`
- primary `series` membership and sequence
- unordered `collections` memberships

Rules:

- `identity` is optional
- `identity` supplements the top-level `id`; it does not replace it
- `identity` should carry references, not heavy policy payloads
- `identity` must not smuggle ownership, payment, or rights engines into the base manifest

### 3.3 Optional `public` lane

`public` is the lean reader-facing metadata lane.

It may hold small display and discovery fields such as:

- `subtitle`
- `summary`
- `byline`
- `contributors`
- `publisher`
- `series`
- `collections`
- `genres`
- `subgenres`
- `tags`
- `contentWarnings`
- `contentRating`
- `status`
- `cover`

Rules:

- `public` is optional
- `public` must stay lightweight and declarative
- `public` does not replace `profile`
- `public` does not replace `localization`
- exact vocabularies for genres, warnings, ratings, and status remain open for now

---

## 4. `identity` Model

The current `identity` direction is intentionally narrow.

Illustrative shape:

```json
{
  "identity": {
    "revisionId": "rev-3",
    "parentId": "urn:uuid:prior-edition",
    "authorRefs": ["author:kira-stone"],
    "publisherRef": "publisher:eonhive-press",
    "series": {
      "ref": "urn:prd-series:example:field-guide",
      "sequence": {
        "volume": 1,
        "chapter": 3
      }
    }
  }
}
```

`identity` should be used when the package needs stable machine-facing references for relationships, provenance, or later ecosystem workflows.

It should not duplicate:

- the required top-level `id`
- the display-oriented `byline`
- full publisher profiles
- rights or payment payloads

Current lean relationship rule:

- `identity.series` carries the stable ordered grouping reference
- `identity.collections` carries stable unordered grouping references
- these relationship refs stay small and do not replace richer about/series content

---

## 5. `public` Model

The current `public` direction is also intentionally narrow.

Illustrative shape:

```json
{
  "public": {
    "subtitle": "Arc One",
    "summary": "A serialized fantasy web novel.",
    "byline": "Kira Stone",
    "series": {
      "title": "Field Guide"
    },
    "collections": [
      {
        "title": "Launch Shelf"
      }
    ],
    "contributors": [
      { "name": "Kira Stone", "role": "author" },
      { "name": "Min Seo", "role": "illustrator" }
    ],
    "publisher": "EonHive Press",
    "genres": ["fantasy", "romance"],
    "subgenres": ["progression-fantasy", "academy"],
    "tags": ["academy", "slow-burn"],
    "contentWarnings": ["violence"],
    "contentRating": "teen",
    "status": "ongoing",
    "cover": "assets/cover.webp"
  }
}
```

Field guidance:

- `byline` is the short primary display credit
- `contributors` is the small structured credits list
- `contributors` should use objects with `name` and `role`
- `contributors` may include `displayName` when presentation differs from the canonical shown name
- `series.title` is the small reader-facing label for the primary series membership
- `collections` is the small reader-facing label list for unordered groupings
- `cover` should be a lightweight reference to a packaged asset rather than embedded binary data

Alignment rule:

- `public.series` is meaningful only when `identity.series` declares the durable reference
- `public.collections` is meaningful only when `identity.collections` declares the durable references

Locale/language rule:

- language and locale negotiation belong in `localization`
- `public` may contain reader-facing text that happens to be localized, but it should not replace the `localization` declaration lane
- when localized reader-facing metadata is needed, the current reference path is a localized content resource layered outside the base manifest rather than duplicating per-locale metadata blobs inside `manifest.json`

---

## 6. What Stays Outside The Base Manifest

The following should stay outside the base manifest:

- full author bios
- full "about the author" pages
- full "about the series" pages
- acknowledgements
- release notes
- detailed editorial notes
- long publishing-imprint notes
- rich social/profile link collections
- full catalog metadata exported from a service

Those belong in:

- normal content
- attachments
- later profile-specific payloads
- later ecosystem/product layers

This keeps the manifest lean while still letting a package expose rich human context elsewhere.

---

## 7. Viewer, Studio, And Library Surface Guidance

When present, Viewer, Studio, SDKs, validators, or library/catalog surfaces should be able to surface:

- `title`
- `byline` or short creator display info
- `publisher`
- `summary`
- series and collection labels when present
- locale information from `localization`
- `cover`

These are presentation-facing conveniences.

They do not change:

- package validity
- profile identity
- minimal open behavior

---

## 8. Canonical Example

```json
{
  "prdVersion": "1.0",
  "manifestVersion": "1.0",
  "id": "urn:uuid:example",
  "profile": "general-document",
  "title": "Example Title",
  "entry": "content/root.json",
  "identity": {
    "revisionId": "rev-3",
    "authorRefs": ["author:kira-stone"],
    "publisherRef": "publisher:eonhive-press",
    "series": {
      "ref": "urn:prd-series:example:field-guide",
      "sequence": {
        "volume": 1,
        "chapter": 3
      }
    }
  },
  "localization": {
    "defaultLocale": "en",
    "availableLocales": ["en"]
  },
  "public": {
    "subtitle": "Arc One",
    "summary": "A serialized fantasy web novel.",
    "byline": "Kira Stone",
    "series": {
      "title": "Field Guide"
    },
    "contributors": [
      { "name": "Kira Stone", "role": "author" },
      { "name": "Min Seo", "role": "illustrator" }
    ],
    "publisher": "EonHive Press",
    "genres": ["fantasy", "romance"],
    "subgenres": ["progression-fantasy", "academy"],
    "tags": ["academy", "slow-burn"],
    "contentWarnings": ["violence"],
    "contentRating": "teen",
    "status": "ongoing",
    "cover": "assets/cover.webp"
  }
}
```

This example keeps the top-level opening contract intact while adding supplemental identity and reader-facing metadata.

---

## 9. Validator Implications

A validator implementing this direction may check at least the following when these optional fields appear:

1. `identity`, when present, is an object
2. `public`, when present, is an object
3. `contributors`, when present, is an array
4. each `contributors` item is an object with at least `name` and `role` strings
5. `cover`, when present, is a non-empty reference string rather than embedded binary data
6. package-level validation may require `cover` references to resolve to declared packaged image assets
7. `public.series`, when present, is a small reader-facing label rather than a rich about page
8. `identity.series` and `identity.collections`, when present, remain durable references rather than heavy catalog payloads
9. `identity` does not replace the required top-level `id`
10. locale declarations remain under `localization`, not as a loose required top-level language field

Validators may warn when:

- metadata fields appear excessively large for a lean manifest
- `identity` duplicates the top-level `id` pointlessly
- genre, warning, or status values appear malformed for a later vocabulary profile, if PRD defines one

---

## 10. Open Questions

- Should PRD later define a controlled vocabulary model for genres, ratings, warnings, or status values?
- Should creator references such as `authorRefs` eventually align with a standard external identity syntax?
- Should later drafts allow multiple simultaneous ordered series memberships, or should `identity.series` stay singular?
- Which profile-specific metadata fields, if any, should later be promoted beyond this base split?
