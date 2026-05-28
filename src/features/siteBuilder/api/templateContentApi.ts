import { siteBuilderGet, siteBuilderPatch } from "../../../shared/api/siteBuilderClient";

import type {
  PageContentFormResponse,
  SlotContentResponse,
  TemplateContentTarget,
  UpdateSlotContentRequest
} from "../model/templateContentModel";

const DEFAULT_SITE_CODE = "default";

function cleanPath(routePath: string): string[] {
  return routePath.split("/").filter(Boolean);
}

export function resolveTemplateContentTarget(routePath: string): TemplateContentTarget {
  const [surfaceSlug = "pc-web", pageSlug = "home"] = cleanPath(routePath);

  return {
    siteCode: DEFAULT_SITE_CODE,
    surfaceSlug,
    pageSlug
  };
}

function templateContentBase(target: TemplateContentTarget): string {
  return [
    "/admin/site-builder/sites",
    encodeURIComponent(target.siteCode),
    "surfaces",
    encodeURIComponent(target.surfaceSlug),
    "pages",
    encodeURIComponent(target.pageSlug)
  ].join("/");
}

export function fetchTemplateContentForm(
  target: TemplateContentTarget
): Promise<PageContentFormResponse> {
  return siteBuilderGet<PageContentFormResponse>(`${templateContentBase(target)}/content-form`);
}

export function updateTemplateSlotContent(
  target: TemplateContentTarget,
  slotCode: string,
  request: UpdateSlotContentRequest
): Promise<SlotContentResponse> {
  return siteBuilderPatch<SlotContentResponse, UpdateSlotContentRequest>(
    `${templateContentBase(target)}/contents/${encodeURIComponent(slotCode)}`,
    request
  );
}
