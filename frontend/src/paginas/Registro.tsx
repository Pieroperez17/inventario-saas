import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Boxes } from 'lucide-react';
import { apiAuth } from '../api/servicios';
import { mensajeError } from '../api/cliente';
import { useAuthStore } from '../store/authStore';

const esquema = z.object({
  razonSocial: z.string().min(2, 'Obligatorio'),
  ruc: z.string().regex(/^\d{11}$/, 'El RUC debe tener 11 dígitos'),
  emailEmpresa: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  nombres: z.string().min(2, 'Obligatorio'),
  apellidos: z.string().min(2, 'Obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
type Formulario = z.infer<typeof esquema>;

export default function Registro() {
  const navigate = useNavigate();
  const setSesion = useAuthStore((s) => s.setSesion);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({ resolver: zodResolver(esquema) });

  const onSubmit = async (d: Formulario) => {
    try {
      const sesion = await apiAuth.registro({
        empresa: {
          razonSocial: d.razonSocial,
          ruc: d.ruc,
          email: d.emailEmpresa,
          telefono: d.telefono || undefined,
          direccion: d.direccion || undefined,
        },
        administrador: { nombres: d.nombres, apellidos: d.apellidos, email: d.email, password: d.password },
      });
      setSesion({ usuario: sesion.usuario, empresa: sesion.empresa, tokens: sesion.tokens });
      toast.success('¡Empresa registrada! Bienvenido.');
      navigate('/', { replace: true });
    } catch (e) {
      toast.error(mensajeError(e, 'No se pudo completar el registro.'));
    }
  };

  const campo = (
    nombre: keyof Formulario,
    etiqueta: string,
    tipo = 'text',
  ) => (
    <div>
      <label className="etiqueta">{etiqueta}</label>
      <input className="campo" type={tipo} {...register(nombre)} />
      {errors[nombre] && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors[nombre]?.message as string}</p>}
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-marca-600">
            <Boxes className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Registra tu empresa</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Crea tu cuenta y empieza a gestionar tu inventario</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="tarjeta space-y-5">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Datos de la empresa</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {campo('razonSocial', 'Razón social')}
              {campo('ruc', 'RUC')}
              {campo('emailEmpresa', 'Email de la empresa', 'email')}
              {campo('telefono', 'Teléfono (opcional)')}
              <div className="sm:col-span-2">{campo('direccion', 'Dirección (opcional)')}</div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Administrador de la cuenta
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {campo('nombres', 'Nombres')}
              {campo('apellidos', 'Apellidos')}
              {campo('email', 'Email', 'email')}
              {campo('password', 'Contraseña', 'password')}
            </div>
          </div>

          <button type="submit" className="btn-primario w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando…' : 'Crear empresa y cuenta'}
          </button>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-marca-600 hover:text-marca-500 dark:text-marca-400 dark:hover:text-marca-300">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
