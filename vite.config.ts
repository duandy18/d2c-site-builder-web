import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

function normalizeBasePath(value: string | undefined): string {
  const rawValue = value?.trim();

  if (!rawValue) {
    return "/";
  }

  const withLeadingSlash = rawValue.startsWith("/") ? rawValue : `/${rawValue}`;

  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");

  return {
    base: normalizeBasePath(env.VITE_APP_BASE_PATH),
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5299
    },
    preview: {
      host: "0.0.0.0",
      port: 5299
    }
  };
});
