type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface ApiConfig {
  isFormData?: boolean;
  token?: string;
  timeout?: number;
  useCache?: boolean;
}

class HttpError extends Error {
  status: number;
  response?: any;

  constructor(message: string, status: number, response?: any) {
    super(message);
    this.status = status;
    this.name = "HttpError";
    this.response = response;
  }
}

class ApiService {
  private static async request(
    endpoint: string,
    method: HttpMethod,
    data?: any,
    config?: ApiConfig
  ) {
    const headers: HeadersInit = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (!config?.isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (config?.token) {
      headers["Authorization"] = `Bearer ${config.token}`;
    }

    let body: BodyInit | undefined = undefined;

    if (method !== "GET" && method !== "DELETE") {
      if (config?.isFormData && data instanceof FormData) {
        body = data;
      } else {
        body = JSON.stringify(data);
      }
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTimeout = config?.timeout
      ? setTimeout(() => controller.abort(), config.timeout)
      : null;

    const options: RequestInit = {
      method,
      headers,
      body,
      cache: config?.useCache ? "force-cache" : "no-store",
      signal,
    };

    try {
      const response = await fetch(endpoint, options);

      if (fetchTimeout) clearTimeout(fetchTimeout);

      const contentType = response.headers.get("content-type") || "";

      let responseData = null;

      if (contentType.includes("application/json")) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null; // corps vide ou non JSON
        }
      }

      if (!response.ok) {
        throw new HttpError(
          responseData?.message || `HTTP error! status: ${response.status}`,
          response.status,
          responseData
        );
      }

      return responseData;
    } catch (error) {
      console.error("API Service Error:", error);
      throw error;
    }
  }

  static get(endpoint: string, config?: ApiConfig) {
    return this.request(endpoint, "GET", undefined, config);
  }

  static post(endpoint: string, data: any, config?: ApiConfig) {
    return this.request(endpoint, "POST", data, config);
  }

  static put(endpoint: string, data: any, config?: ApiConfig) {
    return this.request(endpoint, "PUT", data, config);
  }

  static delete(endpoint: string, config?: ApiConfig) {
    return this.request(endpoint, "DELETE", undefined, config);
  }

  static patch(endpoint: string, data: any, config?: ApiConfig) {
    return this.request(endpoint, "PATCH", data, config);
  }

  // Tu peux supprimer cette méthode si elle est inutile
  static async deletet(url: string) {
    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erreur de suppression");
    }
  }
}

export default ApiService;
