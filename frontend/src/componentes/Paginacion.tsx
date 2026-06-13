import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MetaPaginacion } from '../tipos/modelos';

export function Paginacion({ meta, onCambio }: { meta?: MetaPaginacion; onCambio: (pagina: number) => void }) {
  if (!meta || meta.total === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-3 text-sm text-slate-400">
      <span>
        Página {meta.pagina} de {meta.totalPaginas} · {meta.total} registros
      </span>
      <div className="flex gap-1">
        <button
          className="btn-secundario px-2 py-1"
          disabled={meta.pagina <= 1}
          onClick={() => onCambio(meta.pagina - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          className="btn-secundario px-2 py-1"
          disabled={meta.pagina >= meta.totalPaginas}
          onClick={() => onCambio(meta.pagina + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
