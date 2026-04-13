/**
 * Company: EonHive
 * Title: Release Bootstrap Script
 * Purpose: Publish the current unpublished 0.1.0 PRD preview packages before normal Changesets releases take over.
 * Author: Stan Nesi
 * Created: 2026-04-12
 * Updated: 2026-04-12
 * Notes: Vibe coded with Codex.
 */

import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const repoRoot = process.cwd();
const previewVersion = "0.1.0";
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const shouldPublish = process.argv.includes("--publish");

const publishablePackages = [
  "packages/prd-types",
  "packages/prd-validator",
  "packages/prd-packager",
  "packages/prd-cli"
];

async function readJson(relativePath) {
  const raw = await readFile(join(repoRoot, relativePath), "utf8");
  return JSON.parse(raw);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? repoRoot,
      env: {
        ...process.env,
        ...options.env
      },
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolvePromise();
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

async function fetchRegistryDocument(packageName) {
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
    {
      headers: {
        accept: "application/json"
      }
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to query npm registry for ${packageName}: HTTP ${response.status}`);
  }

  return response.json();
}

async function loadPackageMetadata() {
  const packages = [];

  for (const directory of publishablePackages) {
    const manifest = await readJson(join(directory, "package.json"));
    packages.push({
      directory,
      name: manifest.name,
      version: manifest.version
    });
  }

  return packages;
}

async function loadPublishStatus(pkg) {
  const registryDocument = await fetchRegistryDocument(pkg.name);

  return {
    ...pkg,
    published: registryDocument?.versions?.[pkg.version] != null
  };
}

async function publishPackage(pkg) {
  console.log(`Publishing ${pkg.name}@${pkg.version} from ${pkg.directory}`);

  await runCommand(
    pnpmCommand,
    [
      "publish",
      "--access",
      "public",
      "--no-git-checks"
    ],
    {
      cwd: join(repoRoot, pkg.directory)
    }
  );
}

async function main() {
  const packages = await loadPackageMetadata();
  const versions = new Set(packages.map((pkg) => pkg.version));

  if (versions.size !== 1 || !versions.has(previewVersion)) {
    console.log(
      `Bootstrap publish applies only to the first ${previewVersion} public preview. Current workspace versions: ${[...versions].join(", ")}`
    );
    return;
  }

  const statuses = [];

  for (const pkg of packages) {
    statuses.push(await loadPublishStatus(pkg));
  }

  const missingPackages = statuses.filter((pkg) => !pkg.published);

  if (missingPackages.length === 0) {
    console.log("All preview packages are already published. Bootstrap publish not needed.");
    return;
  }

  console.log("Missing preview packages:");
  for (const pkg of missingPackages) {
    console.log(`- ${pkg.name}@${pkg.version}`);
  }

  if (!shouldPublish) {
    console.log("Run with --publish to publish the missing preview packages.");
    return;
  }

  if (!process.env.NPM_TOKEN) {
    throw new Error("NPM_TOKEN is required when running bootstrap publish.");
  }

  for (const pkg of statuses) {
    if (pkg.published) {
      console.log(`Skipping ${pkg.name}@${pkg.version}; it is already published.`);
      continue;
    }

    await publishPackage(pkg);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
