import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { PenSquare } from 'lucide-react';
import { apiMensajes } from '../api/servicios';
import { mensajeError } from '../api/cliente';
import { Mensaje } from '../tipos/modelos';
import { EncabezadoPagina } from '../componentes/EncabezadoPagina';
import { Spinner } from '../componentes/Spinner';
import { Modal } from '../componentes/Modal';
import { Badge } from '../componentes/Badge';
import { CampoSelect, CampoTexto, CampoTextarea } from '../componentes/campos';
import { formatearFechaHora } from '../utilidades/formato';

type Carpeta = 'bandeja' | 'enviados';

const esquema = z.object({
  destinatarioId: z.string().min(1, 'Selecciona un destinatario'),
  asunto: z.string().optional(),
  cuerpo: z.string().min(1, 'Escribe un mensaje'),
});
type Formulario = z.infer<typeof esquema>;

export default function Mensajes() {
  const qc = useQueryClient();
  const [carpeta, setCarpeta] = useState<Carpeta>('bandeja');
  const [componer, setComponer] = useState(false);
  const [abierto, setAbierto] = useState<Mensaje | null>(null);

  const lista = useQuery({
    queryKey: ['mensajes', carpeta],
    queryFn: () => (carpeta === 'bandeja' ? apiMensajes.bandeja() : apiMensajes.enviados()),
  });
  const { data: contactos } = useQuery({ queryKey: ['contactos'], queryFn: apiMensajes.contactos });

  const form = useForm<Formulario>({ resolver: zodResolver(esquema), defaultValues: { destinatarioId: '', asunto: '', cuerpo: '' } });

  const enviar = useMutation({
    mutationFn: (v: Formulario) => apiMensajes.enviar(v),
    onSuccess: () => {
      toast.success('Mensaje enviado.');
      setComponer(false);
      form.reset();
      qc.invalidateQueries({ queryKey: ['mensajes'] });
    },
    onError: (e) => toast.error(mensajeError(e)),
  });

  const abrir = async (m: Mensaje) => {
    const completo = await apiMensajes.obtener(m.id);
    setAbierto(completo);
    qc.invalidateQueries({ queryKey: ['mensajes'] });
    qc.invalidateQueries({ queryKey: ['notif-no-leidas'] });
  };

  return (
    <div>
      <EncabezadoPagina
        titulo="Mensajes"
        descripcion="Comunicación interna entre el equipo"
        acciones={
          <button className="btn-primario" onClick={() => { form.reset(); setComponer(true); }}>
            <PenSquare className="h-4 w-4" /> Nuevo mensaje
          </button>
        }
      />

      <div className="mb-4 inline-flex rounded-lg border border-slate-800 bg-slate-900 p-1">
        {(['bandeja', 'enviados'] as Carpeta[]).map((c) => (
          <button
            key={c}
            className={clsx('rounded-md px-3 py-1.5 text-sm font-medium transition', carpeta === c ? 'bg-marca-600 text-white' : 'text-slate-400 hover:text-slate-200')}
            onClick={() => setCarpeta(c)}
          >
            {c === 'bandeja' ? 'Recibidos' : 'Enviados'}
          </button>
        ))}
      </div>

      {lista.isLoading ? (
        <Spinner />
      ) : (lista.data?.datos.length ?? 0) === 0 ? (
        <div className="tarjeta py-12 text-center text-slate-500">No hay mensajes.</div>
      ) : (
        <div className="divide-y divide-slate-800 overflow-hidden rounded-xl border border-slate-800">
          {lista.data!.datos.map((m) => {
            const otro = carpeta === 'bandeja' ? m.remitente : m.destinatario;
            return (
              <button
                key={m.id}
                onClick={() => abrir(m)}
                className={clsx('flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/40', carpeta === 'bandeja' && !m.leido && 'bg-marca-600/10')}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {otro.nombres} {otro.apellidos}
                    </p>
                    {carpeta === 'bandeja' && !m.leido && <Badge variante="morado">Nuevo</Badge>}
                  </div>
                  <p className="truncate text-sm text-slate-400">{m.asunto || '(Sin asunto)'} — {m.cuerpo}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-500">{formatearFechaHora(m.creadoEn)}</span>
              </button>
            );
          })}
        </div>
      )}

      <Modal abierto={componer} titulo="Nuevo mensaje" onCerrar={() => setComponer(false)}>
        <form onSubmit={form.handleSubmit((v) => enviar.mutate(v))} className="space-y-4">
          <CampoSelect
            form={form}
            nombre="destinatarioId"
            etiqueta="Para"
            opciones={(contactos ?? []).map((c) => ({ valor: c.id, texto: `${c.nombres} ${c.apellidos} (${c.rol.nombre})` }))}
          />
          <CampoTexto form={form} nombre="asunto" etiqueta="Asunto (opcional)" />
          <CampoTextarea form={form} nombre="cuerpo" etiqueta="Mensaje" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secundario" onClick={() => setComponer(false)}>Cancelar</button>
            <button type="submit" className="btn-primario" disabled={enviar.isPending}>
              {enviar.isPending ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal abierto={!!abierto} titulo={abierto?.asunto || '(Sin asunto)'} onCerrar={() => setAbierto(null)}>
        {abierto && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>De: {abierto.remitente.nombres} {abierto.remitente.apellidos}</span>
              <span>{formatearFechaHora(abierto.creadoEn)}</span>
            </div>
            <p className="whitespace-pre-wrap text-slate-200">{abierto.cuerpo}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
