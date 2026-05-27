export type AppConfig = {
  appCode: string;
  webPath: string;
  apiBaseUrl: string;
  webPort: string;
  apiPort: string;
  siteBuilderClient: string;
};

export const appConfig: AppConfig = {
  appCode: import.meta.env.VITE_APP_CODE ?? "d2c-site-builder",
  webPath: import.meta.env.VITE_APP_BASE_PATH ?? "/site-builder",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8035",
  webPort: import.meta.env.VITE_WEB_PORT ?? "5299",
  apiPort: import.meta.env.VITE_API_PORT ?? "8035",
  siteBuilderClient: import.meta.env.VITE_SITE_BUILDER_CLIENT ?? "d2c-site-builder"
};
