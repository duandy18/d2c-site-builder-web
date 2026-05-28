import { siteBuilderGet } from "../../../shared/api/siteBuilderClient";

import type { PublishReadinessResponse } from "../model/publishReadinessModel";

const DEFAULT_SITE_CODE = "default";
const DEFAULT_SURFACE_ROUTE_CODE = "pc-web";

export function fetchPublishReadiness(
  pageRouteCode: string
): Promise<PublishReadinessResponse> {
  return siteBuilderGet<PublishReadinessResponse>(
    `/admin/site-builder/sites/${DEFAULT_SITE_CODE}/surfaces/${DEFAULT_SURFACE_ROUTE_CODE}/pages/${pageRouteCode}/publish-readiness`
  );
}
