/**
 * Company: EonHive
 * Title: Release Smoke Script
 * Purpose: Validate publishable PRD packages from packed tarballs in clean temp projects before npm release.
 * Author: Stan Nesi
 * Created: 2026-04-10
 * Updated: 2026-04-12
 * Notes: Vibe coded with Codex.
 */

import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";

const repoRoot = process.cwd();
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const publishablePackages = [
  {
    name: "@eonhive/prd-types",
    directory: "packages/prd-types"
  },
  {
    name: "@eonhive/prd-validator",
    directory: "packages/prd-validator"
  },
  {
    name: "@eonhive/prd-packager",
    directory: "packages/prd-packager"
  },
  {
    name: "@eonhive/prd-cli",
    directory: "packages/prd-cli"
  }
];

function runCommand(command, args, options = {}) {
  const {
    cwd = repoRoot,
    capture = false,
    env
  } = options;

  return new Promise((resolvePromise, reject) => {
    const stdout = [];
    const stderr = [];
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        ...env
      },
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit"
    });

    if (capture) {
      child.stdout?.on("data", (chunk) => {
        stdout.push(String(chunk));
      });
      child.stderr?.on("data", (chunk) => {
        stderr.push(String(chunk));
      });
    }

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolvePromise({
          stdout: stdout.join(""),
          stderr: stderr.join("")
        });
        return;
      }

      reject(
        new Error(
          signal == null
            ? `Command failed: ${command} ${args.join(" ")} (exit ${code ?? "unknown"})`
            : `Command failed: ${command} ${args.join(" ")} (signal ${signal})`
        )
      );
    });
  });
}

function packageTarballPath(output, tarballDir) {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const tarballLine = [...lines]
    .reverse()
    .find((line) => line.endsWith(".tgz"));

  if (!tarballLine) {
    throw new Error("Could not determine tarball name from `pnpm pack` output.");
  }

  return isAbsolute(tarballLine) ? tarballLine : join(tarballDir, tarballLine);
}

async function packPublishablePackages(tarballDir) {
  const tarballs = {};

  for (const pkg of publishablePackages) {
    const { stdout } = await runCommand(
      pnpmCommand,
      ["pack", "--pack-destination", tarballDir],
      {
        cwd: join(repoRoot, pkg.directory),
        capture: true
      }
    );

    tarballs[pkg.name] = packageTarballPath(stdout, tarballDir);
  }

  return tarballs;
}

async function installSmokeProject(projectDir, tarballPaths, npmCacheDir) {
  await mkdir(projectDir, { recursive: true });
  await writeFile(
    join(projectDir, "package.json"),
    JSON.stringify(
      {
        name: "prd-release-smoke",
        private: true,
        type: "module"
      },
      null,
      2
    )
  );

  await runCommand(
    npmCommand,
    ["install", "--no-audit", "--no-fund", ...tarballPaths],
    {
      cwd: projectDir,
      env: {
        npm_config_cache: npmCacheDir
      }
    }
  );
}

async function writeAndRunNodeCheck(projectDir, fileName, source) {
  const checkPath = join(projectDir, fileName);
  await writeFile(checkPath, source);
  await runCommand(process.execPath, [checkPath], { cwd: projectDir });
}

async function main() {
  const scratchRoot = await mkdtemp(join(tmpdir(), "prd-release-smoke-"));
  const tarballDir = join(scratchRoot, "tarballs");
  const npmCacheDir = join(scratchRoot, "npm-cache");
  const exampleDocumentPath = resolve(repoRoot, "examples/document-basic");

  try {
    await mkdir(tarballDir, { recursive: true });
    await mkdir(npmCacheDir, { recursive: true });

    const tarballs = await packPublishablePackages(tarballDir);

    const typesProjectDir = join(scratchRoot, "types-project");
    await installSmokeProject(typesProjectDir, [tarballs["@eonhive/prd-types"]], npmCacheDir);
    await writeAndRunNodeCheck(
      typesProjectDir,
      "check-types.mjs",
      [
        'import { normalizeProfileId } from "@eonhive/prd-types";',
        'const result = normalizeProfileId("general-document");',
        'if (result.normalized !== "general-document") {',
        '  throw new Error("Failed to import @eonhive/prd-types from tarball.");',
        '}'
      ].join("\n")
    );

    const validatorProjectDir = join(scratchRoot, "validator-project");
    await installSmokeProject(validatorProjectDir, [
      tarballs["@eonhive/prd-types"],
      tarballs["@eonhive/prd-validator"]
    ], npmCacheDir);
    await writeAndRunNodeCheck(
      validatorProjectDir,
      "check-validator.mjs",
      [
        'import { validateManifestObject } from "@eonhive/prd-validator";',
        'import { validatePackageDirectory } from "@eonhive/prd-validator/node";',
        `const result = validateManifestObject(${JSON.stringify({
          prdVersion: "1.0",
          manifestVersion: "1.0",
          id: "urn:test:release-smoke",
          profile: "general-document",
          title: "Release Smoke",
          entry: "content/root.json"
        })});`,
        'if (!result.valid) {',
        '  throw new Error("Manifest validation failed in tarball smoke test.");',
        '}',
        `const packageResult = await validatePackageDirectory(${JSON.stringify(exampleDocumentPath)});`,
        'if (!packageResult.valid) {',
        '  throw new Error("Node validator entrypoint failed in tarball smoke test.");',
        '}'
      ].join("\n")
    );

    const packagerProjectDir = join(scratchRoot, "packager-project");
    await installSmokeProject(packagerProjectDir, [
      tarballs["@eonhive/prd-types"],
      tarballs["@eonhive/prd-validator"],
      tarballs["@eonhive/prd-packager"]
    ], npmCacheDir);
    await writeAndRunNodeCheck(
      packagerProjectDir,
      "check-packager.mjs",
      [
        'import { packDirectoryToBuffer } from "@eonhive/prd-packager";',
        `const archive = await packDirectoryToBuffer(${JSON.stringify(exampleDocumentPath)});`,
        'if (!(archive instanceof Uint8Array) || archive.byteLength === 0) {',
        '  throw new Error("Packager tarball smoke test did not produce an archive.");',
        '}'
      ].join("\n")
    );

    const cliProjectDir = join(scratchRoot, "cli-project");
    await installSmokeProject(cliProjectDir, [
      tarballs["@eonhive/prd-types"],
      tarballs["@eonhive/prd-validator"],
      tarballs["@eonhive/prd-packager"],
      tarballs["@eonhive/prd-cli"]
    ], npmCacheDir);
    await runCommand(
      process.execPath,
      [
        "./node_modules/@eonhive/prd-cli/dist/cli.js",
        "validate",
        exampleDocumentPath
      ],
      { cwd: cliProjectDir }
    );
  } finally {
    if (process.env.KEEP_RELEASE_SMOKE !== "1") {
      await rm(scratchRoot, { recursive: true, force: true });
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
