import { Outlet } from "react-router-dom";

import type { SiteBuilderNavigationResponse } from "../../features/siteBuilder/model/navigationModel";
import { appConfig } from "../../shared/config/appConfig";

import { SiteBuilderSidebar } from "./SiteBuilderSidebar";

type AppLayoutProps = {
  navigation: SiteBuilderNavigationResponse | null;
  isLoading: boolean;
  error: string | null;
};

export function AppLayout({ navigation, isLoading, error }: AppLayoutProps) {
  return (
    <div className="sb-shell">
      <SiteBuilderSidebar navigation={navigation} isLoading={isLoading} error={error} />

      <div className="sb-main">
        <header className="sb-topbar">
          <span>{appConfig.appCode}</span>
          <span>Web {appConfig.webPort}</span>
          <span>API {appConfig.apiPort}</span>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
