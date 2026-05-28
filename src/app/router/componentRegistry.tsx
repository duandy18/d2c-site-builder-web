import type { ComponentType } from "react";

import { PcWebHomeBuilderPage } from "../../features/siteBuilder/pages/PcWebHomeBuilderPage";
import { PublishPreviewPage } from "../../features/siteBuilder/pages/PublishPreviewPage";
import { TemplateCatalogPage } from "../../features/siteBuilder/pages/TemplateCatalogPage";
import { TemplateContentPage } from "../../features/siteBuilder/pages/TemplateContentPage";
import type { SiteBuilderPageProps } from "../../features/siteBuilder/pages/PlaceholderPage";

export const siteBuilderComponentRegistry: Record<
  string,
  ComponentType<SiteBuilderPageProps>
> = {
  "site_builder.template_catalog": TemplateCatalogPage,
  "site_builder.publish.preview": PublishPreviewPage,
  "site_builder.pc_web.home": PcWebHomeBuilderPage,
  "site_builder.pc_web.template_content": TemplateContentPage
};
