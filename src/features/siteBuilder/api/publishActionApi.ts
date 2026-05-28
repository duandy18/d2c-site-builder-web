import { siteBuilderPost } from "../../../shared/api/siteBuilderClient";

import type { PublishPageRequest, PublishPageResponse } from "../model/publishActionModel";

const DEFAULT_SITE_CODE = "default";
const DEFAULT_SURFACE_ROUTE_CODE = "pc-web";

export function publishPageSnapshot(
  pageRouteCode: string,
  request: PublishPageRequest
): Promise<PublishPageResponse> {
  return siteBuilderPost<PublishPageResponse, PublishPageRequest>(
    `/admin/site-builder/sites/${DEFAULT_SITE_CODE}/surfaces/${DEFAULT_SURFACE_ROUTE_CODE}/pages/${pageRouteCode}/publish`,
    request
  );
}
