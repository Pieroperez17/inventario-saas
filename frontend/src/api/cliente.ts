/**
 * Cliente Axios con manejo automático de tokens:
 *  - Adjunta el access token a cada petición.
 *  - Ante un 401, intenta refrescar el token una vez y reintenta la petición.
 */
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

export const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const cliente = axios.create({ baseURL: BASE_URL });

cliente.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refrescando: Promise<string | null> | null = null;

async function refrescarAccess(): Promise<string | null> {
  const { refreshToken, actualizarTokens, cerrarSesion } = useAuthStore.getState();
  if (!refreshToken) {
    cerrarSesion();
    return null;
  }
  try {
    const resp = await axios.post(`${BASE_URL}/auth/refrescar`, { refreshToken });
    const tokens = resp.data.datos.tokens;
    actualizarTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken as string;
  } catch {
    cerrarSesion();
    return null;
  }
}

cliente.interceptors.response.use(
  (respuesta) => respuesta,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _reintentado?: boolean }) | undefined;
    const esRefresh = original?.url?.includes('/auth/refrescar');

    if (error.response?.status === 401 && original && !original._reintentado && !esRefresh) {
      original._reintentado = true;
      if (!refrescando) {
        refrescando = refrescarAccess().finally(() => {
          refrescando = null;
        });
      }
      const nuevoToken = await refrescando;
      if (nuevoToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${nuevoToken}` };
        return cliente(original);
      }
    }
    return Promise.reject(error);
  },
);

/** Extrae un mensaje de error legible de una respuesta de la API. */
export function mensajeError(error: unknown, porDefecto = 'Ocurrió un error inesperado.'): string {
  if (axios.isAxiosError(error)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = error.response?.data as any;
    return data?.error?.mensaje || error.message || porDefecto;
  }
  return porDefecto;
}
