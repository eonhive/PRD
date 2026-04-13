import { describe, expect, it } from "vitest";
import type { PrdPackageReader } from "@eonhive/prd-types";
import { openPrdDocument } from "./index.js";

function createReader(files: Record<string, string>): PrdPackageReader {
  return {
    has(path) {
      return path in files;
    },
    readText(path) {
      const value = files[path];
      if (value === undefined) {
        throw new Error(`Missing file: ${path}`);
      }
      return value;
    },
    readBinary(path) {
      const value = files[path];
      if (value === undefined) {
        throw new Error(`Missing file: ${path}`);
      }
      return new TextEncoder().encode(value);
    }
  };
}

describe("openPrdDocument", () => {
  it("opens structured general-document entries", async () => {
    const document = await openPrdDocument(
      createReader({
        "manifest.json": JSON.stringify({
          prdVersion: "1.0",
          manifestVersion: "1.0",
          id: "urn:test:viewer-doc",
          profile: "general-document",
          title: "Doc",
          entry: "content/root.json"
        }),
        "content/root.json": JSON.stringify({
          schemaVersion: "1.0",
          profile: "general-document",
          type: "document",
          id: "doc",
          title: "Doc",
          children: [
            {
              type: "paragraph",
              text: "Structured document root"
            }
          ]
        })
      })
    );

    expect(document.supportState).toBe("fully-supported");
    expect(document.entryDocument?.title).toBe("Doc");
    expect(document.entryDocument?.children).toHaveLength(1);
  });

  it("opens resume-shaped structured general-document entries", async () => {
    const document = await openPrdDocument(
      createReader({
        "manifest.json": JSON.stringify({
          prdVersion: "1.0",
          manifestVersion: "1.0",
          id: "urn:test:viewer-resume",
          profile: "general-document",
          title: "Resume",
          entry: "content/root.json"
        }),
        "content/root.json": JSON.stringify({
          schemaVersion: "1.0",
          profile: "general-document",
          type: "document",
          id: "resume",
          title: "Resume",
          subtitle: "Avery Example",
          children: [
            {
              type: "section",
              id: "skills",
              title: "Skills",
              children: [
                {
                  type: "list",
                  style: "unordered",
                  items: ["TypeScript", "Validation"]
                }
              ]
            }
          ]
        })
      })
    );

    expect(document.supportState).toBe("fully-supported");
    expect(document.entryDocument?.title).toBe("Resume");
    expect(document.entryHtml).toBeUndefined();
  });

  it("keeps legacy HTML general-document entries readable in safe mode", async () => {
    const document = await openPrdDocument(
      createReader({
        "manifest.json": JSON.stringify({
          prdVersion: "1.0",
          manifestVersion: "1.0",
          id: "urn:test:viewer-doc-legacy-html",
          profile: "general-document",
          title: "Doc Legacy",
          entry: "content/index.html"
        }),
        "content/index.html": "<!doctype html><html><body>Doc Legacy</body></html>"
      })
    );

    expect(document.supportState).toBe("safe-mode");
    expect(document.entryHtml).toContain("Doc Legacy");
    expect(document.message).toContain("limited HTML fallback");
  });

  it("keeps legacy resume HTML entries readable in safe mode during migration", async () => {
    const document = await openPrdDocument(
      createReader({
        "manifest.json": JSON.stringify({
          prdVersion: "1.0",
          manifestVersion: "1.0",
          id: "urn:test:viewer-resume-legacy",
          profile: "resume",
          title: "Resume Legacy",
          entry: "content/index.html"
        }),
        "content/index.html": "<!doctype html><html><body>Resume Legacy</body></html>"
      })
    );

    expect(document.supportState).toBe("safe-mode");
    expect(document.entryHtml).toContain("Resume Legacy");
    expect(document.message).toContain("limited HTML fallback");
  });

  it("opens structured comic roots as fully-supported", async () => {
    const document = await openPrdDocument(
      createReader({
        "manifest.json": JSON.stringify({
          prdVersion: "1.0",
          manifestVersion: "1.0",
          id: "urn:test:viewer-comic",
          profile: "comic",
          title: "Comic",
          entry: "content/root.json"
        }),
        "content/root.json": JSON.stringify({
          schemaVersion: "1.0",
          profile: "comic",
          type: "comic",
          id: "comic",
          title: "Comic",
          panels: [
            {
              id: "panel-1",
              caption: "Opening panel"
            },
            {
              id: "panel-2",
              caption: "Closing panel"
            }
          ]
        })
      })
    );

    expect(document.supportState).toBe("fully-supported");
    expect(document.entryHtml).toBeUndefined();
    expect(document.comicDocument?.panels).toHaveLength(2);
    expect(document.comicDocument?.title).toBe("Comic");
  });

  it("opens legacy HTML comic packages in safe mode", async () => {
    const document = await openPrdDocument(
      createReader({
        "manifest.json": JSON.stringify({
          prdVersion: "1.0",
          manifestVersion: "1.0",
          id: "urn:test:viewer-comic-safe",
          profile: "comic",
          title: "Comic",
          entry: "content/index.html"
        }),
        "content/index.html": "<!doctype html><html><body>Comic</body></html>",
        "profiles/comic/panels.json": JSON.stringify({
          profile: "comic",
          panels: [
            {
              id: "panel-1",
              caption: "Opening panel"
            }
          ]
        })
      })
    );

    expect(document.supportState).toBe("safe-mode");
    expect(document.entryHtml).toContain("Comic");
    expect(document.comicDocument).toBeUndefined();
    expect(document.message).toContain("legacy HTML fallback");
  });

  it("opens structured storyboard roots as fully-supported", async () => {
    const document = await openPrdDocument(
      createReader({
        "manifest.json": JSON.stringify({
          prdVersion: "1.0",
          manifestVersion: "1.0",
          id: "urn:test:viewer-storyboard",
          profile: "storyboard",
          title: "Storyboard",
          entry: "content/root.json"
        }),
        "content/root.json": JSON.stringify({
          schemaVersion: "1.0",
          profile: "storyboard",
          type: "storyboard",
          id: "storyboard",
          title: "Storyboard",
          frames: [
            {
              id: "frame-1",
              notes: "Opening wide shot"
            },
            {
              id: "frame-2",
              notes: "Push into the reaction"
            }
          ]
        })
      })
    );

    expect(document.supportState).toBe("fully-supported");
    expect(document.entryHtml).toBeUndefined();
    expect(document.storyboardDocument?.frames).toHaveLength(2);
    expect(document.storyboardDocument?.title).toBe("Storyboard");
  });

  it("opens legacy HTML storyboard packages in safe mode", async () => {
    const document = await openPrdDocument(
      createReader({
        "manifest.json": JSON.stringify({
          prdVersion: "1.0",
          manifestVersion: "1.0",
          id: "urn:test:viewer-storyboard-safe",
          profile: "storyboard",
          title: "Storyboard",
          entry: "content/index.html"
        }),
        "content/index.html": "<!doctype html><html><body>Storyboard</body></html>",
        "profiles/storyboard/frames.json": JSON.stringify({
          profile: "storyboard",
          frames: [
            {
              id: "frame-1",
              notes: "Opening wide shot"
            }
          ]
        })
      })
    );

    expect(document.supportState).toBe("safe-mode");
    expect(document.entryHtml).toContain("Storyboard");
    expect(document.storyboardDocument).toBeUndefined();
    expect(document.message).toContain("legacy HTML fallback");
  });
});
