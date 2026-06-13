import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiEmpresa } from '../api/servicios';
import { mensajeError } from '../api/cliente';
import { useAuthStore } from '../store/authStore';
import { EncabezadoPagina } from '../componentes/EncabezadoPagina';
import { Spinner } from '../componentes/Spinner';
import { CampoTexto, CampoSelect } from '../componentes/campos';

const esquema = z.object({
  razonSocial: z.string().min(2, 'Obligatorio'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  logo: z.string().optional(),
  moneda: z.string().min(3).max(3),
  zonaHoraria: z.string().min(3),
});
type Formulario = z.infer<typeof esquema>;

export default function Empresa() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['empresa'], queryFn: apiEmpresa.obtener });
  const form = useForm<Formulario>({ resolver: zodResolver(esquema) });

  useEffect(() => {
    if (data) {
      form.reset({
        razonSocial: data.razonSocial,
        email: data.email,
        telefono: data.telefono ?? '',
        direccion: data.direccion ?? '',
        logo: data.logo ?? '',
        moneda: data.moneda,
        zonaHoraria: data.zonaHoraria,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const guardar = useMutation({
    mutationFn: (v: Formulario) => apiEmpresa.actualizar(v),
    onSuccess: (empresa) => {
      useAuthStore.setState({ empresa });
      qc.invalidateQueries({ queryKey: ['empresa'] });
      toast.success('Datos de la empresa actualizados.');
    },
    onError: (e) => toast.error(mensajeError(e)),
  });

  if (isLoading || !data) return <Spinner />;

  return (
    <div>
      <EncabezadoPagina titulo="Empresa" descripcion="Datos y configuración general de tu empresa" />
      <form onSubmit={form.handleSubmit((v) => guardar.mutate(v))} className="tarjeta max-w-3xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta">RUC</label>
            <input className="campo opacity-60" value={data.ruc} disabled />
          </div>
          <CampoTexto form={form} nombre="razonSocial" etiqueta="Razón social" />
          <CampoTexto form={form} nombre="email" etiqueta="Email" tipo="email" />
          <CampoTexto form={form} nombre="telefono" etiqueta="Teléfono" />
          <div className="sm:col-span-2">
            <CampoTexto form={form} nombre="direccion" etiqueta="Dirección" />
          </div>
          <CampoSelect
            form={form}
            nombre="moneda"
            etiqueta="Moneda"
            placeholder=""
            opciones={[
              { valor: 'PEN', texto: 'Soles (PEN)' },
              { valor: 'USD', texto: 'Dólares (USD)' },
              { valor: 'EUR', texto: 'Euros (EUR)' },
            ]}
          />
          <CampoTexto form={form} nombre="zonaHoraria" etiqueta="Zona horaria" />
          <div className="sm:col-span-2">
            <CampoTexto form={form} nombre="logo" etiqueta="URL del logo (opcional)" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primario" disabled={guardar.isPending}>
            {guardar.isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
