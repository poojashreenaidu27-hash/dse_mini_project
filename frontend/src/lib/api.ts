export interface ApiResponse<T> {
  data: T;
  error?: string;
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (typeof errorData?.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData?.detail)) {
          errorMessage = errorData.detail
            .map((item: any) => item.msg || JSON.stringify(item))
            .join(', ');
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Response was not JSON
      }
      return { data: undefined as unknown as T, error: errorMessage };
    }

    const data: T = await response.json();
    return { data };
  } catch (err: any) {
    return {
      data: undefined as unknown as T,
      error: err?.message || 'Network error occurred',
    };
  }
}

export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'GET' });
}

export async function apiPost<T, B = unknown>(
  url: string,
  body?: B
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatch<T, B = unknown>(
  url: string,
  body?: B
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiPut<T, B = unknown>(
  url: string,
  body?: B
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'DELETE' });
}

