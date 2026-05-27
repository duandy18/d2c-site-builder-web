import type { ComponentType } from "react";

import { PcWebHomeBuilderPage } from "../../features/siteBuilder/pages/PcWebHomeBuilderPage";
import { TemplateCatalogPage } from "../../features/siteBuilder/pages/TemplateCatalogPage";
import { TemplateContentPage } from "../../features/siteBuilder/pages/TemplateContentPage";
import type { SiteBuilderPageProps } from "../../features/siteBuilder/pages/PlaceholderPage";

export const siteBuilderComponentRegistry: Record<
  string,
  ComponentType<SiteBuilderPageProps>
> = {
  "site_builder.template_catalog": TemplateCatalogPage,
  "site_builder.pc_web.home": PcWebHomeBuilderPage,
  "site_builder.pc_web.template_content": TemplateContentPage
};
