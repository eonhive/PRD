import {
  type ViewerRenderMode,
  getViewerRenderModeMessage,
  inferViewerRenderMode as inferViewerRenderModeCore
} from "@eonhive/prd-viewer-core";
import type {
  PrdComicRoot,
  PrdGeneralDocumentRoot,
  PrdOpenedDocument,
  PrdStoryboardRoot
} from "@eonhive/prd-types";

export type { ViewerRenderMode };
export { getViewerRenderModeMessage };

export function inferViewerRenderMode(
  opened: PrdOpenedDocument | undefined,
  entryDocument: PrdGeneralDocumentRoot | undefined,
  comicDocument: PrdComicRoot | undefined,
  storyboardDocument: PrdStoryboardRoot | undefined,
  renderedHtml: string | undefined
): ViewerRenderMode {
  return inferViewerRenderModeCore({
    opened,
    entryDocument,
    comicDocument,
    storyboardDocument,
    renderedHtml
  });
}
