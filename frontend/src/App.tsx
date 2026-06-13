import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { apiAuth } from './api/servicios';
import { Layout } from './componentes/Layout';
import { ProtegerRuta } from './componentes/ProtegerRuta';
import { ROLES } from './utilidades/constantes';
import Login from './paginas/Login';
import Registro from './paginas/Registro';
import Dashboard from './paginas/Dashboard';
import Productos from './paginas/Productos';
import Categorias from './paginas/Categorias';
import Almacenes from './paginas/Almacenes';
import Tiendas from './paginas/Tiendas';
import Proveedores from './paginas/Proveedores';
import Inventario from './paginas/Inventario';
import Movimientos from './paginas/Movimientos';
import Usuarios from './paginas/Usuarios';
import Reportes from './paginas/Reportes';
import Notificaciones from './paginas/Notificaciones';
import Mensajes from './paginas/Mensajes';
import Auditoria from './paginas/Auditoria';
import Empresa from './paginas/Empresa';
import Configuracion from './paginas/Configuracion';

export default function App() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setPerfil = useAuthStore((s) => s.setPerfil);

  // Al montar (con sesión persistida), refresca el perfil y los permisos.
  useEffect(() => {
    if (accessToken) {
      apiAuth
        .perfil()
        .then((p) => setPerfil(p))
        .catch(() => {
          /* el interceptor de Axios gestiona la expiración del token */
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const soloAdmin = (pagina: React.ReactNode) => (
    <ProtegerRuta roles={[ROLES.ADMINISTRADOR]}>{pagina}</ProtegerRuta>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      <Route
        element={
          <ProtegerRuta>
            <Layout />
          </ProtegerRuta>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/movimientos" element={<Movimientos />} />
        <Route path="/almacenes" element={<Almacenes />} />
        <Route path="/tiendas" element={<Tiendas />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/mensajes" element={<Mensajes />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/usuarios" element={soloAdmin(<Usuarios />)} />
        <Route path="/auditoria" element={soloAdmin(<Auditoria />)} />
        <Route path="/empresa" element={soloAdmin(<Empresa />)} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
