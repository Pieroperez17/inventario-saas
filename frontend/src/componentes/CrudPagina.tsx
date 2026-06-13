/**
 * Página CRUD genérica reutilizable: encabezado, búsqueda, tabla paginada,
 * modal de alta/edición (react-hook-form + zod) y confirmación de borrado.
 * Cada recurso aporta su configuración (columnas, esquema y campos).
 */
import { ReactNode, useState } from 'react';
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Pagina } from '../api/servicios';
import { mensajeError } from '../api/cliente';
import { useDebounce } from '../hooks/useDebounce';
import { Tabla, Columna } from './Tabla';
import { Paginacion } from './Paginacion';
import { Modal, ModalConfirmacion } from './Modal';
import { EncabezadoPagina } from './EncabezadoPagina';
import { CampoBusqueda } from './CampoBusqueda';
import { BotonExportar } from './BotonExportar';

interface ApiCrud<T> {
  listar: (params?: Record<string, unknown>) => Promise<Pagina<T>>;
  crear: (cuerpo: unknown) => Promise<T>;
  actualizar: (id: string, cuerpo: unknown) => Promise<T>;
  eliminar: (id: string) => Promise<void>;
}

interface Props<T extends { id: string }> {
  titulo: string;
  descripcion?: string;
  singular: string;
  queryKey: string;
  api: ApiCrud<T>;
  columnas: Columna<T>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  esquema: ZodType<any>;
  valoresPorDefecto: FieldValues;
  aFormulario: (fila: T) => FieldValues;
  renderCampos: (form: UseFormReturn<FieldValues>) => ReactNode;
  transformar?: (valores: FieldValues) => unknown;
  paramsLista?: Record<string, unknown>;
  exportarRuta?: string;
  filtros?: ReactNode;
  puedeEditar?: boolean;
  puedeEliminar?: boolean;
  busquedaInicial?: string;
}

export function CrudPagina<T extends { id: string }>({
  titulo,
  descripcion,
  singular,
  queryKey,
  api,
  columnas,
  esquema,
  valoresPorDefecto,
  aFormulario,
  renderCampos,
  transformar,
  paramsLista,
  exportarRuta,
  filtros,
  puedeEditar = false,
  puedeEliminar = false,
  busquedaInicial = '',
}: Props<T>) {
  const qc = useQueryClient();
  const [pagina, setPagina] = useState(1);
  const [buscar, setBuscar] = useState(busquedaInicial);
  const buscarD = useDebounce(buscar);
  const [modal, setModal] = useState<{ abierto: boolean; editando?: T }>({ abierto: false });
  const [aEliminar, setAEliminar] = useState<T | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FieldValues>({ resolver: zodResolver(esquema as any), defaultValues: valoresPorDefecto });

  const params = { pagina, buscar: buscarD, ...paramsLista };
  const { data, isLoading } = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => api.listar(params),
  });

  const guardar = useMutation({
    mutationFn: (valores: FieldValues) => {
      const cuerpo = transformar ? transformar(valores) : valores;
      return modal.editando ? api.actualizar(modal.editando.id, cuerpo) : api.crear(cuerpo);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      toast.success(modal.editando ? `${singular} actualizado.` : `${singular} creado.`);
      setModal({ abierto: false });
    },
    onError: (e) => toast.error(mensajeError(e)),
  });

  const borrar = useMutation({
    mutationFn: (id: string) => api.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${singular} eliminado.`);
      setAEliminar(null);
    },
    onError: (e) => {
      toast.error(mensajeError(e));
      setAEliminar(null);
    },
  });

  const abrirNuevo = () => {
    form.reset(valoresPorDefecto);
    setModal({ abierto: true });
  };
  const abrirEdicion = (fila: T) => {
    form.reset(aFormulario(fila));
    setModal({ abierto: true, editando: fila });
  };

  const columnasConAcciones: Columna<T>[] =
    puedeEditar || puedeEliminar
      ? [
          ...columnas,
          {
            clave: '__acciones',
            encabezado: 'Acciones',
            className: 'text-right',
            render: (fila) => (
              <div className="flex justify-end gap-1">
                {puedeEditar && (
                  <button className="btn-fantasma p-2" title="Editar" onClick={() => abrirEdicion(fila)}>
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {puedeEliminar && (
                  <button className="btn-fantasma p-2 text-rose-400" title="Eliminar" onClick={() => setAEliminar(fila)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ),
          },
        ]
      : columnas;

  return (
    <div>
      <EncabezadoPagina
        titulo={titulo}
        descripcion={descripcion}
        acciones={
          <>
            {exportarRuta && <BotonExportar ruta={exportarRuta} params={{ buscar: buscarD, ...paramsLista }} />}
            {puedeEditar && (
              <button className="btn-primario" onClick={abrirNuevo}>
                <Plus className="h-4 w-4" /> Nuevo
              </button>
            )}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-72">
          <CampoBusqueda valor={buscar} onCambio={(v) => { setBuscar(v); setPagina(1); }} />
        </div>
        {filtros}
      </div>

      <Tabla columnas={columnasConAcciones} datos={data?.datos ?? []} cargando={isLoading} />
      <Paginacion meta={data?.meta} onCambio={setPagina} />

      <Modal
        abierto={modal.abierto}
        titulo={`${modal.editando ? 'Editar' : 'Nuevo'} ${singular.toLowerCase()}`}
        onCerrar={() => setModal({ abierto: false })}
      >
        <form onSubmit={form.handleSubmit((v) => guardar.mutate(v))} className="space-y-4">
          {renderCampos(form)}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secundario" onClick={() => setModal({ abierto: false })}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={guardar.isPending}>
              {guardar.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ModalConfirmacion
        abierto={!!aEliminar}
        titulo={`Eliminar ${singular.toLowerCase()}`}
        mensaje="Esta acción no se puede deshacer. ¿Deseas continuar?"
        onConfirmar={() => aEliminar && borrar.mutate(aEliminar.id)}
        onCancelar={() => setAEliminar(null)}
        cargando={borrar.isPending}
      />
    </div>
  );
}
