import { Download } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { descargarExcel } from '../api/servicios';
import { mensajeError } from '../api/cliente';

export function BotonExportar({
  ruta,
  params,
  etiqueta = 'Exportar a Excel',
}: {
  ruta: string;
  params?: Record<string, unknown>;
  etiqueta?: string;
}) {
  const [cargando, setCargando] = useState(false);

  const exportar = async () => {
    setCargando(true);
    try {
      await descargarExcel(ruta, params);
      toast.success('Archivo Excel generado.');
    } catch (e) {
      toast.error(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  return (
    <button className="btn-secundario" onClick={exportar} disabled={cargando}>
      <Download className="h-4 w-4" />
      {cargando ? 'Generando…' : etiqueta}
    </button>
  );
}
