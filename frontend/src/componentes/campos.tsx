/** Campos de formulario reutilizables, integrados con react-hook-form. */
// Tipado laxo a propósito: estos campos sirven para cualquier formulario RHF
// (tipado o no), evitando problemas de invarianza de tipos.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Form = any;

function ErrorCampo({ form, nombre }: { form: Form; nombre: string }) {
  const mensaje = form.formState.errors[nombre]?.message as string | undefined;
  if (!mensaje) return null;
  return <p className="mt-1 text-xs text-rose-400">{mensaje}</p>;
}

export function CampoTexto({
  form,
  nombre,
  etiqueta,
  tipo = 'text',
  placeholder,
}: {
  form: Form;
  nombre: string;
  etiqueta: string;
  tipo?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="etiqueta">{etiqueta}</label>
      <input
        className="campo"
        type={tipo}
        placeholder={placeholder}
        {...form.register(nombre, tipo === 'number' ? { valueAsNumber: true } : {})}
      />
      <ErrorCampo form={form} nombre={nombre} />
    </div>
  );
}

export function CampoTextarea({
  form,
  nombre,
  etiqueta,
  placeholder,
}: {
  form: Form;
  nombre: string;
  etiqueta: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="etiqueta">{etiqueta}</label>
      <textarea className="campo min-h-[80px]" placeholder={placeholder} {...form.register(nombre)} />
      <ErrorCampo form={form} nombre={nombre} />
    </div>
  );
}

export function CampoSelect({
  form,
  nombre,
  etiqueta,
  opciones,
  placeholder = 'Seleccionar…',
}: {
  form: Form;
  nombre: string;
  etiqueta: string;
  opciones: { valor: string; texto: string }[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="etiqueta">{etiqueta}</label>
      <select className="campo" {...form.register(nombre)}>
        <option value="">{placeholder}</option>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
      <ErrorCampo form={form} nombre={nombre} />
    </div>
  );
}

export function CampoCheck({ form, nombre, etiqueta }: { form: Form; nombre: string; etiqueta: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-2 text-sm text-slate-300">
      <input type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-slate-800" {...form.register(nombre)} />
      {etiqueta}
    </label>
  );
}
