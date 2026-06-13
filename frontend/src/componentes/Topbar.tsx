import { Bell, LogOut, Menu, Moon, Search, Settings, Sun, UserCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useTemaStore } from '../store/temaStore';
import { apiAuth, apiNotificaciones } from '../api/servicios';

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);
  const tema = useTemaStore((s) => s.tema);
  const alternar = useTemaStore((s) => s.alternar);
  const [menu, setMenu] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const { data: noLeidas } = useQuery({
    queryKey: ['notif-no-leidas'],
    queryFn: apiNotificaciones.noLeidas,
    refetchInterval: 30_000,
  });

  const salir = async () => {
    try {
      if (refreshToken) await apiAuth.logout(refreshToken);
    } catch {
      /* la sesión se cierra localmente de todos modos */
    }
    cerrarSesion();
    navigate('/login');
  };

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) navigate(`/productos?buscar=${encodeURIComponent(busqueda.trim())}`);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-800 bg-slate-900/80 px-4 backdrop-blur">
      <button className="lg:hidden" onClick={onMenu}>
        <Menu className="h-6 w-6 text-slate-300" />
      </button>

      <form onSubmit={buscar} className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          className="campo pl-9"
          placeholder="Buscar productos…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </form>

      <div className="ml-auto flex items-center gap-1">
        <button className="btn-fantasma p-2" onClick={alternar} title="Cambiar tema">
          {tema === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          className="btn-fantasma relative p-2"
          onClick={() => navigate('/notificaciones')}
          title="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          {!!noLeidas && noLeidas > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-800"
            onClick={() => setMenu((v) => !v)}
          >
            <UserCircle className="h-7 w-7 text-slate-400" />
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-slate-100">
                {usuario?.nombres} {usuario?.apellidos}
              </p>
              <p className="text-xs text-slate-500">{usuario?.rol.nombre}</p>
            </div>
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-800 bg-slate-900 py-1 shadow-xl">
                <div className="border-b border-slate-800 px-4 py-2">
                  <p className="text-sm font-medium text-slate-100">
                    {usuario?.nombres} {usuario?.apellidos}
                  </p>
                  <p className="truncate text-xs text-slate-500">{usuario?.email}</p>
                </div>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                  onClick={() => {
                    setMenu(false);
                    navigate('/configuracion');
                  }}
                >
                  <Settings className="h-4 w-4" /> Configuración
                </button>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-slate-800"
                  onClick={salir}
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
