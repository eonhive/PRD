/**
 * Company: EonHive
 * Title: Foundation Gate Script Tests
 * Purpose: Verify foundation-gate summary generation and failure reporting without running the full repo gate.
 * Author: Stan Nesi
 * Created: 2026-04-16
 * Updated: 2026-04-16
 * Notes: Vibe coded with Codex.
 */

import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  foundationGateContractVersion,
  runFoundationGate
} from "./foundation-gate.mjs";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((path) => rm(path, { recursive: true, force: true })));
  tempDirs.length = 0;
});

async function createTempDir(prefix: string): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), prefix));
  tempDirs.push(directory);
  return directory;
}

describe("runFoundationGate", () => {
  it("writes a summary artifact for a passing custom gate", async () => {
    const repoRoot = await createTempDir("prd-foundation-gate-");
    const summaryPath = join(repoRoot, "summary.json");

    const result = await runFoundationGate({
      repoRoot,
      summaryPath,
      stdio: "pipe",
      steps: [
        {
          title: "Pass one",
          command: process.execPath,
          args: ["-e", "process.exit(0)"]
        },
        {
          title: "Pass two",
          command: process.execPath,
          args: ["-e", "process.exit(0)"]
        }
      ]
    });

    const writtenSummary = JSON.parse(await readFile(summaryPath, "utf8")) as {
      contractVersion: string;
      overallStatus: string;
      steps: Array<{ title: string; status: string; exitCode: number }>;
    };

    expect(result.overallStatus).toBe("passed");
    expect(writtenSummary.contractVersion).toBe(foundationGateContractVersion);
    expect(writtenSummary.overallStatus).toBe("passed");
    expect(writtenSummary.steps).toHaveLength(2);
    expect(writtenSummary.steps.every((step) => step.status === "passed")).toBe(true);
    expect(writtenSummary.steps.map((step) => step.title)).toEqual(["Pass one", "Pass two"]);
  });

  it("records the failing step and stops the custom gate", async () => {
    const repoRoot = await createTempDir("prd-foundation-gate-fail-");
    const summaryPath = join(repoRoot, "summary.json");

    const result = await runFoundationGate({
      repoRoot,
      summaryPath,
      stdio: "pipe",
      steps: [
        {
          title: "Pass first",
          command: process.execPath,
          args: ["-e", "process.exit(0)"]
        },
        {
          title: "Fail second",
          command: process.execPath,
          args: ["-e", "process.exit(3)"]
        },
        {
          title: "Skipped third",
          command: process.execPath,
          args: ["-e", "process.exit(0)"]
        }
      ]
    });

    const writtenSummary = JSON.parse(await readFile(summaryPath, "utf8")) as {
      overallStatus: string;
      steps: Array<{ title: string; status: string; exitCode: number }>;
    };

    expect(result.overallStatus).toBe("failed");
    expect(writtenSummary.overallStatus).toBe("failed");
    expect(writtenSummary.steps).toHaveLength(2);
    expect(writtenSummary.steps[1]).toMatchObject({
      title: "Fail second",
      status: "failed",
      exitCode: 3
    });
  });
});
