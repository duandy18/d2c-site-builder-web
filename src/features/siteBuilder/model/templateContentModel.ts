export type JsonRecord = Record<string, unknown>;

export type SchemaField = {
  required?: boolean;
  type?: string;
  label?: string;
  default?: unknown;
  options?: unknown[];
  [key: string]: unknown;
};

export type SlotSchema = {
  fields?: Record<string, SchemaField>;
  [key: string]: unknown;
};

export type PageContentSlot = {
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
  block_code: string | null;
  status: string | null;
  content: JsonRecord;
  presentation: JsonRecord;
};

export type PageContentRegionGroup = {
  template_region_code: string;
  label: string;
  description: string;
  required: boolean;
  default_region_name: string;
  sort_order: number;
  slots: PageContentSlot[];
};

export type PageContentFormResponse = {
  site_code: string;
  surface_code: string;
  page_code: string;
  page_title: string;
  template_key: string;
  template_name: string;
  groups: PageContentRegionGroup[];
};

export type UpdateSlotContentRequest = {
  content: JsonRecord;
  presentation: JsonRecord;
};

export type SlotContentResponse = {
  slot_code: string;
  block_code: string;
  block_type: string;
  renderer_key: string;
  content: JsonRecord;
  presentation: JsonRecord;
  status: string;
};

export type TemplateContentTarget = {
  siteCode: string;
  surfaceSlug: string;
  pageSlug: string;
};
