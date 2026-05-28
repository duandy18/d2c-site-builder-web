import type { JsonRecord, SlotSchema } from "./templateContentModel";

export type TemplateCatalogSlot = {
  slot_code: string;
  label: string;
  description: string;
  block_type: string;
  renderer_key: string;
  required: boolean;
  default_block_name: string;
  sort_order: number;
  content_schema: SlotSchema;
  presentation_schema: SlotSchema;
  default_content: JsonRecord;
  default_presentation: JsonRecord;
  validation: JsonRecord;
};

export type TemplateCatalogRegion = {
  template_region_code: string;
  label: string;
  description: string;
  required: boolean;
  default_region_name: string;
  sort_order: number;
  slots: TemplateCatalogSlot[];
};

export type TemplateCatalogItem = {
  template_key: string;
  template_name: string;
  surface_code: string;
  page_code: string;
  page_title: string;
  route_path: string;
  region_count: number;
  slot_count: number;
  field_count: number;
  regions: TemplateCatalogRegion[];
};

export type TemplateCatalogResponse = {
  templates: TemplateCatalogItem[];
};
