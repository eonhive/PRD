# PRD_CONFORMANCE.md
_Last updated: April 16, 2026_
_Status: Canonical runtime conformance draft v0.2_

## 1. Purpose

This document defines the current PRD conformance baseline for viewers and renderers.

Its job is to make runtime support claims:

- explicit
- testable
- truthful
- separate from structural package validity

This is a runtime-facing spec document. It does not redefine the PRD package contract, manifest baseline, profile registry, or product UX beyond what a viewer or renderer owes the format.

## 1.1 Executable Alignment

The current executable runtime contract is anchored in:

- `packages/prd-types/src/index.ts`
  - `PrdViewerSupportState`
  - `PrdRuntimeCapabilityDescriptor`
  - `PrdReferenceLoadMode`
- `packages/prd-viewer-core/src/index.ts`
  - `openPrdDocument`
  - `inferViewerRenderMode`
  - `PRD_REFERENCE_VIEWER_RUNTIME_DESCRIPTOR`

This means:

- the support-state vocabulary is wider than the subset emitted by the current reference viewer
- the current reference viewer descriptor is the truthful executable claim for this repo, not the broadest future conformance target
- profile support for `comic` and `storyboard` is currently expressed through runtime behavior and `supportedProfiles`, not new manifest-required capability identifiers

---

## 2. Scope

This draft defines:

- the difference between package validity and runtime conformance
- the minimum behavior a conforming viewer should provide
- how support claims should be declared
- how support-state results should be reported
- safe fallback expectations for unsupported behavior
- a baseline no-hidden-network opening rule
- the truthful loading baseline for the current reference stack

This draft applies to:

- reference viewers
- alternative PRD viewers
- renderers used inside viewers
- conformance fixtures and runtime tests

---

## 3. Non-goals

This draft does not define:

- a certification authority or official badge process
- a full fixture catalog
- product-specific UI layouts
- cloud-only runtime behavior
- every future extension capability
- detailed profile specs for `comic` or `storyboard`

---

## 4. Conformance Philosophy

PRD conformance should follow these rules:

- structural validity and runtime support are different questions
- viewers must report what they can actually do, not what canon hopes they will do later
- fallback behavior is part of conformance, not an excuse for vague support claims
- unsupported advanced behavior must fail safely and visibly
- a conforming base viewer must not require hidden network access just to open the public readable path of a valid package

The core distinction is:

- validator truth answers whether a package is structurally valid
- conformance truth answers how a runtime behaves when opening it

---

## 5. Conformance Surfaces

### 5.1 Package validity

Package validity is determined by the validator and core spec documents such as:

- `core/PRD_MINIMAL_VALID_SPEC.md`
- `core/PRD_MINIMAL_VALID_PRD.md`
- `core/PRD_MANIFEST_DRAFT.md`

A package may be valid even when a given viewer does not support its intended experience fully.

### 5.2 Profile recognition

A viewer should distinguish between:

- recognized canonical profiles
- deprecated or legacy identifiers
- community/custom profiles
- unknown profiles

Profile recognition does not automatically imply full render support.

### 5.3 Capability support

Capability support is declared through runtime-facing metadata such as the capability model in `runtime/PRD_CAPABILITY_MODEL.md`.

### 5.4 Support-state reporting

Support-state reporting is the runtime result of opening a package in a specific implementation.

This draft formalizes the current support-state vocabulary.

---

## 6. Minimal Viewer Conformance Baseline

A minimally conforming PRD viewer for the current executable foundation should be able to:

1. open a `.prd` package or equivalent unpacked package input
2. read the public manifest
3. resolve `profile` and `entry`
4. open the primary readable path without hidden service dependencies
5. expose truthful runtime state when full fidelity is unavailable

For the current foundation milestone, that means:

- a structured `general-document` root at `content/*.json` is the canonical fully-supported baseline
- structured `comic` and `storyboard` roots at `content/*.json` are now the canonical fully-supported visual-profile baselines
- HTML-backed paths may still be readable, but they are fallback behavior rather than the canonical fully-supported `general-document` path
- legacy HTML visual-profile entries remain readable only as `safe-mode` fallback behavior

### 6.1 Required minimal behavior

A minimally conforming viewer should:

- read `manifest.json` from the package root
- surface at least `title`, `profile`, `entry`, and localization declarations when present
- fully open the current structured `general-document` baseline when the package and runtime both support it
- report reserved or restricted runtime states instead of pretending unsupported features are fully implemented
- preserve the truthful public readable path when safe fallback is possible

### 6.2 Network and sandbox baseline

For the minimal public opening path:

- a viewer must not require cloud fetches, payment checks, or live services
- a viewer may use networked product features later, but those do not define base conformance
- unsupported active/runtime features should degrade to the local public path when possible

### 6.3 Loading baseline

For the current executable foundation:

