import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { apiReportes, apiProductos } from '../api/servicios';
import { EncabezadoPagina } from '../componentes/EncabezadoPagina';
import { Tabla } from '../componentes/Tabla';
import { Spinner } from '../componentes/Spinner';
import { Badge } from '../componentes/Badge';
import { BotonExportar } from '../componentes/BotonExportar';
import { useAuthStore } from '../store/authStore';
import { formatearMoneda, formatearNumero, formatearFechaHora } from '../utilidades/formato';

type Tab = 'valorizado' | 'kardex';

function Valorizado() {
  const moneda = useAuthStore((s) => s.empresa?.moneda ?? 'PEN');
  const { data, isLoading } = useQuery({ queryKey: ['rep-valorizado'], queryFn: apiReportes.valorizado });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <BotonExportar ruta="/exportar/valorizado" etiqueta="Exportar a Excel" />
      </div>
      {isLoading || !data ? (
        <Spinner texto="Calculando…" />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="tarjeta">
              <p className="text-sm text-slate-400">Ítems</p>
              <p className="text-xl font-bold">{formatearNumero(data.totales.items)}</p>
            </div>
            <div className="tarjeta">
              <p className="text-sm text-slate-400">Valor a costo</p>
              <p className="text-xl font-bold text-emerald-400">{formatearMoneda(data.totales.valorCompra, moneda)}</p>
            </div>
            <div className="tarjeta">
              <p className="text-sm text-slate-400">Valor a venta</p>
              <p className="text-xl font-bold text-marca-300">{formatearMoneda(data.totales.valorVenta, moneda)}</p>
            </div>
          </div>
          <Tabla
            datos={data.filas}
            columnas={[
              { clave: 'sku', encabezado: 'SKU' },
              { clave: 'nombre', encabezado: 'Producto' },
              { clave: 'stockTotal', encabezado: 'Stock', render: (f) => formatearNumero(f.stockTotal) },
              { clave: 'precioCompra', encabezado: 'P. compra', render: (f) => formatearMoneda(f.precioCompra, moneda) },
              { clave: 'valorCompra', encabezado: 'Valor costo', render: (f) => formatearMoneda(f.valorCompra, moneda) },
              { clave: 'valorVenta', encabezado: 'Valor venta', render: (f) => formatearMoneda(f.valorVenta, moneda) },
            ]}
          />
        </>
      )}
    </div>
  );
}

function Kardex() {
  const [productoId, setProductoId] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const { data: productos } = useQuery({ queryKey: ['prod-kardex'], queryFn: () => apiProductos.listar({ limite: 300 }) });

  const params = { desde: desde || undefined, hasta: hasta || undefined };
  const kardex = useQuery({
    queryKey: ['kardex', productoId, desde, hasta],
    queryFn: () => apiReportes.kardex(productoId, params),
    enabled: !!productoId,
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-72">
          <label className="etiqueta">Producto</label>
          <select className="campo" value={productoId} onChange={(e) => setProductoId(e.target.value)}>
            <option value="">Selecciona…</option>
            {(productos?.datos ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.sku} · {p.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="etiqueta">Desde</label>
          <input type="date" className="campo" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="etiqueta">Hasta</label>
          <input type="date" className="campo" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        {productoId && <BotonExportar ruta={`/exportar/kardex/${productoId}`} params={params} />}
      </div>

      {!productoId ? (
        <p className="py-10 text-center text-sm text-slate-500">Selecciona un producto para ver su kardex.</p>
      ) : kardex.isLoading ? (
        <Spinner texto="Cargando kardex…" />
      ) : (
        <Tabla
          datos={(kardex.data?.filas ?? []).map((f, i) => ({ id: String(i), ...f }))}
          vacio="Sin movimientos en el rango."
          columnas={[
            { clave: 'fecha', encabezado: 'Fecha', render: (f) => formatearFechaHora(f.fecha) },
            { clave: 'tipo', encabezado: 'Tipo', render: (f) => (
              <Badge variante={f.tipo === 'ENTRADA' ? 'verde' : f.tipo === 'SALIDA' ? 'rojo' : 'azul'}>{f.tipo}</Badge>
            )},
            { clave: 'origen', encabezado: 'Origen' },
            { clave: 'destino', encabezado: 'Destino' },
            { clave: 'entrada', encabezado: 'Entrada', render: (f) => (f.entrada ? formatearNumero(f.entrada) : '—') },
            { clave: 'salida', encabezado: 'Salida', render: (f) => (f.salida ? formatearNumero(f.salida) : '—') },
            { clave: 'saldo', encabezado: 'Saldo', render: (f) => formatearNumero(f.saldo) },
          ]}
        />
      )}
    </div>
  );
}

export default function Reportes() {
  const [tab, setTab] = useState<Tab>('valorizado');
  return (
    <div>
      <EncabezadoPagina titulo="Reportes" descripcion="Inventario valorizado y kardex por producto" />
      <div className="mb-4 inline-flex rounded-lg border border-slate-800 bg-slate-900 p-1">
        {(['valorizado', 'kardex'] as Tab[]).map((t) => (
          <button
            key={t}
            className={clsx('rounded-md px-3 py-1.5 text-sm font-medium transition', tab === t ? 'bg-marca-600 text-white' : 'text-slate-400 hover:text-slate-200')}
            onClick={() => setTab(t)}
          >
            {t === 'valorizado' ? 'Inventario valorizado' : 'Kardex'}
          </button>
        ))}
      </div>
      {tab === 'valorizado' ? <Valorizado /> : <Kardex />}
    </div>
  );
}
