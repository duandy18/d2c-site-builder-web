import { siteBuilderGet } from "../../../shared/api/siteBuilderClient";

import type { TemplateCatalogResponse } from "../model/templateCatalogModel";

export function fetchTemplateCatalog(): Promise<TemplateCatalogResponse> {
  return siteBuilderGet<TemplateCatalogResponse>("/admin/site-builder/templates");
}
