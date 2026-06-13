import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiAuditoria } from '../api/servicios';
import { EncabezadoPagina } from '../componentes/EncabezadoPagina';
import { Tabla } from '../componentes/Tabla';
import { Paginacion } from '../componentes/Paginacion';
import { Badge } from '../componentes/Badge';
import { useDebounce } from '../hooks/useDebounce';
import { formatearFechaHora } from '../utilidades/formato';

export default function Auditoria() {
  const [pagina, setPagina] = useState(1);
  const [buscar, setBuscar] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const buscarD = useDebounce(buscar);

  const params = { pagina, buscar: buscarD, desde: desde || undefined, hasta: hasta || undefined };
  const { data, isLoading } = useQuery({ queryKey: ['auditoria', params], queryFn: () => apiAuditoria.listar(params) });

  return (
    <div>
      <EncabezadoPagina titulo="Auditoría" descripcion="Bitácora de acciones realizadas en el sistema" />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-64">
          <input className="campo" placeholder="Buscar acción o entidad…" value={buscar} onChange={(e) => { setBuscar(e.target.value); setPagina(1); }} />
        </div>
        <div>
          <label className="etiqueta">Desde</label>
          <input type="date" className="campo" value={desde} onChange={(e) => { setDesde(e.target.value); setPagina(1); }} />
        </div>
        <div>
          <label className="etiqueta">Hasta</label>
          <input type="date" className="campo" value={hasta} onChange={(e) => { setHasta(e.target.value); setPagina(1); }} />
        </div>
      </div>

      <Tabla
        cargando={isLoading}
        datos={data?.datos ?? []}
        columnas={[
          { clave: 'creadoEn', encabezado: 'Fecha', render: (r) => formatearFechaHora(r.creadoEn) },
          { clave: 'usuario', encabezado: 'Usuario', render: (r) => (r.usuario ? `${r.usuario.nombres} ${r.usuario.apellidos}` : 'Sistema') },
          { clave: 'accion', encabezado: 'Acción', render: (r) => <Badge variante="azul">{r.accion}</Badge> },
          { clave: 'entidad', encabezado: 'Entidad' },
          { clave: 'entidadId', encabezado: 'ID', render: (r) => (r.entidadId ? r.entidadId.slice(0, 8) : '—') },
          { clave: 'ip', encabezado: 'IP', render: (r) => r.ip ?? '—' },
        ]}
      />
      <Paginacion meta={data?.meta} onCambio={setPagina} />
    </div>
  );
}
