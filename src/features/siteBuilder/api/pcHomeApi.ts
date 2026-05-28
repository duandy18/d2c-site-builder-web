import type {
  PageContentFormResponse,
  SlotContentResponse,
  UpdateSlotContentRequest
} from "../model/templateContentModel";

import {
  fetchTemplateContentForm,
  updateTemplateSlotContent
} from "./templateContentApi";

const PC_HOME_TARGET = {
  siteCode: "default",
  surfaceSlug: "pc-web",
  pageSlug: "home"
};

export function fetchPcHomeContentForm(): Promise<PageContentFormResponse> {
  return fetchTemplateContentForm(PC_HOME_TARGET);
}

export function updatePcHomeSlotContent(
  slotCode: string,
  request: UpdateSlotContentRequest
): Promise<SlotContentResponse> {
  return updateTemplateSlotContent(PC_HOME_TARGET, slotCode, request);
}
