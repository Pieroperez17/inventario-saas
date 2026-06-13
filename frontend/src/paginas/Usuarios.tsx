import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { KeyRound, Pencil, Plus, Power } from 'lucide-react';
import { apiUsuarios, apiUsuariosExtra } from '../api/servicios';
import { mensajeError } from '../api/cliente';
import { Usuario } from '../tipos/modelos';
import { EncabezadoPagina } from '../componentes/EncabezadoPagina';
import { Tabla } from '../componentes/Tabla';
import { Paginacion } from '../componentes/Paginacion';
import { Modal } from '../componentes/Modal';
import { Badge } from '../componentes/Badge';
import { BotonExportar } from '../componentes/BotonExportar';
import { CampoTexto, CampoSelect } from '../componentes/campos';
import { useDebounce } from '../hooks/useDebounce';
import { formatearFechaHora } from '../utilidades/formato';

const ROLES_OPC = [
  { valor: 'Administrador', texto: 'Administrador' },
  { valor: 'Editor', texto: 'Editor' },
  { valor: 'Visualizador', texto: 'Visualizador' },
];

const esquemaCrear = z.object({
  nombres: z.string().min(2, 'Obligatorio'),
  apellidos: z.string().min(2, 'Obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  rol: z.enum(['Administrador', 'Editor', 'Visualizador']),
});
const esquemaEditar = z.object({
  nombres: z.string().min(2, 'Obligatorio'),
  apellidos: z.string().min(2, 'Obligatorio'),
  rol: z.enum(['Administrador', 'Editor', 'Visualizador']),
});

function FormularioUsuario({
  editando,
  onGuardar,
  guardando,
}: {
  editando?: Usuario;
  onGuardar: (valores: Record<string, unknown>) => void;
  guardando: boolean;
}) {
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver((editando ? esquemaEditar : esquemaCrear) as never),
    defaultValues: editando
      ? { nombres: editando.nombres, apellidos: editando.apellidos, rol: editando.rol.nombre }
      : { nombres: '', apellidos: '', email: '', password: '', rol: 'Visualizador' },
  });
  return (
    <form onSubmit={form.handleSubmit(onGuardar)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto form={form} nombre="nombres" etiqueta="Nombres" />
        <CampoTexto form={form} nombre="apellidos" etiqueta="Apellidos" />
        {!editando && <CampoTexto form={form} nombre="email" etiqueta="Email" tipo="email" />}
        {!editando && <CampoTexto form={form} nombre="password" etiqueta="Contraseña" tipo="password" />}
        <CampoSelect form={form} nombre="rol" etiqueta="Rol" placeholder="" opciones={ROLES_OPC} />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

export default function Usuarios() {
  const qc = useQueryClient();
  const [pagina, setPagina] = useState(1);
  const [buscar, setBuscar] = useState('');
  const buscarD = useDebounce(buscar);
  const [modal, setModal] = useState<{ abierto: boolean; editando?: Usuario }>({ abierto: false });
  const [reset, setReset] = useState<Usuario | null>(null);
  const [nuevaPass, setNuevaPass] = useState('');

  const params = { pagina, buscar: buscarD };
  const { data, isLoading } = useQuery({ queryKey: ['usuarios', params], queryFn: () => apiUsuarios.listar(params) });

  const guardar = useMutation({
    mutationFn: (v: Record<string, unknown>) =>
      modal.editando ? apiUsuarios.actualizar(modal.editando.id, v) : apiUsuarios.crear(v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success(modal.editando ? 'Usuario actualizado.' : 'Usuario creado.');
      setModal({ abierto: false });
    },
    onError: (e) => toast.error(mensajeError(e)),
  });

  const estado = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => apiUsuariosExtra.cambiarEstado(id, activo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Estado actualizado.');
    },
    onError: (e) => toast.error(mensajeError(e)),
  });

  const restablecer = useMutation({
    mutationFn: ({ id, nueva }: { id: string; nueva: string }) => apiUsuariosExtra.restablecer(id, nueva),
    onSuccess: () => {
      toast.success('Contraseña restablecida.');
      setReset(null);
      setNuevaPass('');
    },
    onError: (e) => toast.error(mensajeError(e)),
  });

  return (
    <div>
      <EncabezadoPagina
        titulo="Usuarios"
        descripcion="Gestiona los usuarios de tu empresa y sus roles"
        acciones={
          <>
            <BotonExportar ruta="/exportar/usuarios" params={params} />
            <button className="btn-primario" onClick={() => setModal({ abierto: true })}>
              <Plus className="h-4 w-4" /> Nuevo
            </button>
          </>
        }
      />

      <div className="mb-4 w-full sm:w-72">
        <input className="campo" placeholder="Buscar usuario…" value={buscar} onChange={(e) => { setBuscar(e.target.value); setPagina(1); }} />
      </div>

      <Tabla<Usuario>
        cargando={isLoading}
        datos={data?.datos ?? []}
        columnas={[
          { clave: 'nombre', encabezado: 'Nombre', render: (u) => `${u.nombres} ${u.apellidos}` },
          { clave: 'email', encabezado: 'Email' },
          { clave: 'rol', encabezado: 'Rol', render: (u) => <Badge variante="morado">{u.rol.nombre}</Badge> },
          { clave: 'activo', encabezado: 'Estado', render: (u) => (u.activo ? <Badge variante="verde">Activo</Badge> : <Badge variante="gris">Inactivo</Badge>) },
          { clave: 'ultimoAcceso', encabezado: 'Último acceso', render: (u) => (u.ultimoAcceso ? formatearFechaHora(u.ultimoAcceso) : 'Nunca') },
          {
            clave: '__acc',
            encabezado: 'Acciones',
            className: 'text-right',
            render: (u) => (
              <div className="flex justify-end gap-1">
                <button className="btn-fantasma p-2" title="Editar" onClick={() => setModal({ abierto: true, editando: u })}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button className="btn-fantasma p-2" title="Restablecer contraseña" onClick={() => setReset(u)}>
                  <KeyRound className="h-4 w-4" />
                </button>
                <button
                  className={`btn-fantasma p-2 ${u.activo ? 'text-rose-400' : 'text-emerald-400'}`}
                  title={u.activo ? 'Desactivar' : 'Activar'}
                  onClick={() => estado.mutate({ id: u.id, activo: !u.activo })}
                >
                  <Power className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />
      <Paginacion meta={data?.meta} onCambio={setPagina} />

      <Modal
        abierto={modal.abierto}
        titulo={modal.editando ? 'Editar usuario' : 'Nuevo usuario'}
        onCerrar={() => setModal({ abierto: false })}
      >
        <FormularioUsuario
          key={modal.editando?.id ?? 'nuevo'}
          editando={modal.editando}
          guardando={guardar.isPending}
          onGuardar={(v) => guardar.mutate(v)}
        />
      </Modal>

      <Modal abierto={!!reset} titulo="Restablecer contraseña" onCerrar={() => setReset(null)} ancho="max-w-md">
        <label className="etiqueta">Nueva contraseña</label>
        <input className="campo" type="password" value={nuevaPass} onChange={(e) => setNuevaPass(e.target.value)} placeholder="Mínimo 8 caracteres" />
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secundario" onClick={() => setReset(null)}>Cancelar</button>
          <button
            className="btn-primario"
            disabled={nuevaPass.length < 8 || restablecer.isPending}
            onClick={() => reset && restablecer.mutate({ id: reset.id, nueva: nuevaPass })}
          >
            {restablecer.isPending ? 'Guardando…' : 'Restablecer'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
