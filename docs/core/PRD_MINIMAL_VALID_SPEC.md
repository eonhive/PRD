# PRD_MINIMAL_VALID_SPEC.md
_Last updated: April 16, 2026_  
_Status: Draft v0.1 (provisional)_

## Purpose

This document defines the smallest legal and usable PRD package for the MVP foundation.

The goal is to make PRD packages:

- portable,
- manifest-centered,
- profile-aware,
- validator-testable,
- and minimally renderable by a compliant viewer.

This is a foundation spec, not an ecosystem expansion spec.

---

## Scope

This spec defines:

1. minimal package structure
2. minimal required manifest fields
3. entry resolution constraints
4. baseline profile-entry compatibility requirements
5. baseline validator conformance expectations
6. minimal fixture expectations for conformance testing

---

## Non-goals

This spec does **not** define:

- payment or commerce systems
- crypto ownership or chain-linked behavior
- full encryption or signature stack
- live networked document behavior
- advanced runtime extension execution models
- full conversion workflows

These are explicitly outside MVP foundation scope.

---

## Normative rules

Normative terms are interpreted as defined by RFC 2119/8174 usage: MUST, MUST NOT, SHOULD, SHOULD NOT, MAY.

### Package root and manifest

**MVS-001**  
A PRD package **MUST** include `manifest.json` at package root.

**MVS-002**  
`manifest.json` **MUST** be parseable as valid JSON.

**MVS-003**  
The manifest **MUST** include all required top-level opening fields:

- `prdVersion`
- `manifestVersion`
- `id`
- `profile`
- `title`
- `entry`

**MVS-004**  
The manifest **MUST NOT** require nested `header`, `metadata`, or `structure` sections as opening structure.

### Minimal directory model

**MVS-005**  
The package **SHOULD** use the canonical predictable layout:

- `manifest.json`
- `content/`
- `assets/`
- `profiles/`
- `extensions/`
- `protected/`

For minimal validity, only paths required by manifest references are mandatory to exist.

### Entry constraints

**MVS-006**  
`entry` **MUST** be a relative package-internal path.

**MVS-007**  
`entry` **MUST NOT** be:

- an absolute path
- a URL
- a backslash-based path
- a directory path
- a path traversal (`..`) escape path

**MVS-008**  
`entry` **MUST** resolve to an existing package member.

### Profile constraints (MVP core set)

**MVS-009**  
`profile` **MUST** be one of:

- `general-document`
- `comic`
- `storyboard`

**MVS-010**  
Profile-specific entry compatibility **MUST** be enforced by validator rules.

### General-document canonical path

**MVS-011**  
For canonical executable support, `general-document` packages **SHOULD** use structured JSON entry under `content/` (typically `content/root.json`).

**MVS-012**  
HTML-backed opening behavior for `general-document` **MAY** exist as fallback behavior, but **MUST NOT** be treated as canonical full-support path.

### Optional manifest areas

**MVS-013**  
When present, `identity` **MUST** conform to schema-defined shape.

**MVS-014**  
When present, `public` **MUST** conform to schema-defined shape.

**MVS-015**  
When present, `localization` **MUST** conform to schema-defined shape.

**MVS-016**  
When present, `extensions` **MUST** conform to schema-defined shape and versioning/namespace rules.

### Validator and viewer boundary

**MVS-017**  
Structural validity **MUST** be determined by validator conformance checks, not viewer implementation behavior.

**MVS-018**  
Viewer capability levels **MUST** be represented separately from package validity.

---

## Minimal legal package tree (illustrative)

```text
example-minimal.prd/
  manifest.json
  content/
    root.json
```

A package MAY include additional canonical directories (`assets/`, `profiles/`, etc.) when needed by manifest references.

---

## Minimal manifest example (illustrative)

```json
{
  "prdVersion": "1.0.0",
  "manifestVersion": "1.0.0",
  "id": "example-minimal-001",
  "profile": "general-document",
  "title": "Minimal PRD Example",
  "entry": "content/root.json"
}
```

---

## Invalid examples (illustrative)

