/**
 * Company: EonHive
 * Title: Foundation Gate Script
 * Purpose: Run the canonical PRD conformance gate and emit a machine-readable summary artifact.
 * Author: Stan Nesi
 * Created: 2026-04-16
 * Updated: 2026-04-16
 * Notes: Vibe coded with Codex.
 */

import { spawn } from "node:child_process";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

export const foundationGateContractVersion = "prd-foundation-gate-v0.1";
export const defaultFoundationGateSummaryPath = "examples/dist/foundation-gate-summary.json";
export const defaultFoundationGateSteps = [
  {
    title: "Build workspace",
    command: pnpmCommand,
    args: ["build"]
  },
  {
    title: "Run test suite",
    command: pnpmCommand,
    args: ["test"]
  },
  {
    title: "Check docs consistency",
    command: pnpmCommand,
    args: ["docs:check", "--", "--include-root-docs"]
  },
  {
    title: "Validate canonical examples",
    command: pnpmCommand,
    args: ["examples:validate"]
  },
  {
    title: "Run aggregate example smoke gate",
    command: pnpmCommand,
    args: ["examples:smoke", "--", "--json-summary"]
  }
];

function formatCommand(command, args) {
  return [command, ...args].join(" ");
}

function runStep(step, options) {
  const startedAt = Date.now();

  return new Promise((resolvePromise) => {
    const child = spawn(step.command, step.args, {
      cwd: options.cwd,
      stdio: options.stdio
    });

    child.on("error", (error) => {
      resolvePromise({
        title: step.title,
        command: formatCommand(step.command, step.args),
        exitCode: 1,
        durationMs: Date.now() - startedAt,
        status: "failed",
        errorMessage: error.message
      });
    });

    child.on("exit", (code, signal) => {
      resolvePromise({
        title: step.title,
        command: formatCommand(step.command, step.args),
        exitCode: code ?? 1,
        durationMs: Date.now() - startedAt,
        status: code === 0 ? "passed" : "failed",
        signal: signal ?? null
      });
    });
  });
}

async function discoverSmokeSummaryFiles(repoRoot) {
  const summaryDir = resolve(repoRoot, "examples/dist/smoke-summaries");

  try {
    const entries = await readdir(summaryDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => relative(repoRoot, resolve(summaryDir, entry.name)).split("\\").join("/"))
      .sort();
  } catch {
    return [];
  }
}

export async function runFoundationGate(options = {}) {
  const repoRoot = options.repoRoot ?? process.cwd();
  const summaryPath = resolve(
    repoRoot,
    options.summaryPath ?? defaultFoundationGateSummaryPath
  );
  const steps = options.steps ?? defaultFoundationGateSteps;
  const stdio = options.stdio ?? "inherit";
  const summary = {
    contractVersion: foundationGateContractVersion,
    generatedAt: new Date().toISOString(),
    overallStatus: "passed",
    steps: [],
    smokeSummaryFiles: []
  };

  await mkdir(dirname(summaryPath), { recursive: true });

  try {
    for (const step of steps) {
      const result = await runStep(step, { cwd: repoRoot, stdio });
      summary.steps.push(result);

      if (result.status !== "passed") {
        summary.overallStatus = "failed";
        break;
      }
    }
  } finally {
    summary.smokeSummaryFiles = await discoverSmokeSummaryFiles(repoRoot);
    await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  return {
    ...summary,
    summaryPath
  };
}

const currentPath = fileURLToPath(import.meta.url);
const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;

if (invokedPath === currentPath) {
  const result = await runFoundationGate();
  console.log(`FOUNDATION_GATE_SUMMARY_FILE: ${result.summaryPath}`);
  if (result.overallStatus !== "passed") {
    process.exitCode = 1;
  }
}
