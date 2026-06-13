import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import {
  apiMovimientos,
  apiProductos,
  apiAlmacenes,
  apiTiendas,
  apiProveedores,
} from '../api/servicios';
import { mensajeError } from '../api/cliente';
import { Movimiento } from '../tipos/modelos';
import { EncabezadoPagina } from '../componentes/EncabezadoPagina';
import { Tabla } from '../componentes/Tabla';
import { Paginacion } from '../componentes/Paginacion';
import { Modal } from '../componentes/Modal';
import { Badge } from '../componentes/Badge';
import { BotonExportar } from '../componentes/BotonExportar';
import { CampoTexto, CampoTextarea, CampoSelect } from '../componentes/campos';
import { usePuedeEditar } from '../componentes/permisos';
import { formatearFechaHora, formatearNumero } from '../utilidades/formato';
import { useDebounce } from '../hooks/useDebounce';

const esquema = z
  .object({
    tipo: z.enum(['ENTRADA', 'SALIDA', 'TRANSFERENCIA']),
    productoId: z.string().min(1, 'Selecciona un producto'),
    cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
    motivo: z.string().optional(),
    origen: z.string().optional(),
    destino: z.string().optional(),
    proveedorId: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if ((v.tipo === 'SALIDA' || v.tipo === 'TRANSFERENCIA') && !v.origen)
      ctx.addIssue({ code: 'custom', path: ['origen'], message: 'Selecciona el origen' });
    if ((v.tipo === 'ENTRADA' || v.tipo === 'TRANSFERENCIA') && !v.destino)
      ctx.addIssue({ code: 'custom', path: ['destino'], message: 'Selecciona el destino' });
    if (v.tipo === 'TRANSFERENCIA' && v.origen && v.origen === v.destino)
      ctx.addIssue({ code: 'custom', path: ['destino'], message: 'El destino debe ser distinto del origen' });
  });
type Formulario = z.infer<typeof esquema>;

const parseUbic = (s?: string) => (s ? { tipo: s.split(':')[0], id: s.split(':')[1] } : undefined);

