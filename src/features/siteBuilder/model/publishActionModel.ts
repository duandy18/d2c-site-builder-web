import type { RuntimePageContractResponse } from "./runtimeContractModel";

export type PublishPageRequest = {
  published_by: string;
};

export type PublishPageResponse = {
  site_code: string;
  surface_code: string;
  page_code: string;
  template_key: string;
  publish_version: number;
  contract_version: string;
  published_by: string;
  published_at: string;
  snapshot: RuntimePageContractResponse;
};
