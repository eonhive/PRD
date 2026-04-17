/**
 * Company: EonHive
 * Title: Runtime Conformance Check Script
 * Purpose: Run the published runtime conformance corpus against the current reference viewer baseline.
 * Author: Stan Nesi
 * Created: 2026-04-16
 * Updated: 2026-04-16
 * Notes: Vibe coded with Codex.
 */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const decoder = new TextDecoder();

export const runtimeConformanceContractVersion = "prd-runtime-conformance-v0.1";
export const defaultRuntimeConformanceManifestPath =
  "examples/runtime-conformance/runtime-conformance-manifest.json";
export const defaultRuntimeConformanceSummaryPath =
  "examples/dist/runtime-conformance-summary.json";

let cachedRuntimeModules;

async function loadRuntimeModules(repoRoot) {
  if (cachedRuntimeModules !== undefined) {
    return cachedRuntimeModules;
  }

  const viewerCoreModule = await import(
    pathToFileURL(resolve(repoRoot, "packages/prd-viewer-core/dist/index.js")).href
  );
  const validatorNodeModule = await import(
    pathToFileURL(resolve(repoRoot, "packages/prd-validator/dist/node.js")).href
  );

  cachedRuntimeModules = {
    inferViewerRenderMode: viewerCoreModule.inferViewerRenderMode,
    openPrdDocument: viewerCoreModule.openPrdDocument,
    validatePackage: validatorNodeModule.validatePackage
  };

  return cachedRuntimeModules;
}

function createPackageReader(files) {
  return {
    has(path) {
      return path in files;
    },
    readText(path) {
      const value = files[path];
      if (value === undefined) {
        throw new Error(`Missing file: ${path}`);
      }

      return decoder.decode(value);
    },
    readBinary(path) {
      const value = files[path];
      if (value === undefined) {
        throw new Error(`Missing file: ${path}`);
      }

      return value;
    }
  };
}

async function collectFiles(rootDir, currentDir = rootDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = {};

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

function normalizeWarningCodes(warnings) {
  return warnings.map((issue) => issue.code).sort();
}

function normalizeExpectedWarningCodes(warningCodes) {
  return [...warningCodes].sort();
}

function arraysEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

export async function loadRuntimeConformanceManifest(options = {}) {
  const repoRoot = options.repoRoot ?? process.cwd();
  const manifestPath = resolve(
    repoRoot,
    options.manifestPath ?? defaultRuntimeConformanceManifestPath
  );
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  return {
    manifestPath,
    manifest
  };
}

export async function evaluateRuntimeConformanceFixture(fixture, options = {}) {
  const repoRoot = options.repoRoot ?? process.cwd();
  const targetPath = resolve(repoRoot, fixture.path);
  const { inferViewerRenderMode, openPrdDocument, validatePackage } =
    await loadRuntimeModules(repoRoot);
  const validation = await validatePackage(targetPath);
  const actual = {
    validation: {
      valid: validation.valid,
      warningCodes: normalizeWarningCodes(validation.warnings)
    },
    runtime: {
      supportState: null,
      renderMode: null
    }
  };
  let status = "passed";
  let errorMessage;

  try {
    const files = await collectFiles(targetPath);
    const opened = await openPrdDocument(createPackageReader(files));
    actual.runtime.supportState = opened.supportState;
    actual.runtime.renderMode = inferViewerRenderMode({
      opened,
      entryDocument: opened.entryDocument,
      comicDocument: opened.comicDocument,
      storyboardDocument: opened.storyboardDocument,
      renderedHtml: opened.entryHtml
    });
  } catch (error) {
    status = "failed";
    errorMessage = error instanceof Error ? error.message : String(error);
  }

  const expectedWarningCodes = normalizeExpectedWarningCodes(
    fixture.expected.validation.warningCodes
  );

  if (
    actual.validation.valid !== fixture.expected.validation.valid ||
    !arraysEqual(actual.validation.warningCodes, expectedWarningCodes) ||
    actual.runtime.supportState !== fixture.expected.runtime.supportState ||
    actual.runtime.renderMode !== fixture.expected.runtime.renderMode
  ) {
    status = "failed";
  }

  return {
    id: fixture.id,
    path: fixture.path,
    expected: {
      validation: {
        valid: fixture.expected.validation.valid,
        warningCodes: expectedWarningCodes
      },
      runtime: fixture.expected.runtime
    },
    actual,
    status,
    ...(errorMessage ? { errorMessage } : {})
  };
}

export async function runRuntimeConformanceCheck(options = {}) {
  const repoRoot = options.repoRoot ?? process.cwd();
  const summaryPath = resolve(
    repoRoot,
    options.summaryPath ?? defaultRuntimeConformanceSummaryPath
  );
  const { manifest } = await loadRuntimeConformanceManifest({
    repoRoot,
    manifestPath: options.manifestPath
  });
  const summary = {
    contractVersion: manifest.contractVersion,
    runtimeId: manifest.runtimeId,
    status: "passed",
    fixtures: []
  };

  await mkdir(dirname(summaryPath), { recursive: true });

  for (const fixture of manifest.fixtures) {
    const result = await evaluateRuntimeConformanceFixture(fixture, { repoRoot });
    summary.fixtures.push(result);

    if (result.status !== "passed") {
      summary.status = "failed";
    }
  }

  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  return {
    ...summary,
    summaryPath
  };
}

const currentPath = fileURLToPath(import.meta.url);
const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;

if (invokedPath === currentPath) {
  const result = await runRuntimeConformanceCheck();
  console.log(`RUNTIME_CONFORMANCE_SUMMARY_FILE: ${result.summaryPath}`);
  if (result.status !== "passed") {
    process.exitCode = 1;
  }
}
