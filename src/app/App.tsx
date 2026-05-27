import { useEffect, useMemo, useState } from "react";
import { RouterProvider } from "react-router-dom";

import { fetchSiteBuilderNavigation } from "../features/siteBuilder/api/navigationApi";
import type { SiteBuilderNavigationResponse } from "../features/siteBuilder/model/navigationModel";

import { createSiteBuilderRouter } from "./router/routes";

type NavigationState =
  | { status: "loading" }
  | { status: "ok"; data: SiteBuilderNavigationResponse }
  | { status: "error"; error: string };

export function App() {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    status: "loading"
  });

  useEffect(() => {
    let mounted = true;

    fetchSiteBuilderNavigation()
      .then((data) => {
        if (mounted) {
          setNavigationState({ status: "ok", data });
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          setNavigationState({
            status: "error",
            error: err instanceof Error ? err.message : "unknown error"
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const navigation = navigationState.status === "ok" ? navigationState.data : null;
  const isLoading = navigationState.status === "loading";
  const error = navigationState.status === "error" ? navigationState.error : null;

  const router = useMemo(
    () => createSiteBuilderRouter({ navigation, isLoading, error }),
    [navigation, isLoading, error]
  );

  return <RouterProvider router={router} />;
}
