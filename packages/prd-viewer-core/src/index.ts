import {
  PRD_CANONICAL_CORE_PROFILE_IDS,
  type PrdComicRoot,
  type PrdGeneralDocumentRoot,
  type PrdOpenedDocument,
  type PrdPackageReader,
  type PrdManifest,
  type PrdRuntimeCapabilityDescriptor,
  type PrdStoryboardRoot,
  type PrdViewerSupportState,
  getProfileDisplayLabel,
  isHtmlEntryPath,
  isJsonEntryPath,
  normalizeProfileId
} from "@eonhive/prd-types";

export const PRD_REFERENCE_VIEWER_SUPPORTED_CAPABILITIES = [
  "general-document-structured-root",
  "base-entry-html"
] as const;

export const PRD_REFERENCE_VIEWER_SUPPORT_STATES = [
  "fully-supported",
  "safe-mode",
  "unsupported-required-capability"
] as const satisfies readonly PrdViewerSupportState[];

export type PrdReferenceViewerSupportState =
  (typeof PRD_REFERENCE_VIEWER_SUPPORT_STATES)[number];

export const PRD_REFERENCE_VIEWER_RUNTIME_DESCRIPTOR: PrdRuntimeCapabilityDescriptor = {
  viewerId: "reference-viewer",
  viewerVersion: "0.1.0",
  supportedProfiles: [...PRD_CANONICAL_CORE_PROFILE_IDS],
  supported: [...PRD_REFERENCE_VIEWER_SUPPORTED_CAPABILITIES],
  supportStates: [...PRD_REFERENCE_VIEWER_SUPPORT_STATES],
  safeMode: true,
  referenceLoadMode: "eager-whole-package"
};

function parseGeneralDocumentEntry(entryText: string): PrdGeneralDocumentRoot {
  return JSON.parse(entryText) as PrdGeneralDocumentRoot;
}

function parseComicEntry(entryText: string): PrdComicRoot {
  return JSON.parse(entryText) as PrdComicRoot;
}

function parseStoryboardEntry(entryText: string): PrdStoryboardRoot {
  return JSON.parse(entryText) as PrdStoryboardRoot;
}