- conformance does not require streaming, range requests, worker unzip, partial unzip, or lazy section fetch
- `general-document` segmentation is a packaging rule, not a runtime lazy-loading contract
- collection and series metadata are grouping metadata, not a load graph
- attachments are supplemental and must not block the base open path
- the current reference viewer truthfully uses eager whole-package in-memory loading

Viewers may optimize beyond that later, but they must not imply those optimizations are already part of the core conformance baseline if they are not.

---

## 7. Runtime Declaration Shape

A viewer or renderer may publish a capability/conformance descriptor such as:

```json
{
  "viewerId": "reference-viewer",
  "viewerVersion": "0.1.0",
  "supportedProfiles": ["general-document", "comic", "storyboard"],
  "supported": [
    "general-document-structured-root",
    "base-entry-html"
  ],
  "supportStates": [
    "fully-supported",
    "safe-mode",
    "unsupported-required-capability"
  ],
  "safeMode": true,
  "referenceLoadMode": "eager-whole-package"
}
```

Rules:

- support claims must be testable against real fixtures
- declarations should prefer specific supported behaviors over vague marketing statements
- a viewer must not claim structured profile support if it only exposes raw file download or generic archive browsing
- `supportedProfiles` and `supported` are different surfaces and should not be collapsed into one ambiguous list
- `supportStates` should reflect the concrete labels the implementation currently emits

---

## 8. Support-State Labels

The following support-state labels are the current conformance vocabulary:

| Label | Meaning |
| --- | --- |
| `fully-supported` | the intended required path is supported and used |
| `partially-supported` | the base experience opens, but some optional declared behavior is unavailable |
| `safe-mode` | the package opens under a restricted or fallback path |
| `static-fallback` | a static snapshot or equivalent fallback path is used instead of the intended live path |
| `protected-unavailable` | protected/private material is unavailable while the public path remains readable |
| `unsupported-extension-ignored` | an optional unsupported extension was ignored without breaking the base path |
| `unsupported-required-capability` | the intended required behavior cannot be honored |
| `reserved-profile` | the profile is recognized by the architecture, but specialized runtime support is not implemented in this viewer yet |

Current reference viewer subset:

- `fully-supported`
- `safe-mode`
- `unsupported-required-capability`

### 8.1 Label usage rules

A conforming viewer should use these labels truthfully:

- use `fully-supported` only when the viewer is actually taking the intended supported path
- use `safe-mode` when opening through restricted HTML fallback, reduced behavior, or a similar constrained path
- use `reserved-profile` when a profile is known in canon but runtime support is intentionally not implemented yet
- use `unsupported-required-capability` when the package cannot be opened truthfully through the intended required path

---

## 9. Current Foundation Expectations

For the current PRD foundation milestone:

- structured `general-document` opening is the executable reference path
- HTML-backed `general-document` opening is a legacy or fallback path and should report `safe-mode`
- legacy bare `resume` profile usage may remain readable during migration, but it should not be treated as a canonical fully-supported profile identity
- structured `comic` opening is now a `fully-supported` baseline path
- structured `storyboard` opening is now a `fully-supported` baseline path
- legacy HTML `comic` packages may still open as `safe-mode`
- legacy HTML `storyboard` packages may still open as `safe-mode`

This keeps canon and implementation honest at the same time.

---

## 10. Conformance Test Guidance

Conformance fixtures should cover at least:

1. valid structured `general-document` package opens as `fully-supported`
2. legacy or fallback HTML package opens as `safe-mode` when a truthful fallback exists
3. valid structured `comic` package opens as `fully-supported`
4. valid structured `storyboard` package opens as `fully-supported`
5. missing required capability reports `unsupported-required-capability`
6. unsupported optional behavior degrades without breaking the base readable path

Tests should verify both:

- the runtime label
- the readable output path or fallback artifact that justified that label

### 10.1 Published reference-viewer corpus

The current repo now publishes a small executable runtime corpus for the reference viewer:

- manifest: `examples/runtime-conformance/runtime-conformance-manifest.json`
- runner: `pnpm runtime:conformance`
- summary artifact: `examples/dist/runtime-conformance-summary.json`

The published baseline currently covers:

1. validator-valid structured `general-document` opening as `fully-supported`
2. validator-valid structured `comic` opening as `fully-supported`
3. validator-valid structured `storyboard` opening as `fully-supported`
4. validator-valid legacy HTML `comic` opening as `safe-mode`
5. validator-valid custom unsupported entry opening as `unsupported-required-capability`

This corpus is explicitly scoped to the current `reference-viewer` baseline. It is a shared executable reference, not yet a universal certification program for all PRD runtimes.

---

## 11. Open Questions

- Should later conformance drafts define named conformance tiers beyond the current support-state vocabulary?
- Should renderer-only conformance be declared separately from full viewer conformance?
- When richer comic/storyboard presentation lands, what should justify `partially-supported` rather than `fully-supported` for those profiles?
