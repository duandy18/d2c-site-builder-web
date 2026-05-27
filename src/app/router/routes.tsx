import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "../layout/AppLayout";
import { SiteBuilderHomePage } from "../../features/siteBuilder/pages/SiteBuilderHomePage";
import { RuntimePublishPage } from "../../features/runtimePreview/pages/RuntimePublishPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <SiteBuilderHomePage />
      },
      {
        path: "publish",
        element: <RuntimePublishPage />
      }
    ]
  }
]);
