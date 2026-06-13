import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CrudPagina } from '../componentes/CrudPagina';
import { CampoTexto, CampoTextarea, CampoSelect } from '../componentes/campos';
import { Badge } from '../componentes/Badge';
import { apiProductos, apiCategorias } from '../api/servicios';
import { Producto } from '../tipos/modelos';
import { usePuedeEditar, useEsAdmin } from '../componentes/permisos';
import { useAuthStore } from '../store/authStore';
import { formatearMoneda, formatearNumero } from '../utilidades/formato';

const esquema = z.object({
  sku: z.string().min(1, 'Obligatorio'),
  nombre: z.string().min(2, 'Obligatorio'),
  categoriaId: z.string().optional(),
  unidadMedida: z.string().min(1, 'Obligatorio'),
  precioCompra: z.number().min(0, '≥ 0'),
  precioVenta: z.number().min(0, '≥ 0'),
  stockMinimo: z.number().min(0, '≥ 0'),
  descripcion: z.string().optional(),
});

export default function Productos() {
  const puedeEditar = usePuedeEditar();
  const esAdmin = useEsAdmin();
  const moneda = useAuthStore((s) => s.empresa?.moneda ?? 'PEN');
  const [sp] = useSearchParams();

  const { data: cats } = useQuery({ queryKey: ['categorias-todas'], queryFn: () => apiCategorias.listar({ limite: 100 }) });
  const opcionesCat = (cats?.datos ?? []).map((c) => ({ valor: c.id, texto: c.nombre }));

  return (
    <CrudPagina<Producto>
      titulo="Productos"
      descripcion="Catálogo de productos de la empresa"
      singular="Producto"
      queryKey="productos"
      api={apiProductos}
      busquedaInicial={sp.get('buscar') ?? ''}
      exportarRuta="/exportar/productos"
      puedeEditar={puedeEditar}
      puedeEliminar={esAdmin}
      columnas={[
        { clave: 'sku', encabezado: 'SKU' },
        { clave: 'nombre', encabezado: 'Nombre' },
        { clave: 'categoria', encabezado: 'Categoría', render: (p) => p.categoria?.nombre ?? '—' },
        { clave: 'precioVenta', encabezado: 'P. venta', render: (p) => formatearMoneda(p.precioVenta, moneda) },
        {
          clave: 'stockTotal',
          encabezado: 'Stock',
          render: (p) => (
            <span className="flex items-center gap-2">
              {formatearNumero(p.stockTotal ?? 0)}
              {p.bajoStock && <Badge variante="ambar">Bajo</Badge>}
            </span>
          ),
        },
        {
          clave: 'activo',
          encabezado: 'Estado',
          render: (p) => (p.activo ? <Badge variante="verde">Activo</Badge> : <Badge variante="gris">Inactivo</Badge>),
        },
      ]}
      esquema={esquema}
      valoresPorDefecto={{
        sku: '', nombre: '', categoriaId: '', unidadMedida: 'UNIDAD', precioCompra: 0, precioVenta: 0, stockMinimo: 0, descripcion: '',
      }}
      aFormulario={(p) => ({
        sku: p.sku, nombre: p.nombre, categoriaId: p.categoriaId ?? '', unidadMedida: p.unidadMedida,
        precioCompra: p.precioCompra, precioVenta: p.precioVenta, stockMinimo: p.stockMinimo, descripcion: p.descripcion ?? '',
      })}
      transformar={(v) => ({ ...v, categoriaId: v.categoriaId || null })}
      renderCampos={(form) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto form={form} nombre="sku" etiqueta="SKU" />
            <CampoTexto form={form} nombre="nombre" etiqueta="Nombre" />
            <CampoSelect form={form} nombre="categoriaId" etiqueta="Categoría" opciones={opcionesCat} placeholder="Sin categoría" />
            <CampoTexto form={form} nombre="unidadMedida" etiqueta="Unidad de medida" />
            <CampoTexto form={form} nombre="precioCompra" etiqueta="Precio de compra" tipo="number" />
            <CampoTexto form={form} nombre="precioVenta" etiqueta="Precio de venta" tipo="number" />
            <CampoTexto form={form} nombre="stockMinimo" etiqueta="Stock mínimo" tipo="number" />
          </div>
          <CampoTextarea form={form} nombre="descripcion" etiqueta="Descripción" />
        </>
      )}
    />
  );
}
