import { z } from 'zod';
import { CrudPagina } from '../componentes/CrudPagina';
import { CampoTexto, CampoTextarea } from '../componentes/campos';
import { apiCategorias } from '../api/servicios';
import { Categoria } from '../tipos/modelos';
import { usePuedeEditar, useEsAdmin } from '../componentes/permisos';

const esquema = z.object({
  nombre: z.string().min(2, 'Obligatorio'),
  descripcion: z.string().optional(),
});

export default function Categorias() {
  const puedeEditar = usePuedeEditar();
  const esAdmin = useEsAdmin();
  return (
    <CrudPagina<Categoria>
      titulo="Categorías"
      descripcion="Clasificación de los productos"
      singular="Categoría"
      queryKey="categorias"
      api={apiCategorias}
      puedeEditar={puedeEditar}
      puedeEliminar={esAdmin}
      columnas={[
        { clave: 'nombre', encabezado: 'Nombre' },
        { clave: 'descripcion', encabezado: 'Descripción', render: (c) => c.descripcion ?? '—' },
        { clave: 'productos', encabezado: 'Productos', render: (c) => c._count?.productos ?? 0 },
      ]}
      esquema={esquema}
      valoresPorDefecto={{ nombre: '', descripcion: '' }}
      aFormulario={(c) => ({ nombre: c.nombre, descripcion: c.descripcion ?? '' })}
      renderCampos={(form) => (
        <>
          <CampoTexto form={form} nombre="nombre" etiqueta="Nombre" />
          <CampoTextarea form={form} nombre="descripcion" etiqueta="Descripción" />
        </>
      )}
    />
  );
}
