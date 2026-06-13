import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: string;
}

export function Modal({ abierto, titulo, onCerrar, children, ancho = 'max-w-lg' }: Props) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className={`mt-10 w-full ${ancho} rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{titulo}</h3>
          <button
            onClick={onCerrar}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmacionProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  cargando?: boolean;
}

export function ModalConfirmacion({ abierto, titulo, mensaje, onConfirmar, onCancelar, cargando }: ConfirmacionProps) {
  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCancelar} ancho="max-w-md">
      <p className="text-sm text-slate-700 dark:text-slate-300">{mensaje}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-secundario" onClick={onCancelar} disabled={cargando}>
          Cancelar
        </button>
        <button className="btn-peligro" onClick={onConfirmar} disabled={cargando}>
          {cargando ? 'Eliminando…' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  );
}
