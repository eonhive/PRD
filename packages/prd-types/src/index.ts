export const PRD_CANONICAL_DIRECTORIES = [
  "content",
  "assets",
  "profiles",
  "extensions",
  "protected"
] as const;

export const PRD_LOCALIZED_ENTRIES_PATH = "content/locales/index.json" as const;
export const PRD_GENERAL_DOCUMENT_SECTION_ENTRY_PREFIX =
  "content/sections/" as const;

export const PRD_CANONICAL_CORE_PROFILE_IDS = [
  "general-document",
  "comic",
  "storyboard"
] as const;

export const PRD_IMPLEMENTATION_SUPPORTED_PROFILE_IDS = [] as const;

export const PRD_VIEWER_SUPPORT_STATES = [
  "fully-supported",
  "partially-supported",
  "safe-mode",
  "static-fallback",
  "protected-unavailable",
  "unsupported-extension-ignored",
  "unsupported-required-capability",
  "reserved-profile"
] as const;

export const PRD_REFERENCE_LOAD_MODES = ["eager-whole-package"] as const;

export const PRD_LEGACY_PROFILE_ALIASES = {
  "responsive-document": "general-document"
} as const;

export type PrdCanonicalDirectory = (typeof PRD_CANONICAL_DIRECTORIES)[number];
export type PrdCanonicalCoreProfileId =
  (typeof PRD_CANONICAL_CORE_PROFILE_IDS)[number];
export type PrdImplementationSupportedProfileId =
  (typeof PRD_IMPLEMENTATION_SUPPORTED_PROFILE_IDS)[number];
export type PrdKnownProfileId =
  | PrdCanonicalCoreProfileId
  | PrdImplementationSupportedProfileId;
export type PrdTextDirection = "ltr" | "rtl" | "auto";
export type MaybePromise<T> = T | Promise<T>;

export type PrdProfileSupportClass =
  | "canonical-core"
  | "implementation-supported"
  | "legacy-alias"
  | "community-custom"
  | "unknown";

export type PrdViewerSupportState = (typeof PRD_VIEWER_SUPPORT_STATES)[number];
export type PrdReferenceLoadMode = (typeof PRD_REFERENCE_LOAD_MODES)[number];

export interface PrdRuntimeCapabilityDescriptor {
  viewerId: string;
  viewerVersion: string;
  supportedProfiles?: PrdKnownProfileId[];
  supported: string[];
  supportStates: PrdViewerSupportState[];
  safeMode: boolean;
  referenceLoadMode?: PrdReferenceLoadMode;
}

export interface PrdLocalization {
  defaultLocale: string;
  availableLocales?: string[];
  textDirection?: PrdTextDirection;
}

export interface PrdLocalizedContentDescriptor {
  label?: string;
  entry?: string;
  resource?: string;
}

export interface PrdLocalizedContentIndexRoot {
  $schema?: string;
  type: "localized-content-index";
  locales: Record<string, PrdLocalizedContentDescriptor>;
}

export interface PrdLocalizedDocumentOverridesRoot {
  $schema?: string;
  type: "localized-document-overrides";
  locale: string;
  document?: {
    title?: string;
    subtitle?: string;
    summary?: string;
    lang?: string;
  };
  public?: PrdLocalizedPublicMetadataOverrides;
  nodes?: Record<string, PrdLocalizedDocumentNodeOverride>;
}

export interface PrdLocalizedPublicMetadataOverrides {
  subtitle?: string;
  summary?: string;
  byline?: string;
  publisher?: string;
  cover?: string;
  series?: {
    title?: string;
  };
  collections?: Array<{
    title: string;
  }>;
}

export interface PrdLocalizedSectionOverride {
  type: "section";
  title?: string;
}

export interface PrdLocalizedHeadingOverride {
  type: "heading";
  text?: string;
}

export interface PrdLocalizedParagraphOverride {
  type: "paragraph";
  text?: string;
}

export interface PrdLocalizedListOverride {
  type: "list";
  items?: string[];
}

export interface PrdLocalizedLinksOverride {
  type: "links";
  items?: Array<{
    label: string;
  }>;
}

