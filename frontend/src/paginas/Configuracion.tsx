import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Moon, Sun } from 'lucide-react';
import { apiAuth } from '../api/servicios';
import { mensajeError } from '../api/cliente';
import { useAuthStore } from '../store/authStore';
import { useTemaStore } from '../store/temaStore';
import { EncabezadoPagina } from '../componentes/EncabezadoPagina';
import { Badge } from '../componentes/Badge';
import { CampoTexto } from '../componentes/campos';

const esquema = z
  .object({
    actual: z.string().min(1, 'Obligatorio'),
    nueva: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmar: z.string().min(1, 'Obligatorio'),
  })
  .refine((d) => d.nueva === d.confirmar, { path: ['confirmar'], message: 'Las contraseñas no coinciden' });
type Formulario = z.infer<typeof esquema>;

export default function Configuracion() {
  const usuario = useAuthStore((s) => s.usuario);
  const empresa = useAuthStore((s) => s.empresa);
  const tema = useTemaStore((s) => s.tema);
  const alternar = useTemaStore((s) => s.alternar);
  const form = useForm<Formulario>({ resolver: zodResolver(esquema), defaultValues: { actual: '', nueva: '', confirmar: '' } });

  const cambiar = useMutation({
    mutationFn: (v: Formulario) => apiAuth.cambiarContrasena(v.actual, v.nueva),
    onSuccess: () => {
      toast.success('Contraseña actualizada.');
      form.reset();
    },
    onError: (e) => toast.error(mensajeError(e)),
  });

  return (
    <div>
      <EncabezadoPagina titulo="Configuración" descripcion="Preferencias de tu cuenta" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tarjeta">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Mi perfil</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600 dark:text-slate-400">Nombre</dt>
              <dd className="text-slate-800 dark:text-slate-200">{usuario?.nombres} {usuario?.apellidos}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600 dark:text-slate-400">Email</dt>
              <dd className="text-slate-800 dark:text-slate-200">{usuario?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600 dark:text-slate-400">Rol</dt>
              <dd><Badge variante="morado">{usuario?.rol.nombre}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600 dark:text-slate-400">Empresa</dt>
              <dd className="text-slate-800 dark:text-slate-200">{empresa?.razonSocial}</dd>
            </div>
          </dl>

          <h3 className="mb-3 mt-6 font-semibold text-slate-900 dark:text-slate-100">Apariencia</h3>
          <button className="btn-secundario" onClick={alternar}>
            {tema === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Cambiar a tema {tema === 'dark' ? 'claro' : 'oscuro'}
          </button>
        </div>

        <div className="tarjeta">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Cambiar contraseña</h3>
          <form onSubmit={form.handleSubmit((v) => cambiar.mutate(v))} className="space-y-4">
            <CampoTexto form={form} nombre="actual" etiqueta="Contraseña actual" tipo="password" />
            <CampoTexto form={form} nombre="nueva" etiqueta="Nueva contraseña" tipo="password" />
            <CampoTexto form={form} nombre="confirmar" etiqueta="Confirmar nueva contraseña" tipo="password" />
            <button type="submit" className="btn-primario" disabled={cambiar.isPending}>
              {cambiar.isPending ? 'Guardando…' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
