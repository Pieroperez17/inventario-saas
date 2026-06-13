import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { apiInventario, apiAlmacenes, apiTiendas } from '../api/servicios';
import { EncabezadoPagina } from '../componentes/EncabezadoPagina';
import { Tabla } from '../componentes/Tabla';
import { Paginacion } from '../componentes/Paginacion';
import { CampoBusqueda } from '../componentes/CampoBusqueda';
import { Badge } from '../componentes/Badge';
import { BotonExportar } from '../componentes/BotonExportar';
import { useDebounce } from '../hooks/useDebounce';
import { useAuthStore } from '../store/authStore';
import { formatearMoneda, formatearNumero } from '../utilidades/formato';

type Vista = 'consolidado' | 'ubicacion';

export default function Inventario() {
  const moneda = useAuthStore((s) => s.empresa?.moneda ?? 'PEN');
  const [vista, setVista] = useState<Vista>('consolidado');
  const [buscar, setBuscar] = useState('');
  const [pagina, setPagina] = useState(1);
  const [ubicacion, setUbicacion] = useState('');
  const buscarD = useDebounce(buscar);

  const { data: almacenes } = useQuery({ queryKey: ['almacenes-todos'], queryFn: () => apiAlmacenes.listar({ limite: 100 }) });
  const { data: tiendas } = useQuery({ queryKey: ['tiendas-todas'], queryFn: () => apiTiendas.listar({ limite: 100 }) });

  const [ubicacionTipo, ubicacionId] = ubicacion ? ubicacion.split(':') : [undefined, undefined];

  const consolidado = useQuery({
    queryKey: ['inv-consolidado', pagina, buscarD],
    queryFn: () => apiInventario.consolidado({ pagina, buscar: buscarD }),
    enabled: vista === 'consolidado',
  });

  const porUbicacion = useQuery({
    queryKey: ['inv-ubicacion', pagina, buscarD, ubicacionTipo, ubicacionId],
    queryFn: () => apiInventario.porUbicacion({ pagina, buscar: buscarD, ubicacionTipo, ubicacionId }),
    enabled: vista === 'ubicacion',
  });

  const cambiarVista = (v: Vista) => {
    setVista(v);
    setPagina(1);
  };

  return (
    <div>
      <EncabezadoPagina
        titulo="Inventario"
        descripcion="Existencias por producto y ubicación"
        acciones={
          <BotonExportar ruta="/exportar/inventario" params={{ buscar: buscarD }} etiqueta="Exportar consolidado" />
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-1">
          {(['consolidado', 'ubicacion'] as Vista[]).map((v) => (
            <button
              key={v}
              className={clsx(
                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                vista === v ? 'bg-marca-600 text-white' : 'text-slate-400 hover:text-slate-200',
              )}
              onClick={() => cambiarVista(v)}
            >
              {v === 'consolidado' ? 'Consolidado' : 'Por ubicación'}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <CampoBusqueda valor={buscar} onCambio={(x) => { setBuscar(x); setPagina(1); }} />
        </div>
        {vista === 'ubicacion' && (
          <select className="campo w-full sm:w-56" value={ubicacion} onChange={(e) => { setUbicacion(e.target.value); setPagina(1); }}>
            <option value="">Todas las ubicaciones</option>
            <optgroup label="Almacenes">
              {(almacenes?.datos ?? []).map((a) => (
                <option key={a.id} value={`ALMACEN:${a.id}`}>{a.nombre}</option>
              ))}
            </optgroup>
            <optgroup label="Tiendas">
              {(tiendas?.datos ?? []).map((t) => (
                <option key={t.id} value={`TIENDA:${t.id}`}>{t.nombre}</option>
              ))}
            </optgroup>
          </select>
        )}
      </div>

      {vista === 'consolidado' ? (
        <>
          <Tabla
            cargando={consolidado.isLoading}
            datos={consolidado.data?.datos ?? []}
            columnas={[
              { clave: 'sku', encabezado: 'SKU' },
              { clave: 'nombre', encabezado: 'Producto' },
              { clave: 'categoria', encabezado: 'Categoría', render: (p) => p.categoria ?? '—' },
              { clave: 'stockTotal', encabezado: 'Stock', render: (p) => (
                <span className="flex items-center gap-2">
                  {formatearNumero(p.stockTotal)} {p.bajoStock && <Badge variante="ambar">Bajo mínimo</Badge>}
                </span>
              )},
              { clave: 'valorCompra', encabezado: 'Valor (costo)', render: (p) => formatearMoneda(p.valorCompra, moneda) },
              { clave: 'valorVenta', encabezado: 'Valor (venta)', render: (p) => formatearMoneda(p.valorVenta, moneda) },
            ]}
          />
          <Paginacion meta={consolidado.data?.meta} onCambio={setPagina} />
        </>
      ) : (
        <>
          <Tabla
            cargando={porUbicacion.isLoading}
            datos={porUbicacion.data?.datos ?? []}
            columnas={[
              { clave: 'sku', encabezado: 'SKU', render: (r) => r.producto.sku },
              { clave: 'producto', encabezado: 'Producto', render: (r) => r.producto.nombre },
              { clave: 'ubicacionNombre', encabezado: 'Ubicación', render: (r) => (
                <span className="flex items-center gap-2">
                  {r.ubicacionNombre}
                  <Badge variante={r.ubicacionTipo === 'ALMACEN' ? 'azul' : 'morado'}>
                    {r.ubicacionTipo === 'ALMACEN' ? 'Almacén' : 'Tienda'}
                  </Badge>
                </span>
              )},
              { clave: 'cantidad', encabezado: 'Cantidad', render: (r) => (
                <span className="flex items-center gap-2">
                  {formatearNumero(r.cantidad)} {r.bajoStock && <Badge variante="ambar">Bajo</Badge>}
                </span>
              )},
            ]}
          />
          <Paginacion meta={porUbicacion.data?.meta} onCambio={setPagina} />
        </>
      )}
    </div>
  );
}
