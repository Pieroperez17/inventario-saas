import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import clsx from 'clsx';
import { apiNotificaciones } from '../api/servicios';
import { EncabezadoPagina } from '../componentes/EncabezadoPagina';
import { Spinner } from '../componentes/Spinner';
import { Paginacion } from '../componentes/Paginacion';
import { formatearFechaHora } from '../utilidades/formato';

export default function Notificaciones() {
  const qc = useQueryClient();
  const [pagina, setPagina] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['notificaciones', pagina],
    queryFn: () => apiNotificaciones.listar({ pagina, limite: 15 }),
  });

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['notificaciones'] });
    qc.invalidateQueries({ queryKey: ['notif-no-leidas'] });
  };

  const leer = useMutation({ mutationFn: apiNotificaciones.leer, onSuccess: invalidar });
  const leerTodas = useMutation({ mutationFn: apiNotificaciones.leerTodas, onSuccess: invalidar });

  return (
    <div>
      <EncabezadoPagina
        titulo="Notificaciones"
        descripcion="Alertas y avisos del sistema"
        acciones={
          <button className="btn-secundario" onClick={() => leerTodas.mutate()} disabled={leerTodas.isPending}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como leídas
          </button>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : (data?.datos.length ?? 0) === 0 ? (
        <div className="tarjeta py-12 text-center text-slate-500">
          <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
          No tienes notificaciones.
        </div>
      ) : (
        <div className="space-y-2">
          {data!.datos.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.leida && leer.mutate(n.id)}
              className={clsx(
                'flex w-full items-start gap-3 rounded-lg border p-4 text-left transition',
                n.leida
                  ? 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40'
                  : 'border-marca-600/40 bg-marca-600/10 hover:bg-marca-600/20',
              )}
            >
              <span className={clsx('mt-1 h-2 w-2 shrink-0 rounded-full', n.leida ? 'bg-slate-400 dark:bg-slate-600' : 'bg-marca-500 dark:bg-marca-400')} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 dark:text-slate-100">{n.titulo}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{n.mensaje}</p>
                <p className="mt-1 text-xs text-slate-500">{formatearFechaHora(n.creadoEn)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      <Paginacion meta={data?.meta} onCambio={setPagina} />
    </div>
  );
}
