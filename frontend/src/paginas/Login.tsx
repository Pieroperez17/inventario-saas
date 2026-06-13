import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Boxes, LogIn } from 'lucide-react';
import { apiAuth } from '../api/servicios';
import { mensajeError } from '../api/cliente';
import { useAuthStore } from '../store/authStore';

const esquema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});
type Formulario = z.infer<typeof esquema>;

const DEMOS = [
  { etiqueta: 'Administrador', email: 'admin@demo.com', password: 'Admin123!' },
  { etiqueta: 'Editor', email: 'editor@demo.com', password: 'Editor123!' },
  { etiqueta: 'Visualizador', email: 'visor@demo.com', password: 'Visor123!' },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const setSesion = useAuthStore((s) => s.setSesion);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({ resolver: zodResolver(esquema) });

  const onSubmit = async (datos: Formulario) => {
    try {
      const sesion = await apiAuth.login(datos.email, datos.password);
      setSesion({ usuario: sesion.usuario, empresa: sesion.empresa, tokens: sesion.tokens });
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } catch (e) {
      toast.error(mensajeError(e, 'No se pudo iniciar sesión.'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-marca-600">
            <Boxes className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Inventario SaaS</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="tarjeta space-y-4">
          <div>
            <label className="etiqueta">Email</label>
            <input className="campo" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.email.message}</p>}
          </div>
          <div>
            <label className="etiqueta">Contraseña</label>
            <input className="campo" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.password.message}</p>
            )}
          </div>
          <button type="submit" className="btn-primario w-full" disabled={isSubmitting}>
            <LogIn className="h-4 w-4" />
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-medium text-marca-600 hover:text-marca-500 dark:text-marca-400 dark:hover:text-marca-300">
              Registra tu empresa
            </Link>
          </p>
        </form>

        <div className="mt-4 tarjeta">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Cuentas demo</p>
          <div className="flex flex-wrap gap-2">
            {DEMOS.map((d) => (
              <button
                key={d.email}
                type="button"
                className="btn-secundario text-xs"
                onClick={() => {
                  setValue('email', d.email);
                  setValue('password', d.password);
                }}
              >
                {d.etiqueta}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
