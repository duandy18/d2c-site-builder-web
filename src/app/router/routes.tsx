import { createBrowserRouter } from "react-router-dom";

import type { SiteBuilderNavigationResponse } from "../../features/siteBuilder/model/navigationModel";
import { AppLayout } from "../layout/AppLayout";

import { SiteBuilderRouteHost } from "./SiteBuilderRouteHost";

type CreateSiteBuilderRouterArgs = {
  navigation: SiteBuilderNavigationResponse | null;
  isLoading: boolean;
  error: string | null;
};

function normalizeRouterBasePath(value: string | undefined): string {
  const rawValue = value?.trim();

  if (!rawValue || rawValue === "/") {
    return "/";
  }

  const withLeadingSlash = rawValue.startsWith("/") ? rawValue : `/${rawValue}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, "");

  return withoutTrailingSlash || "/";
}

export function createSiteBuilderRouter({
  navigation,
  isLoading,
  error
}: CreateSiteBuilderRouterArgs) {
  return createBrowserRouter(
    [
      {
        path: "/",
        element: (
          <AppLayout navigation={navigation} isLoading={isLoading} error={error} />
        ),
        children: [
          {
            path: "*",
            element: (
              <SiteBuilderRouteHost
                navigation={navigation}
                isLoading={isLoading}
                error={error}
              />
            )
          }
        ]
      }
    ],
    {
      basename: normalizeRouterBasePath(import.meta.env.VITE_APP_BASE_PATH)
    }
  );
}