export default function Movimientos() {
  const qc = useQueryClient();
  const puedeEditar = usePuedeEditar();
  const [pagina, setPagina] = useState(1);
  const [tipo, setTipo] = useState('');
  const [buscar, setBuscar] = useState('');
  const buscarD = useDebounce(buscar);
  const [modal, setModal] = useState(false);

  const params = { pagina, tipo: tipo || undefined, buscar: buscarD };
  const { data, isLoading } = useQuery({ queryKey: ['movimientos', params], queryFn: () => apiMovimientos.listar(params) });

  const { data: productos } = useQuery({ queryKey: ['prod-sel'], queryFn: () => apiProductos.listar({ limite: 200, activo: true }) });
  const { data: almacenes } = useQuery({ queryKey: ['alm-sel'], queryFn: () => apiAlmacenes.listar({ limite: 100 }) });
  const { data: tiendas } = useQuery({ queryKey: ['tie-sel'], queryFn: () => apiTiendas.listar({ limite: 100 }) });
  const { data: proveedores } = useQuery({ queryKey: ['prov-sel'], queryFn: () => apiProveedores.listar({ limite: 100 }) });

  const opcionesUbic = [
    ...(almacenes?.datos ?? []).map((a) => ({ valor: `ALMACEN:${a.id}`, texto: `🏭 ${a.nombre}` })),
    ...(tiendas?.datos ?? []).map((t) => ({ valor: `TIENDA:${t.id}`, texto: `🏬 ${t.nombre}` })),
  ];
  const opcionesProd = (productos?.datos ?? []).map((p) => ({ valor: p.id, texto: `${p.sku} · ${p.nombre}` }));
  const opcionesProv = (proveedores?.datos ?? []).map((p) => ({ valor: p.id, texto: p.razonSocial }));

  const form = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { tipo: 'ENTRADA', productoId: '', cantidad: 1, motivo: '', origen: '', destino: '', proveedorId: '' },
  });
  const tipoActual = form.watch('tipo');

  const registrar = useMutation({
    mutationFn: (v: Formulario) =>
      apiMovimientos.registrar({
        tipo: v.tipo,
        productoId: v.productoId,
        cantidad: v.cantidad,
        motivo: v.motivo || undefined,
        proveedorId: v.proveedorId || undefined,
        origen: parseUbic(v.origen),
        destino: parseUbic(v.destino),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimientos'] });
      qc.invalidateQueries({ queryKey: ['notif-no-leidas'] });
      toast.success('Movimiento registrado.');
      setModal(false);
    },
    onError: (e) => toast.error(mensajeError(e)),
  });

  const abrir = () => {
    form.reset({ tipo: 'ENTRADA', productoId: '', cantidad: 1, motivo: '', origen: '', destino: '', proveedorId: '' });
    setModal(true);
  };

  return (
    <div>
      <EncabezadoPagina
        titulo="Movimientos"
        descripcion="Entradas, salidas y transferencias de inventario"
        acciones={
          <>
            <BotonExportar ruta="/exportar/movimientos" params={params} />
            {puedeEditar && (
              <button className="btn-primario" onClick={abrir}>
                <Plus className="h-4 w-4" /> Registrar
              </button>
            )}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input className="campo w-full sm:w-64" placeholder="Buscar producto…" value={buscar} onChange={(e) => { setBuscar(e.target.value); setPagina(1); }} />
        <select className="campo w-full sm:w-48" value={tipo} onChange={(e) => { setTipo(e.target.value); setPagina(1); }}>
          <option value="">Todos los tipos</option>
          <option value="ENTRADA">Entradas</option>
          <option value="SALIDA">Salidas</option>
          <option value="TRANSFERENCIA">Transferencias</option>
        </select>
      </div>

      <Tabla<Movimiento>
        cargando={isLoading}
        datos={data?.datos ?? []}
        columnas={[
          { clave: 'fecha', encabezado: 'Fecha', render: (m) => formatearFechaHora(m.fecha) },
          { clave: 'tipo', encabezado: 'Tipo', render: (m) => (
            <Badge variante={m.tipo === 'ENTRADA' ? 'verde' : m.tipo === 'SALIDA' ? 'rojo' : 'azul'}>{m.tipo}</Badge>
          )},
          { clave: 'producto', encabezado: 'Producto', render: (m) => `${m.producto.sku} · ${m.producto.nombre}` },
          { clave: 'cantidad', encabezado: 'Cantidad', render: (m) => formatearNumero(m.cantidad) },
          { clave: 'origen', encabezado: 'Origen', render: (m) => m.origen?.nombre ?? '—' },
          { clave: 'destino', encabezado: 'Destino', render: (m) => m.destino?.nombre ?? '—' },
          { clave: 'usuario', encabezado: 'Usuario', render: (m) => m.usuario ?? '—' },
        ]}
      />
      <Paginacion meta={data?.meta} onCambio={setPagina} />

      <Modal abierto={modal} titulo="Registrar movimiento" onCerrar={() => setModal(false)}>
        <form onSubmit={form.handleSubmit((v) => registrar.mutate(v))} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoSelect
              form={form}
              nombre="tipo"
              etiqueta="Tipo de movimiento"
              placeholder=""
              opciones={[
                { valor: 'ENTRADA', texto: 'Entrada' },
                { valor: 'SALIDA', texto: 'Salida' },
                { valor: 'TRANSFERENCIA', texto: 'Transferencia' },
              ]}
            />
            <CampoTexto form={form} nombre="cantidad" etiqueta="Cantidad" tipo="number" />
          </div>
          <CampoSelect form={form} nombre="productoId" etiqueta="Producto" opciones={opcionesProd} />

          <div className="grid gap-4 sm:grid-cols-2">
            {(tipoActual === 'SALIDA' || tipoActual === 'TRANSFERENCIA') && (
              <CampoSelect form={form} nombre="origen" etiqueta="Origen" opciones={opcionesUbic} />
            )}
            {(tipoActual === 'ENTRADA' || tipoActual === 'TRANSFERENCIA') && (
              <CampoSelect form={form} nombre="destino" etiqueta="Destino" opciones={opcionesUbic} />
            )}
          </div>

          {tipoActual === 'ENTRADA' && (
            <CampoSelect form={form} nombre="proveedorId" etiqueta="Proveedor (opcional)" opciones={opcionesProv} />
          )}

          <CampoTextarea form={form} nombre="motivo" etiqueta="Motivo (opcional)" />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secundario" onClick={() => setModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={registrar.isPending}>
              {registrar.isPending ? 'Registrando…' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