### Missing required field

```json
{
  "prdVersion": "1.0.0",
  "manifestVersion": "1.0.0",
  "id": "bad-001",
  "profile": "general-document",
  "entry": "content/root.json"
}
```

Invalid: missing `title`.

### Illegal entry URL

```json
{
  "prdVersion": "1.0.0",
  "manifestVersion": "1.0.0",
  "id": "bad-002",
  "profile": "general-document",
  "title": "Bad Entry",
  "entry": "https://example.com/doc.json"
}
```

Invalid: `entry` is an external URL.

### Traversal entry

```json
{
  "prdVersion": "1.0.0",
  "manifestVersion": "1.0.0",
  "id": "bad-003",
  "profile": "general-document",
  "title": "Traversal",
  "entry": "../outside.json"
}
```

Invalid: `entry` escapes package boundary.

---

## Conformance mapping matrix (starter)

| Req ID | Normative requirement | Schema/manifest path | Validator issue code(s) | Fixture ID(s) | CLI output expectation | Status |
| --- | --- | --- | --- | --- | --- | --- |
| MVS-001 | root manifest exists | package root | TBD | `missing-manifest-root` | `validate --json` includes missing manifest issue | Draft |
| MVS-003 | required opening fields present | top-level manifest fields | TBD | `missing-prdVersion`, `missing-manifestVersion`, `missing-id`, `missing-profile`, `missing-title`, `missing-entry` | deterministic missing-field issues | Draft |
| MVS-006/007/008 | entry is relative, safe, existing | `manifest.entry` | TBD | `entry-absolute`, `entry-url`, `entry-backslash`, `entry-traversal`, `entry-directory`, `entry-missing-target` | deterministic entry issue family | Draft |
| MVS-009/010 | supported profile plus compatible entry | `manifest.profile` + `manifest.entry` | TBD | `profile-valid-*`, `profile-entry-mismatch-*` | mismatch appears in invalid list | Draft |
| MVS-013..016 | optional blocks shape-valid when present | `identity/public/localization/extensions` | TBD | block-specific invalid fixtures | shape-specific issue list | Draft |
| MVS-017/018 | validity vs capability separated | validator/viewer boundary docs and tests | TBD | integration fixtures | valid package can still show limited capability state | Draft |

Replace all `TBD` issue codes with canonical implementation codes from `packages/prd-validator` as part of conformance completion.

---

## Fixture requirements (MVP conformance baseline)

At minimum, conformance fixtures SHOULD include:

1. one canonical valid package per profile (`general-document`, `comic`, `storyboard`)
2. one intentional invalid package per profile
3. shared invalid entry-path fixtures (`absolute`, `backslash`, `url`, `traversal`, `directory`)

---

## Validation and CLI expectations

1. `validate` MUST return deterministic issue structure for invalid packages.
2. `validate` MUST return success for valid packages.
3. JSON output MUST remain stable enough for automation contracts.
4. Human-readable output SHOULD remain deterministic in section ordering.

---

## Compatibility and fallback behavior

1. A package can be structurally valid while a specific viewer has limited rendering support.
2. HTML fallback behavior MAY be supported for compatibility, but MUST remain non-canonical for the `general-document` primary execution path.
3. Fallback rendering behavior MUST NOT redefine manifest structural validity.

---

## Deferred items (explicit)

The following are intentionally deferred to later specs/docs:

- detailed capability levels taxonomy
- full conformance class model
- advanced extension execution/runtime behavior
- rights/access/protection layers
- economy/payment/crypto extension lanes

---

## Open questions

1. Should `prdVersion` and `manifestVersion` use strict semver-only regex, or controlled aliases?
2. What is the exact minimum content schema for `content/root.json` per profile?
3. Which optional manifest blocks are MVP-required for any profile-specific conformance tier?
4. What exact issue-code namespace strategy should be frozen for long-term automation stability?

---

## Change control notes

This document remains provisional until:

1. all `TBD` issue-code mappings are resolved
2. fixture IDs exist and pass in CI
3. active NEXT_STEPS conformance tasks are closed
