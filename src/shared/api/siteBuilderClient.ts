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

async function siteBuilderRequest<TResponse>(
  path: string,
  options: RequestInit
): Promise<TResponse> {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Site-Builder-Client": appConfig.siteBuilderClient,
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "D2C site builder request failed"));
  }

  return (await response.json()) as TResponse;
}

export function siteBuilderGet<TResponse>(path: string): Promise<TResponse> {
  return siteBuilderRequest<TResponse>(path, {
    method: "GET"
  });
}

export function siteBuilderPatch<TResponse, TBody extends object>(
  path: string,
  body: TBody
): Promise<TResponse> {
  return siteBuilderRequest<TResponse>(path, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export function siteBuilderPost<TResponse, TBody extends object>(
  path: string,
  body: TBody
): Promise<TResponse> {
  return siteBuilderRequest<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
