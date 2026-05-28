export type JsonRecord = Record<string, unknown>;

export type RuntimeBlockStatus = "active" | "empty" | "disabled";

export type RuntimeBlockContract = {
  slot_code: string;
  block_code: string;
  block_type: string;
  renderer_key: string;
  required: boolean;
  sort_order: number;
  status: RuntimeBlockStatus;
  is_filled: boolean;
  content: JsonRecord;
  presentation: JsonRecord;
};

export type RuntimeRegionContract = {
  template_region_code: string;
  region_code: string;
  region_name: string;
  required: boolean;
  sort_order: number;
  status: RuntimeBlockStatus;
  blocks: RuntimeBlockContract[];
};

export type RuntimePageContractResponse = {
  contract_type: "site_builder.page";
  contract_version: string;
  site_code: string;
  surface_code: string;
  page_code: string;
  page_title: string;
  template_key: string;
  template_name: string;
  status: "draft_preview" | "published";
  regions: RuntimeRegionContract[];
};