export async function openPrdDocument(
  packageReader: PrdPackageReader
): Promise<PrdOpenedDocument> {
  const manifestText = await packageReader.readText("manifest.json");
  const manifest = JSON.parse(manifestText) as PrdManifest;
  const profileInfo = normalizeProfileId(manifest.profile);
  const normalizedManifest = {
    ...manifest,
    profile: profileInfo.normalized
  };

  if (
    profileInfo.normalized === "general-document" &&
    isJsonEntryPath(normalizedManifest.entry)
  ) {
    const entryDocument = parseGeneralDocumentEntry(
      await packageReader.readText(normalizedManifest.entry)
    );

    return {
      manifest: normalizedManifest,
      profileInfo,
      supportState: "fully-supported",
      entryPath: normalizedManifest.entry,
      entryDocument,
      localization: normalizedManifest.localization
    };
  }

  if (profileInfo.normalized === "comic") {
    if (isJsonEntryPath(normalizedManifest.entry)) {
      const comicDocument = parseComicEntry(
        await packageReader.readText(normalizedManifest.entry)
      );

      return {
        manifest: normalizedManifest,
        profileInfo,
        supportState: "fully-supported",
        entryPath: normalizedManifest.entry,
        comicDocument,
        localization: normalizedManifest.localization
      };
    }

    if (!isHtmlEntryPath(normalizedManifest.entry)) {
      return {
        manifest: normalizedManifest,
        profileInfo,
        supportState: "unsupported-required-capability",
        entryPath: normalizedManifest.entry,
        localization: normalizedManifest.localization,
        message:
          "The current reference viewer supports structured `comic` JSON roots and limited HTML fallback paths."
      };
    }

    const entryHtml = await packageReader.readText(normalizedManifest.entry);

    return {
      manifest: normalizedManifest,
      profileInfo,
      supportState: "safe-mode",
      entryPath: normalizedManifest.entry,
      entryHtml,
      localization: normalizedManifest.localization,
      message:
        "Opened through a legacy HTML fallback path. Structured `comic` JSON roots are now the canonical fully-supported path in the reference viewer."
    };
  }

  if (profileInfo.normalized === "storyboard") {
    if (isJsonEntryPath(normalizedManifest.entry)) {
      const storyboardDocument = parseStoryboardEntry(
        await packageReader.readText(normalizedManifest.entry)
      );

      return {
        manifest: normalizedManifest,
        profileInfo,
        supportState: "fully-supported",
        entryPath: normalizedManifest.entry,
        storyboardDocument,
        localization: normalizedManifest.localization
      };
    }

    if (!isHtmlEntryPath(normalizedManifest.entry)) {
      return {
        manifest: normalizedManifest,
        profileInfo,
        supportState: "unsupported-required-capability",
        entryPath: normalizedManifest.entry,
        localization: normalizedManifest.localization,
        message:
          "The current reference viewer supports structured `storyboard` JSON roots and limited HTML fallback paths."
      };
    }

    const entryHtml = await packageReader.readText(normalizedManifest.entry);

    return {
      manifest: normalizedManifest,
      profileInfo,
      supportState: "safe-mode",
      entryPath: normalizedManifest.entry,
      entryHtml,
      localization: normalizedManifest.localization,
      message:
        "Opened through a legacy HTML fallback path. Structured `storyboard` JSON roots are now the canonical fully-supported path in the reference viewer."
    };
  }

  if (!isHtmlEntryPath(normalizedManifest.entry)) {
    return {
      manifest: normalizedManifest,
      profileInfo,
      supportState: "unsupported-required-capability",
      entryPath: normalizedManifest.entry,
      localization: normalizedManifest.localization,
      message:
        "The current reference viewer supports structured `general-document` JSON roots and limited HTML fallback paths."
    };
  }

  const entryHtml = await packageReader.readText(normalizedManifest.entry);

  return {
    manifest: normalizedManifest,
    profileInfo,
    supportState: "safe-mode",
    entryPath: normalizedManifest.entry,
    entryHtml,
    localization: normalizedManifest.localization,
    message:
      "Opened through a limited HTML fallback path. Structured `general-document` JSON roots remain the canonical fully-supported path in the reference viewer."
  };
}


export type ViewerRenderMode =
  | "structured-json-rendered"
  | "html-fallback-rendered"
  | "unsupported-entry-mode";

export type InferViewerRenderModeInput = {
  opened?: PrdOpenedDocument;
  entryDocument?: PrdGeneralDocumentRoot;
  comicDocument?: PrdComicRoot;
  storyboardDocument?: PrdStoryboardRoot;
  renderedHtml?: string;
};

/**
 * Canonical viewer render-mode classifier shared by web and other viewer surfaces.
 */
export function inferViewerRenderMode({
  opened,
  entryDocument,
  comicDocument,
  storyboardDocument,
  renderedHtml
}: InferViewerRenderModeInput): ViewerRenderMode {
  if (!opened || opened.supportState === "unsupported-required-capability") {
    return "unsupported-entry-mode";
  }

  if (entryDocument || comicDocument || storyboardDocument) {
    return "structured-json-rendered";
  }

  if (renderedHtml) {
    return "html-fallback-rendered";
  }

  return "unsupported-entry-mode";
}

export function getViewerRenderModeMessage(renderMode: ViewerRenderMode): string {
  if (renderMode === "structured-json-rendered") {
    return "Structured JSON entry rendered. This package can be valid and the current viewer can render its canonical structured path.";
  }

  if (renderMode === "html-fallback-rendered") {
    return "HTML fallback entry rendered. Package validity comes from the validator above; this rendering mode reflects legacy fallback behavior in the viewer.";
  }

  return "Unsupported entry mode detected for this viewer. The package may still be validator-valid, but this viewer cannot render the declared entry path/capability.";
}
