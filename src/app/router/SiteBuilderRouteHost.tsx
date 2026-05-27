import { Navigate, useLocation } from "react-router-dom";

import type { SiteBuilderNavigationResponse } from "../../features/siteBuilder/model/navigationModel";
import { PlaceholderPage } from "../../features/siteBuilder/pages/PlaceholderPage";

import { siteBuilderComponentRegistry } from "./componentRegistry";
import { findFirstLeafPath, findPageByPath, normalizePath } from "./navigationUtils";

type SiteBuilderRouteHostProps = {
  navigation: SiteBuilderNavigationResponse | null;
  isLoading: boolean;
  error: string | null;
};

export function SiteBuilderRouteHost({
  navigation,
  isLoading,
  error
}: SiteBuilderRouteHostProps) {
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="sb-page">
        <section className="sb-card">正在加载 Site Builder 页面目录...</section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sb-page">
        <section className="sb-card sb-error">页面目录加载失败：{error}</section>
      </div>
    );
  }

  const activePage = navigation ? findPageByPath(navigation.pages, location.pathname) : null;

  if (!activePage) {
    return (
      <div className="sb-page">
        <section className="sb-card sb-error">页面不存在：{location.pathname}</section>
      </div>
    );
  }

  if (activePage.component_key === "layout.group") {
    const nextPath = findFirstLeafPath(activePage);

    if (nextPath && normalizePath(nextPath) !== normalizePath(location.pathname)) {
      return <Navigate to={nextPath} replace />;
    }
  }

  const PageComponent = siteBuilderComponentRegistry[activePage.component_key];

  if (!PageComponent || activePage.status !== "connected") {
    return <PlaceholderPage page={activePage} />;
  }

  return <PageComponent page={activePage} />;
}
