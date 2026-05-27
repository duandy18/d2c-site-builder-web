import { siteBuilderGet } from "../../../shared/api/siteBuilderClient";

import type { SiteBuilderNavigationResponse } from "../model/navigationModel";

export function fetchSiteBuilderNavigation(): Promise<SiteBuilderNavigationResponse> {
  return siteBuilderGet<SiteBuilderNavigationResponse>("/admin/site-builder/navigation");
}
