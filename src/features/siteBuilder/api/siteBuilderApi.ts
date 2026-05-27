import { siteBuilderGet } from "../../../shared/api/siteBuilderClient";

import type { HealthResponse } from "../model/siteBuilderModel";

export function fetchAdminHealth(): Promise<HealthResponse> {
  return siteBuilderGet<HealthResponse>("/admin/site-builder/health");
}
