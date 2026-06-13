import { z } from 'zod';
import { CrudPagina } from '../componentes/CrudPagina';
import { CampoTexto } from '../componentes/campos';
import { apiProveedores } from '../api/servicios';
import { Proveedor } from '../tipos/modelos';
import { usePuedeEditar, useEsAdmin } from '../componentes/permisos';

const esquema = z.object({
  razonSocial: z.string().min(2, 'Obligatorio'),
  ruc: z.string().optional(),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
});

export default function Proveedores() {
  const puedeEditar = usePuedeEditar();
  const esAdmin = useEsAdmin();
  return (
    <CrudPagina<Proveedor>
      titulo="Proveedores"
      descripcion="Proveedores y contactos comerciales"
      singular="Proveedor"
      queryKey="proveedores"
      api={apiProveedores}
      puedeEditar={puedeEditar}
      puedeEliminar={esAdmin}
      columnas={[
        { clave: 'razonSocial', encabezado: 'Razón social' },
        { clave: 'ruc', encabezado: 'RUC', render: (p) => p.ruc ?? '—' },
        { clave: 'contacto', encabezado: 'Contacto', render: (p) => p.contacto ?? '—' },
        { clave: 'telefono', encabezado: 'Teléfono', render: (p) => p.telefono ?? '—' },
        { clave: 'productos', encabezado: 'Productos', render: (p) => p._count?.productos ?? 0 },
      ]}
      esquema={esquema}
      valoresPorDefecto={{ razonSocial: '', ruc: '', contacto: '', telefono: '', email: '', direccion: '' }}
      aFormulario={(p) => ({
        razonSocial: p.razonSocial, ruc: p.ruc ?? '', contacto: p.contacto ?? '', telefono: p.telefono ?? '', email: p.email ?? '', direccion: p.direccion ?? '',
      })}
      renderCampos={(form) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto form={form} nombre="razonSocial" etiqueta="Razón social" />
          <CampoTexto form={form} nombre="ruc" etiqueta="RUC" />
          <CampoTexto form={form} nombre="contacto" etiqueta="Contacto" />
          <CampoTexto form={form} nombre="telefono" etiqueta="Teléfono" />
          <CampoTexto form={form} nombre="email" etiqueta="Email" tipo="email" />
          <CampoTexto form={form} nombre="direccion" etiqueta="Dirección" />
        </div>
      )}
    />
  );
}
