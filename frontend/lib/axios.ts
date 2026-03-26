import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from './config';

const api = axios.create({
  baseURL: '',
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401 y refrescar el token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Silenciar errores 404 para peticiones a restaurantes cuando se espera que puedan no existir
    // (por ejemplo, cuando un menú no está asignado a ningún restaurante)
    if (error.response?.status === 404 && originalRequest.url?.includes('/restaurants/')) {
      // Si la petición tiene validateStatus que acepta 404, devolver una respuesta simulada
      // Esto evita que el error se propague y se registre en la consola
      if (originalRequest.validateStatus && originalRequest.validateStatus(404)) {
        // Crear una respuesta simulada que no cause errores en la consola
        const mockResponse = {
          ...error.response,
          status: 404,
          statusText: 'Not Found',
          data: null,
          config: originalRequest,
        };
        return Promise.resolve(mockResponse as any);
      }
      // Si no tiene validateStatus, devolver el error pero sin que se registre en consola
      // El error se manejará en el catch del código que hace la petición
      return Promise.reject(error);
    }

    // No intentar refrescar token en login/register: el 401 es "credenciales inválidas"
    // y debe mostrarse en el formulario, no redirigir y perder el mensaje
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // GET públicos (precios, límites): token caducado no debe vaciar sesión ni mandar a login (landing / legales).
    const isPublicGet =
      (originalRequest.url?.includes('/pricing') || originalRequest.url?.includes('/public/plan-limits')) &&
      (originalRequest.method ?? 'get').toLowerCase() === 'get';

    // Si es un error 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicGet) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No hay refresh token, redirigir al login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Intentar refrescar el token
        const response = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Guardar los nuevos tokens
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Reintentar la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Error al refrescar, redirigir al login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

