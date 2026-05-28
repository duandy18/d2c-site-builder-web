import { siteBuilderGet } from "../../../shared/api/siteBuilderClient";

import type { RuntimePageContractResponse } from "../model/runtimeContractModel";

const DEFAULT_SITE_CODE = "default";
const DEFAULT_SURFACE_ROUTE_CODE = "pc-web";

export function fetchRuntimePageContract(
  pageRouteCode: string
): Promise<RuntimePageContractResponse> {
  return siteBuilderGet<RuntimePageContractResponse>(
    `/runtime/site-builder/sites/${DEFAULT_SITE_CODE}/surfaces/${DEFAULT_SURFACE_ROUTE_CODE}/pages/${pageRouteCode}`
  );
}
