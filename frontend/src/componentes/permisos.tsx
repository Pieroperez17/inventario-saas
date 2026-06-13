import { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { ROLES } from '../utilidades/constantes';

/** True si el usuario puede crear/editar (Administrador o Editor). */
export function usePuedeEditar(): boolean {
  return useAuthStore(
    (s) => !!s.usuario && (s.usuario.rol.nombre === ROLES.ADMINISTRADOR || s.usuario.rol.nombre === ROLES.EDITOR),
  );
}

/** True si el usuario es Administrador. */
export function useEsAdmin(): boolean {
  return useAuthStore((s) => s.usuario?.rol.nombre === ROLES.ADMINISTRADOR);
}

/** Renderiza el contenido solo si el rol del usuario está permitido. */
export function GateRol({ roles, children }: { roles: string[]; children: ReactNode }) {
  const rol = useAuthStore((s) => s.usuario?.rol.nombre);
  if (!rol || !roles.includes(rol)) return null;
  return <>{children}</>;
}
