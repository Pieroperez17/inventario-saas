import { ReactNode } from 'react';
import { FilasSkeleton } from './Spinner';

export interface Columna<T> {
  clave: string;
  encabezado: string;
  render?: (fila: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columnas: Columna<T>[];
  datos: T[];
  cargando?: boolean;
  vacio?: string;
}

export function Tabla<T extends { id: string }>({
  columnas,
  datos,
  cargando,
  vacio = 'No hay registros para mostrar.',
}: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            {columnas.map((c) => (
              <th key={c.clave} className={`px-4 py-3 font-medium ${c.className ?? ''}`}>
                {c.encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900/40">
          {cargando ? (
            <FilasSkeleton columnas={columnas.length} />
          ) : datos.length === 0 ? (
            <tr>
              <td colSpan={columnas.length} className="px-4 py-12 text-center text-slate-600 dark:text-slate-400">
                {vacio}
              </td>
            </tr>
          ) : (
            datos.map((fila) => (
              <tr
                key={fila.id}
                className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
              >
                {columnas.map((c) => (
                  <td
                    key={c.clave}
                    className={`px-4 py-3 text-slate-800 dark:text-slate-200 ${c.className ?? ''}`}
                  >
                    {c.render ? c.render(fila) : ((fila as Record<string, ReactNode>)[c.clave] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
