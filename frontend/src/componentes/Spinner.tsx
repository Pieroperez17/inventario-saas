import { Loader2 } from 'lucide-react';

export function Spinner({ texto }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-slate-500 dark:text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin" />
      {texto && <span className="text-sm">{texto}</span>}
    </div>
  );
}

/** Filas "esqueleto" para estados de carga de tablas. */
export function FilasSkeleton({ filas = 5, columnas = 4 }: { filas?: number; columnas?: number }) {
  return (
    <>
      {Array.from({ length: filas }).map((_, i) => (
        <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
          {Array.from({ length: columnas }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
