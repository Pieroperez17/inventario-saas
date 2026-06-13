import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ArrowLeftRight,
  Warehouse,
  Store,
  Tags,
  Truck,
  FileBarChart,
  MessageSquare,
  Users,
  ScrollText,
  Building2,
  Settings,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { ComponentType } from 'react';
import { useAuthStore } from '../store/authStore';
import { ROLES } from '../utilidades/constantes';

interface ItemNav {
  ruta: string;
  etiqueta: string;
  icono: ComponentType<{ className?: string }>;
  roles?: string[];
}

const NAV: ItemNav[] = [
  { ruta: '/', etiqueta: 'Dashboard', icono: LayoutDashboard },
  { ruta: '/productos', etiqueta: 'Productos', icono: Package },
  { ruta: '/inventario', etiqueta: 'Inventario', icono: Boxes },
  { ruta: '/movimientos', etiqueta: 'Movimientos', icono: ArrowLeftRight },
  { ruta: '/almacenes', etiqueta: 'Almacenes', icono: Warehouse },
  { ruta: '/tiendas', etiqueta: 'Tiendas', icono: Store },
  { ruta: '/categorias', etiqueta: 'Categorías', icono: Tags },
  { ruta: '/proveedores', etiqueta: 'Proveedores', icono: Truck },
  { ruta: '/reportes', etiqueta: 'Reportes', icono: FileBarChart },
  { ruta: '/mensajes', etiqueta: 'Mensajes', icono: MessageSquare },
  { ruta: '/usuarios', etiqueta: 'Usuarios', icono: Users, roles: [ROLES.ADMINISTRADOR] },
  { ruta: '/auditoria', etiqueta: 'Auditoría', icono: ScrollText, roles: [ROLES.ADMINISTRADOR] },
  { ruta: '/empresa', etiqueta: 'Empresa', icono: Building2, roles: [ROLES.ADMINISTRADOR] },
  { ruta: '/configuracion', etiqueta: 'Configuración', icono: Settings },
];

export function Sidebar({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const rol = useAuthStore((s) => s.usuario?.rol.nombre);
  const empresa = useAuthStore((s) => s.empresa);
  const items = NAV.filter((i) => !i.roles || (rol && i.roles.includes(rol)));

  return (
    <>
      {abierto && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onCerrar} />}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-slate-800 bg-slate-900 transition-transform lg:static lg:translate-x-0',
          abierto ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-800 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-marca-600">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100">
              {empresa?.razonSocial ?? 'Inventario SaaS'}
            </p>
            <p className="text-xs text-slate-500">Gestión de inventario</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={onCerrar}>
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {items.map((i) => (
            <NavLink
              key={i.ruta}
              to={i.ruta}
              end={i.ruta === '/'}
              onClick={onCerrar}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive ? 'bg-marca-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
                )
              }
            >
              <i.icono className="h-5 w-5" />
              {i.etiqueta}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
