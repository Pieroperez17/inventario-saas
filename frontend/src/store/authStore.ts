/** Estado global de autenticación (Zustand + persistencia en localStorage). */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Empresa, Usuario } from '../tipos/modelos';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface EstadoAuth {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: Usuario | null;
  empresa: Empresa | null;
  permisos: string[];
  setSesion: (datos: { usuario: Usuario; empresa: Empresa; tokens: Tokens; permisos?: string[] }) => void;
  setPerfil: (datos: { usuario: Usuario; empresa: Empresa; permisos: string[] }) => void;
  actualizarTokens: (accessToken: string, refreshToken: string) => void;
  cerrarSesion: () => void;
  tieneRol: (...roles: string[]) => boolean;
}

export const useAuthStore = create<EstadoAuth>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      usuario: null,
      empresa: null,
      permisos: [],
      setSesion: ({ usuario, empresa, tokens, permisos }) =>
        set({
          usuario,
          empresa,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          permisos: permisos ?? get().permisos,
        }),
      setPerfil: ({ usuario, empresa, permisos }) => set({ usuario, empresa, permisos }),
      actualizarTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      cerrarSesion: () =>
        set({ accessToken: null, refreshToken: null, usuario: null, empresa: null, permisos: [] }),
      tieneRol: (...roles) => {
        const usuario = get().usuario;
        return !!usuario && roles.includes(usuario.rol.nombre);
      },
    }),
    { name: 'inventario-auth' },
  ),
);
