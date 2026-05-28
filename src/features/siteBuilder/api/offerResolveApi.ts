import { siteBuilderGet } from "../../../shared/api/siteBuilderClient";

import type { OfferResolveResponse } from "../model/offerResolveModel";

export function resolveOfferForProductGrid(
  offerCode: string
): Promise<OfferResolveResponse> {
  return siteBuilderGet<OfferResolveResponse>(
    `/admin/site-builder/offers/${encodeURIComponent(offerCode)}/resolve`
  );
}
