import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtegerRuta({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const usuario = useAuthStore((s) => s.usuario);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && usuario && !roles.includes(usuario.rol.nombre)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
