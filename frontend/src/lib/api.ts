import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Request interceptor: attach Bearer token + handle FormData ────────
api.interceptors.request.use((config) => {
  // Remove Content-Type for FormData so the browser sets it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const token = localStorage.getItem('parada1bus_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ─────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, once per request, and not on the refresh endpoint itself
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/token/refresh/')
    ) {
      return Promise.reject(error);
    }

    // If another refresh is in flight, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('parada1bus_refresh_token');
    if (!refreshToken) {
      clearTokensAndRedirect();
      return Promise.reject(error);
    }

    try {
      const response = await axios.post('/api/auth/token/refresh/', {
        refresh: refreshToken,
      });
      const { access } = response.data;
      localStorage.setItem('parada1bus_access_token', access);
      processQueue(null, access);
      originalRequest.headers.Authorization = `Bearer ${access}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokensAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

function clearTokensAndRedirect() {
  localStorage.removeItem('parada1bus_access_token');
  localStorage.removeItem('parada1bus_refresh_token');
  // Only redirect if we're not already on the login page
  if (!window.location.pathname.startsWith('/admin/login')) {
    window.location.href = '/admin/login';
  }
}

/**
 * Traduce una respuesta de error de DRF a un mensaje legible.
 *
 * DRF devuelve los errores por campo, y los errores de negocio (por ejemplo
 * "no quedan asientos") en `non_field_errors`. Un `catch` genérico esconde
 * justo la informacion que el usuario necesita para corregir el formulario.
 */
export function extraerMensajeError(error: unknown, porDefecto: string): string {
  const respuesta = (error as { response?: { data?: Record<string, unknown> } })?.response;
  const datos = respuesta?.data;

  if (!datos || typeof datos !== 'object') return porDefecto;
  if (typeof datos.detail === 'string') return datos.detail;

  const mensajes = Object.entries(datos).flatMap(([campo, valor]) => {
    const lista = Array.isArray(valor) ? valor : [valor];
    return lista.map((mensaje) =>
      campo === 'non_field_errors' ? String(mensaje) : `${campo}: ${String(mensaje)}`,
    );
  });

  return mensajes.length > 0 ? mensajes.join(' ') : porDefecto;
}

export default api;
