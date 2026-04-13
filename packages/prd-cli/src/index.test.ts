/**
 * Company: EonHive
 * Title: PRD CLI Inspection Tests
 * Purpose: Keep `prd inspect` distinct from `prd validate` by asserting its text and JSON inspection output.
 * Author: Stan Nesi
 * Created: 2026-04-12
 * Updated: 2026-04-12
 * Notes: Vibe coded with Codex.
 */

import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runCli } from "./index.js";

async function createMinimalPackageFixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "prd-cli-inspect-"));
  await mkdir(join(root, "content"), { recursive: true });
  await mkdir(join(root, "assets/images"), { recursive: true });
  await mkdir(join(root, "attachments"), { recursive: true });

  await writeFile(
    join(root, "manifest.json"),
    JSON.stringify({
      prdVersion: "1.0",
      manifestVersion: "1.0",
      id: "urn:test:cli-inspect",
      profile: "general-document",
      title: "CLI Inspect Fixture",
      entry: "content/root.json",
      assets: [
        {
          id: "cover",
          href: "assets/images/cover.svg",
          type: "image/svg+xml"
        }
      ],
      attachments: [
        {
          id: "notes",
          href: "attachments/notes.txt",
          type: "text/plain"
        }
      ]
    }),
    "utf8"
  );
  await writeFile(
    join(root, "content/root.json"),
    JSON.stringify({
      schemaVersion: "1.0",
      profile: "general-document",
      type: "document",
      id: "cli-inspect",
      title: "CLI Inspect Fixture",
      children: [
        {
          type: "paragraph",
          text: "Inspection should report package facts."
        }
      ]
    }),
    "utf8"
  );
  await writeFile(
    join(root, "assets/images/cover.svg"),
    "<svg xmlns=\"http://www.w3.org/2000/svg\" />",
    "utf8"
  );
  await writeFile(join(root, "attachments/notes.txt"), "notes", "utf8");

  return root;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runCli", () => {
  it("prints a compact inspection block for `prd inspect`", async () => {
    const root = await createMinimalPackageFixture();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      const exitCode = await runCli(["inspect", root]);

      expect(exitCode).toBe(0);
      expect(errorSpy).not.toHaveBeenCalled();

      const output = logSpy.mock.calls.map(([value]) => String(value)).join("\n");
      expect(output).toContain("valid: yes");
      expect(output).toContain("inspection:");
      expect(output).toContain("- source: directory");
      expect(output).toContain("- files: 4");
      expect(output).toContain("- attachments: 1");
      expect(output).toContain("- reference load mode: eager-whole-package");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("returns structured JSON for `prd inspect --json`", async () => {
    const root = await createMinimalPackageFixture();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    try {
      const exitCode = await runCli(["inspect", root, "--json"]);

      expect(exitCode).toBe(0);

      const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0])) as {
        sourceKind: string;
        fileCount: number;
        entryKind: string;
        referenceLoadMode: string;
      };

      expect(payload.sourceKind).toBe("directory");
      expect(payload.fileCount).toBe(4);
      expect(payload.entryKind).toBe("structured-json");
      expect(payload.referenceLoadMode).toBe("eager-whole-package");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
