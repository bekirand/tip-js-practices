export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

// Создаёт URL относительно baseUrl и добавляет непустые параметры query.
// Значения кодируются средствами URL и URLSearchParams, а не вручную.
export function buildUrl(baseUrl, path, query = {}) {
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const subPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(base + subPath);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

// fetchFn передаётся явно, чтобы модуль можно было проверить без реальной сети.
// Возвращаемый объект: { requestJson(path, { query, signal, timeoutMs } = {}) }.
export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  if (!baseUrl || typeof baseUrl !== "string") {
    throw new TypeError("baseUrl должен быть непустой строкой");
  }

  let parsedBase;
  try {
    parsedBase = new URL(baseUrl);
  } catch {
    throw new TypeError("baseUrl должен быть абсолютным валидным URL");
  }

  if (parsedBase.protocol !== "http:" && parsedBase.protocol !== "https:") {
    throw new TypeError("baseUrl должен использовать протокол http: или https:");
  }

  if (parsedBase.search || parsedBase.hash) {
    throw new TypeError("baseUrl не должен содержать query или hash");
  }

  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией");
  }

  if (typeof timeoutMs !== "number" || !Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("timeoutMs должен быть положительным целым числом");
  }

  return {
    async requestJson(path, { query, signal, timeoutMs: reqTimeout } = {}) {
      const url = buildUrl(baseUrl, path, query);
      const effectiveTimeout = reqTimeout ?? timeoutMs;
      const timeoutSignal = AbortSignal.timeout(effectiveTimeout);
      const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

      let response;
      try {
        response = await fetchFn(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: combinedSignal,
        });
      } catch (error) {
        if (signal?.aborted) {
          throw new ApiError("Запрос отменён", { kind: "aborted", cause: error, url });
        }
        if (timeoutSignal.aborted) {
          throw new ApiError("Превышено время ожидания ответа", { kind: "timeout", cause: error, url });
        }
        throw new ApiError(error?.message || "Сетевая ошибка", { kind: "network", cause: error, url });
      }

      if (!response || typeof response !== "object" || typeof response.status !== "number") {
        throw new ApiError("Ответ сервера не является Response", { kind: "invalid-response", url });
      }

      if (response.status === 204) {
        return null;
      }

      if (response.ok) {
        const contentType = response.headers?.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new ApiError("Неверный Content-Type ответа, ожидается application/json", {
            kind: "invalid-response",
            url,
            status: response.status,
          });
        }

        try {
          return await response.json();
        } catch (err) {
          throw new ApiError("Ошибка разбора JSON успешного ответа", {
            kind: "invalid-response",
            cause: err,
            url,
            status: response.status,
          });
        }
      }

      // Обработка HTTP-ошибок (не 2xx)
      let errorPayload = null;
      try {
        const text = await response.text();
        errorPayload = JSON.parse(text);
      } catch {}

      const code = errorPayload?.error?.code ?? null;
      const details = errorPayload?.error?.details ?? null;
      const message = errorPayload?.error?.message ?? `HTTP ошибка ${response.status}`;

      throw new ApiError(message, {
        kind: "http",
        status: response.status,
        code,
        details,
        url,
      });
    },
  };
}
