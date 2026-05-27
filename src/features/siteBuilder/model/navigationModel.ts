export type SiteBuilderPageStatus = "connected" | "planned" | "disabled";

export type SiteBuilderPageNode = {
  page_code: string;
  title: string;
  parent_code: string | null;
  level: number;
  route_path: string;
  component_key: string;
  show_in_sidebar: boolean;
  sort_order: number;
  status: SiteBuilderPageStatus;
  is_active: boolean;
  children: SiteBuilderPageNode[];
};

export type SiteBuilderNavigationResponse = {
  app_code: string;
  pages: SiteBuilderPageNode[];
};
