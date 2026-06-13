import { z } from 'zod';
import { CrudPagina } from '../componentes/CrudPagina';
import { CampoTexto } from '../componentes/campos';
import { apiTiendas } from '../api/servicios';
import { Ubicacion } from '../tipos/modelos';
import { useEsAdmin } from '../componentes/permisos';

const esquema = z.object({
  nombre: z.string().min(2, 'Obligatorio'),
  direccion: z.string().optional(),
  responsable: z.string().optional(),
  telefono: z.string().optional(),
});

export default function Tiendas() {
  const esAdmin = useEsAdmin();
  return (
    <CrudPagina<Ubicacion>
      titulo="Tiendas"
      descripcion="Puntos de venta de la empresa"
      singular="Tienda"
      queryKey="tiendas"
      api={apiTiendas}
      puedeEditar={esAdmin}
      puedeEliminar={esAdmin}
      columnas={[
        { clave: 'nombre', encabezado: 'Nombre' },
        { clave: 'direccion', encabezado: 'Dirección', render: (t) => t.direccion ?? '—' },
        { clave: 'responsable', encabezado: 'Responsable', render: (t) => t.responsable ?? '—' },
        { clave: 'telefono', encabezado: 'Teléfono', render: (t) => t.telefono ?? '—' },
      ]}
      esquema={esquema}
      valoresPorDefecto={{ nombre: '', direccion: '', responsable: '', telefono: '' }}
      aFormulario={(t) => ({ nombre: t.nombre, direccion: t.direccion ?? '', responsable: t.responsable ?? '', telefono: t.telefono ?? '' })}
      renderCampos={(form) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto form={form} nombre="nombre" etiqueta="Nombre" />
          <CampoTexto form={form} nombre="responsable" etiqueta="Responsable" />
          <CampoTexto form={form} nombre="telefono" etiqueta="Teléfono" />
          <CampoTexto form={form} nombre="direccion" etiqueta="Dirección" />
        </div>
      )}
    />
  );
}
