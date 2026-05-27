import { appConfig } from "../config/appConfig";

export async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: unknown };

    if (typeof payload.detail === "string" && payload.detail.length > 0) {
      return payload.detail;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export async function siteBuilderGet<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Site-Builder-Client": appConfig.siteBuilderClient
    }
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "D2C site builder request failed"));
  }

  return (await response.json()) as TResponse;
}
