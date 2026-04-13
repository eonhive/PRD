import {
  type PrdComicRoot,
  type PrdGeneralDocumentRoot,
  type PrdOpenedDocument,
  type PrdPackageReader,
  type PrdManifest,
  type PrdStoryboardRoot,
  getProfileDisplayLabel,
  isHtmlEntryPath,
  isJsonEntryPath,
  normalizeProfileId
} from "@eonhive/prd-types";

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