export interface PrdLocalizedTableOverride {
  type: "table";
  caption?: string;
  columns?: Array<{
    label: string;
  }>;
  rows?: Array<Record<string, string>>;
}

export interface PrdLocalizedChartOverride {
  type: "chart";
  title?: string;
  caption?: string;
  categories?: string[];
  series?: Array<{
    name: string;
  }>;
}

export interface PrdLocalizedMediaOverride {
  type: "media";
  caption?: string;
}

export interface PrdLocalizedImageOverride {
  type: "image";
  asset?: string;
  alt?: string;
  caption?: string;
}

export interface PrdLocalizedQuoteOverride {
  type: "quote";
  text?: string;
  attribution?: string;
}

export type PrdLocalizedDocumentNodeOverride =
  | PrdLocalizedSectionOverride
  | PrdLocalizedHeadingOverride
  | PrdLocalizedParagraphOverride
  | PrdLocalizedListOverride
  | PrdLocalizedLinksOverride
  | PrdLocalizedTableOverride
  | PrdLocalizedChartOverride
  | PrdLocalizedMediaOverride
  | PrdLocalizedImageOverride
  | PrdLocalizedQuoteOverride;

export interface PrdGeneralDocumentIdentifiedNode {
  id?: string;
}

export interface PrdCapabilityLists {
  required?: string[];
  optional?: string[];
}

export interface PrdCompatibility {
  minViewer?: string;
  capabilities?: string[] | PrdCapabilityLists;
  [key: string]: unknown;
}

export interface PrdExtensionDeclaration {
  id: string;
  version?: string;
  required?: boolean;
  ref?: string;
  [key: string]: unknown;
}

export interface PrdAssetDeclaration {
  id?: string;
  href: string;
  type?: string;
  [key: string]: unknown;
}

export interface PrdAttachmentDeclaration {
  href: string;
  id?: string;
  type?: string;
  [key: string]: unknown;
}

export interface PrdProtectedDeclaration {
  present?: boolean;
  ref?: string;
  [key: string]: unknown;
}

export interface PrdSeriesSequence {
  index?: number;
  volume?: number;
  issue?: number;
  chapter?: number;
  episode?: number;
  part?: number;
}

export interface PrdIdentitySeriesMembership {
  ref: string;
  sequence?: PrdSeriesSequence;
}

export interface PrdIdentityCollectionMembership {
  ref: string;
}

export interface PrdIdentity {
  revisionId?: string;
  parentId?: string;
  originId?: string;
  authorRefs?: string[];
  publisherRef?: string;
  ownerRef?: string;
  series?: PrdIdentitySeriesMembership;
  collections?: PrdIdentityCollectionMembership[];
  [key: string]: unknown;
}

export interface PrdPublicContributor {
  name: string;
  role: string;
  displayName?: string;
  [key: string]: unknown;
}

export interface PrdPublicSeriesMetadata {
  title: string;
  [key: string]: unknown;
}

export interface PrdPublicCollectionMetadata {
  title: string;
  [key: string]: unknown;
}

export interface PrdPublicMetadata {
  subtitle?: string;
  summary?: string;
  byline?: string;
  contributors?: PrdPublicContributor[];
  publisher?: string;
  genres?: string[];
  subgenres?: string[];
  tags?: string[];
  contentWarnings?: string[];
  contentRating?: string;
  status?: string;
  cover?: string;
  series?: PrdPublicSeriesMetadata;
  collections?: PrdPublicCollectionMetadata[];
  [key: string]: unknown;
}

export interface PrdGeneralDocumentRoot {
  $schema?: string;
  schemaVersion: string;
  profile: "general-document";
  type: "document";
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  lang?: string;
  children: PrdGeneralDocumentNode[];
}

export interface PrdGeneralDocumentInlineSectionNode {
  type: "section";
  id: string;
  title: string;
  children: PrdGeneralDocumentNode[];
  src?: never;
}

export interface PrdGeneralDocumentSegmentedSectionNode {
  type: "section";
  id: string;
  title: string;
  src: string;
  children?: never;
}

