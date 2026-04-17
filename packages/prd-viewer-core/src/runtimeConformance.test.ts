/**
 * Company: EonHive
 * Title: Runtime Conformance Corpus Tests
 * Purpose: Verify the published runtime conformance fixture corpus against the current reference viewer.
 * Author: Stan Nesi
 * Created: 2026-04-16
 * Updated: 2026-04-16
 * Notes: Vibe coded with Codex.
 */

import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { validatePackage } from "@eonhive/prd-validator/node";
import { inferViewerRenderMode, openPrdDocument } from "./index.js";

const decoder = new TextDecoder();
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const runtimeManifestPath = resolve(
  repoRoot,
  "examples/runtime-conformance/runtime-conformance-manifest.json"
);

function createPackageReader(files: Record<string, Uint8Array>) {
  return {
    has(path: string) {
      return path in files;
    },
    readText(path: string) {
      const value = files[path];
      if (value === undefined) {
        throw new Error(`Missing file: ${path}`);
      }

      return decoder.decode(value);
    },
    readBinary(path: string) {
      const value = files[path];
      if (value === undefined) {
        throw new Error(`Missing file: ${path}`);
      }

      return value;
    }
  };
}

async function collectFiles(
  rootDir: string,
  currentDir = rootDir
): Promise<Record<string, Uint8Array>> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files: Record<string, Uint8Array> = {};

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const fullPath = join(currentDir, entry.name);

    if (entry.isDirectory()) {
      Object.assign(files, await collectFiles(rootDir, fullPath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const relPath = relative(rootDir, fullPath).split("\\").join("/");
    files[relPath] = new Uint8Array(await readFile(fullPath));
  }

  return files;
}

describe("runtime conformance corpus", () => {
  it("matches the published expected results for every runtime fixture", async () => {
    const manifest = JSON.parse(await readFile(runtimeManifestPath, "utf8")) as {
      fixtures: Array<{
        id: string;
        path: string;
        expected: {
          validation: {
            valid: boolean;
            warningCodes: string[];
          };
          runtime: {
            supportState: string;
            renderMode: string;
          };
        };
      }>;
    };

    for (const fixture of manifest.fixtures) {
      const validation = await validatePackage(resolve(repoRoot, fixture.path));
      const files = await collectFiles(resolve(repoRoot, fixture.path));
      const opened = await openPrdDocument(createPackageReader(files));
      const renderMode = inferViewerRenderMode({
        opened,
        entryDocument: opened.entryDocument,
        comicDocument: opened.comicDocument,
        storyboardDocument: opened.storyboardDocument,
        renderedHtml: opened.entryHtml
      });

      expect(validation.valid, fixture.id).toBe(fixture.expected.validation.valid);
      expect(
        validation.warnings.map((issue) => issue.code).sort(),
        fixture.id
      ).toEqual(
        [...fixture.expected.validation.warningCodes].sort()
      );
      expect(opened.supportState, fixture.id).toBe(fixture.expected.runtime.supportState);
      expect(renderMode, fixture.id).toBe(fixture.expected.runtime.renderMode);
    }
  });
});
