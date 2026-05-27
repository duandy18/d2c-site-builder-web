export type JsonRecord = Record<string, unknown>;

export type OptionItem = {
  value: string;
  label: string;
  description: string;
};

export type ContentField = {
  field_key: string;
  label: string;
  field_type: string;
  value_type: string;
  editor_type: string;
  required: boolean;
  placeholder: string | null;
  help_text: string | null;
  options: OptionItem[];
  item_fields: ContentField[];
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
  content_fields: ContentField[];
  block_code: string | null;
  status: string | null;
  content: JsonRecord;
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
};

export type SlotContentResponse = {
  slot_code: string;
  block_code: string;
  block_type: string;
  renderer_key: string;
  content: JsonRecord;
  status: string;
};

export type TemplateContentTarget = {
  siteCode: string;
  surfaceSlug: string;
  pageSlug: string;
};