export type PrdGeneralDocumentSectionNode =
  | PrdGeneralDocumentInlineSectionNode
  | PrdGeneralDocumentSegmentedSectionNode;

export interface PrdGeneralDocumentHeadingNode
  extends PrdGeneralDocumentIdentifiedNode {
  type: "heading";
  level: number;
  text: string;
}

export interface PrdGeneralDocumentParagraphNode
  extends PrdGeneralDocumentIdentifiedNode {
  type: "paragraph";
  text: string;
}

export interface PrdGeneralDocumentListNode
  extends PrdGeneralDocumentIdentifiedNode {
  type: "list";
  style: "unordered" | "ordered";
  items: string[];
}

export interface PrdGeneralDocumentLinksItem {
  label: string;
  href: string;
}

export interface PrdGeneralDocumentLinksNode
  extends PrdGeneralDocumentIdentifiedNode {
  type: "links";
  style: "list" | "inline";
  items: PrdGeneralDocumentLinksItem[];
}

export interface PrdGeneralDocumentTableColumn {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
}

export interface PrdGeneralDocumentTableNode
  extends PrdGeneralDocumentIdentifiedNode {
  type: "table";
  caption?: string;
  columns: PrdGeneralDocumentTableColumn[];
  rows: Array<Record<string, string>>;
}

export interface PrdGeneralDocumentChartSeries {
  name: string;
  values: number[];
}

export interface PrdGeneralDocumentChartNode
  extends PrdGeneralDocumentIdentifiedNode {
  type: "chart";
  chartType: "bar";
  title?: string;
  caption?: string;
  categories: string[];
  series: PrdGeneralDocumentChartSeries[];
}

export interface PrdGeneralDocumentMediaNode
  extends PrdGeneralDocumentIdentifiedNode {
  type: "media";
  mediaType: "audio" | "video";
  asset: string;
  poster?: string;
  caption?: string;
}

export interface PrdGeneralDocumentImageNode
  extends PrdGeneralDocumentIdentifiedNode {
  type: "image";
  asset: string;
  alt: string;
  caption?: string;
}

export interface PrdGeneralDocumentQuoteNode
  extends PrdGeneralDocumentIdentifiedNode {
  type: "quote";
  text: string;
  attribution?: string;
}

export interface PrdGeneralDocumentSectionRoot {
  $schema?: string;
  schemaVersion: string;
  profile: "general-document";
  type: "document-section";
  id: string;
  title: string;
  children: PrdGeneralDocumentNode[];
}

export interface PrdComicPanel {
  id: string;
  asset: string;
  alt: string;
  caption?: string;
}

export interface PrdComicRoot {
  $schema?: string;
  schemaVersion: string;
  profile: "comic";
  type: "comic";
  id: string;
  title: string;
  panels: PrdComicPanel[];
}

export interface PrdStoryboardFrame {
  id: string;
  asset: string;
  alt: string;
  notes?: string;
}

export interface PrdStoryboardRoot {
  $schema?: string;
  schemaVersion: string;
  profile: "storyboard";
  type: "storyboard";
  id: string;
  title: string;
  frames: PrdStoryboardFrame[];
}

export type PrdComicPanelsRoot = PrdComicRoot;
export type PrdStoryboardFramesRoot = PrdStoryboardRoot;

export type PrdGeneralDocumentNode =
  | PrdGeneralDocumentSectionNode
  | PrdGeneralDocumentHeadingNode
  | PrdGeneralDocumentParagraphNode
  | PrdGeneralDocumentListNode
  | PrdGeneralDocumentLinksNode
  | PrdGeneralDocumentTableNode
  | PrdGeneralDocumentChartNode
  | PrdGeneralDocumentMediaNode
  | PrdGeneralDocumentImageNode
  | PrdGeneralDocumentQuoteNode;

export interface PrdManifest {
  prdVersion: string;
  manifestVersion: string;
  id: string;
  profile: string;
  title: string;
  entry: string;
  profileVersion?: string;
  identity?: PrdIdentity;
  public?: PrdPublicMetadata;
  compatibility?: PrdCompatibility;
  assets?: PrdAssetDeclaration[];
  attachments?: PrdAttachmentDeclaration[];
  localization?: PrdLocalization;
  extensions?: PrdExtensionDeclaration[] | Record<string, unknown>;
  protected?: PrdProtectedDeclaration;
  [key: string]: unknown;
}

