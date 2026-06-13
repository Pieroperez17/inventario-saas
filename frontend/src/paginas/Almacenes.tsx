import { z } from 'zod';
import { CrudPagina } from '../componentes/CrudPagina';
import { CampoTexto } from '../componentes/campos';
import { apiAlmacenes } from '../api/servicios';
import { Ubicacion } from '../tipos/modelos';
import { useEsAdmin } from '../componentes/permisos';

const esquema = z.object({
  nombre: z.string().min(2, 'Obligatorio'),
  direccion: z.string().optional(),
  responsable: z.string().optional(),
  telefono: z.string().optional(),
});

export default function Almacenes() {
  const esAdmin = useEsAdmin();
  return (
    <CrudPagina<Ubicacion>
      titulo="Almacenes"
      descripcion="Depósitos de la empresa"
      singular="Almacén"
      queryKey="almacenes"
      api={apiAlmacenes}
      exportarRuta="/exportar/inventario"
      puedeEditar={esAdmin}
      puedeEliminar={esAdmin}
      columnas={[
        { clave: 'nombre', encabezado: 'Nombre' },
        { clave: 'direccion', encabezado: 'Dirección', render: (a) => a.direccion ?? '—' },
        { clave: 'responsable', encabezado: 'Responsable', render: (a) => a.responsable ?? '—' },
        { clave: 'telefono', encabezado: 'Teléfono', render: (a) => a.telefono ?? '—' },
      ]}
      esquema={esquema}
      valoresPorDefecto={{ nombre: '', direccion: '', responsable: '', telefono: '' }}
      aFormulario={(a) => ({ nombre: a.nombre, direccion: a.direccion ?? '', responsable: a.responsable ?? '', telefono: a.telefono ?? '' })}
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
