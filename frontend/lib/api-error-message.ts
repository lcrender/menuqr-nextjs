import type { AxiosError } from 'axios';

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export const OFFLINE_ERROR_MESSAGE = 'Revise su conexión a internet.';

/** Axios sin respuesta (sin red, DNS, servidor inalcanzable). */
export function isOfflineError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const ax = error as AxiosError;
  if (ax.code === 'ERR_NETWORK' || ax.code === 'ECONNABORTED') return true;
  const msg = typeof ax.message === 'string' ? ax.message.trim().toLowerCase() : '';
  if (msg === 'network error' || msg === 'networkerror') return true;
  return !ax.response && Boolean((ax as { request?: unknown }).request);
}

/**
 * Extrae un mensaje legible de una respuesta de la API (axios u objeto similar).
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error. Intentá de nuevo.',
): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  if (isOfflineError(error)) {
    return OFFLINE_ERROR_MESSAGE;
  }

  const ax = error as AxiosError<ApiErrorPayload>;
  const data = ax.response?.data;
  const status = ax.response?.status;

  if (data) {
    const fromMessage = normalizeMessageField(data.message);
    if (fromMessage) return fromMessage;

    if (
      typeof data.error === 'string' &&
      data.error.trim() &&
      data.error.toLowerCase() !== 'internal server error'
    ) {
      return data.error.trim();
    }
  }

  if (status === 401) {
    return 'Tu sesión expiró o no tenés permiso. Volvé a iniciar sesión.';
  }
  if (status === 403) {
    return 'No tenés permiso para realizar esta acción.';
  }
  if (status === 404) {
    return 'No se encontró el recurso solicitado.';
  }
  if (status === 409) {
    return 'Conflicto con datos existentes. Revisá la información ingresada.';
  }
  if (status === 422 || status === 400) {
    return fallback;
  }
  if (status === 500) {
    return 'Error del servidor. Si persiste, contactá soporte.';
  }
  if (status === 503) {
    return 'El servicio no está disponible temporalmente. Intentá más tarde.';
  }

  if (ax.message && !ax.message.startsWith('Request failed with status')) {
    return ax.message;
  }

  return fallback;
}

function normalizeMessageField(message: string | string[] | undefined): string | null {
  if (Array.isArray(message)) {
    const parts = message.map((m) => String(m).trim()).filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : null;
  }
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }
  return null;
}