export interface PrdValidationIssue {
  code: string;
  message: string;
  path?: string;
  severity: "error" | "warning";
}

export interface PrdValidationResult {
  valid: boolean;
  errors: PrdValidationIssue[];
  warnings: PrdValidationIssue[];
}

export interface PrdNormalizedProfileInfo {
  input: string;
  normalized: string;
  supportClass: PrdProfileSupportClass;
  canonical: boolean;
  supportedByReference: boolean;
  aliasUsed: boolean;
}

export interface PrdPackageReader {
  has(path: string): MaybePromise<boolean>;
  readText(path: string): MaybePromise<string>;
  readBinary(path: string): MaybePromise<Uint8Array>;
}

export interface PrdOpenedDocument {
  manifest: PrdManifest;
  profileInfo: PrdNormalizedProfileInfo;
  supportState: PrdViewerSupportState;
  entryPath: string;
  entryHtml?: string;
  entryDocument?: PrdGeneralDocumentRoot;
  comicDocument?: PrdComicRoot;
  storyboardDocument?: PrdStoryboardRoot;
  localization?: PrdLocalization;
  message?: string;
}

export function isCanonicalCoreProfileId(
  profile: string
): profile is PrdCanonicalCoreProfileId {
  return PRD_CANONICAL_CORE_PROFILE_IDS.includes(
    profile as PrdCanonicalCoreProfileId
  );
}

export function isImplementationSupportedProfileId(
  profile: string
): profile is PrdImplementationSupportedProfileId {
  return PRD_IMPLEMENTATION_SUPPORTED_PROFILE_IDS.includes(
    profile as PrdImplementationSupportedProfileId
  );
}

export function isKnownProfileId(profile: string): profile is PrdKnownProfileId {
  return (
    isCanonicalCoreProfileId(profile) ||
    isImplementationSupportedProfileId(profile)
  );
}

export function isNamespacedCustomProfile(profile: string): boolean {
  return /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(profile);
}

export function normalizeProfileId(profile: string): PrdNormalizedProfileInfo {
  const aliasTarget =
    PRD_LEGACY_PROFILE_ALIASES[
      profile as keyof typeof PRD_LEGACY_PROFILE_ALIASES
    ];

  if (aliasTarget) {
    return {
      input: profile,
      normalized: aliasTarget,
      supportClass: "legacy-alias",
      canonical: true,
      supportedByReference: true,
      aliasUsed: true
    };
  }

  if (isCanonicalCoreProfileId(profile)) {
    return {
      input: profile,
      normalized: profile,
      supportClass: "canonical-core",
      canonical: true,
      supportedByReference: true,
      aliasUsed: false
    };
  }

  if (isImplementationSupportedProfileId(profile)) {
    return {
      input: profile,
      normalized: profile,
      supportClass: "implementation-supported",
      canonical: false,
      supportedByReference: true,
      aliasUsed: false
    };
  }

  if (isNamespacedCustomProfile(profile)) {
    return {
      input: profile,
      normalized: profile,
      supportClass: "community-custom",
      canonical: false,
      supportedByReference: false,
      aliasUsed: false
    };
  }

  return {
    input: profile,
    normalized: profile,
    supportClass: "unknown",
    canonical: false,
    supportedByReference: false,
    aliasUsed: false
  };
}

export function getProfileDisplayLabel(profile: string): string {
  const normalized = normalizeProfileId(profile).normalized;
  switch (normalized) {
    case "general-document":
      return "Document";
    case "comic":
      return "Comic";
    case "storyboard":
      return "Storyboard";
    default:
      return normalized;
  }
}

export function isHtmlEntryPath(path: string): boolean {
  return path.endsWith(".html") || path.endsWith(".htm");
}

export function isJsonEntryPath(path: string): boolean {
  return path.endsWith(".json");
}
