import type { ComponentType } from "react";

import { PcWebHomeBuilderPage } from "../../features/siteBuilder/pages/PcWebHomeBuilderPage";
import { TemplateContentPage } from "../../features/siteBuilder/pages/TemplateContentPage";
import { TemplateCatalogPage } from "../../features/siteBuilder/pages/TemplateCatalogPage";
import { PcWebOverviewPage } from "../../features/siteBuilder/pages/PcWebOverviewPage";
import { SiteBuilderHomePage } from "../../features/siteBuilder/pages/SiteBuilderHomePage";
import type { SiteBuilderPageProps } from "../../features/siteBuilder/pages/PlaceholderPage";

export const siteBuilderComponentRegistry: Record<
  string,
  ComponentType<SiteBuilderPageProps>
> = {
  "site_builder.dashboard": SiteBuilderHomePage,
  "site_builder.pc_web.overview": PcWebOverviewPage,
  "site_builder.pc_web.home": PcWebHomeBuilderPage,
  "site_builder.pc_web.template_catalog": TemplateCatalogPage,
  "site_builder.pc_web.template_content": TemplateContentPage
};
