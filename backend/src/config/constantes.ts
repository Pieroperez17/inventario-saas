/**
 * Constantes de la aplicación: metadatos, roles del sistema y catálogo de
 * permisos granulares por módulo. El seed y los middlewares de autorización
 * consumen estos valores.
 */

export const APP = {
  nombre: 'Inventario SaaS',
  prefijoApi: '/api/v1',
  monedaPorDefecto: 'PEN',
  zonaHorariaPorDefecto: 'America/Lima',
} as const;

/** Roles del sistema (catálogo global). */
export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  EDITOR: 'Editor',
  VISUALIZADOR: 'Visualizador',
} as const;

export type NombreRol = (typeof ROLES)[keyof typeof ROLES];

/** Descripción de cada rol del sistema. */
export const DESCRIPCION_ROLES: Record<NombreRol, string> = {
  [ROLES.ADMINISTRADOR]:
    'Acceso total: gestiona empresa, usuarios, roles, ubicaciones, inventario, configuración y exportaciones.',
  [ROLES.EDITOR]:
    'Puede ver y editar inventario, productos y movimientos; no gestiona usuarios ni la configuración de la empresa.',
  [ROLES.VISUALIZADOR]:
    'Solo lectura: ve inventario y reportes y puede exportar, pero no edita nada.',
};

/** Definición de módulos y las acciones disponibles en cada uno. */
const DEFINICION_MODULOS = [
  { clave: 'empresa', etiqueta: 'Empresa', acciones: ['ver', 'editar'] },
  { clave: 'usuarios', etiqueta: 'Usuarios', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
  { clave: 'almacenes', etiqueta: 'Almacenes', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
  { clave: 'tiendas', etiqueta: 'Tiendas', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
  { clave: 'categorias', etiqueta: 'Categorías', acciones: ['ver', 'crear', 'editar', 'eliminar'] },
  { clave: 'productos', etiqueta: 'Productos', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
  { clave: 'inventario', etiqueta: 'Inventario', acciones: ['ver', 'editar', 'exportar'] },
  { clave: 'movimientos', etiqueta: 'Movimientos', acciones: ['ver', 'crear', 'exportar'] },
  { clave: 'proveedores', etiqueta: 'Proveedores', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
  { clave: 'reportes', etiqueta: 'Reportes', acciones: ['ver', 'exportar'] },
  { clave: 'auditoria', etiqueta: 'Auditoría', acciones: ['ver', 'exportar'] },
  { clave: 'notificaciones', etiqueta: 'Notificaciones', acciones: ['ver'] },
  { clave: 'mensajes', etiqueta: 'Mensajes', acciones: ['ver', 'crear'] },
] as const;

export interface DefinicionPermiso {
  codigo: string;
  modulo: string;
  descripcion: string;
}

/** Catálogo plano de permisos `modulo.accion` (ej.: "productos.crear"). */
export const CATALOGO_PERMISOS: DefinicionPermiso[] = DEFINICION_MODULOS.flatMap((modulo) =>
  modulo.acciones.map((accion) => ({
    codigo: `${modulo.clave}.${accion}`,
    modulo: modulo.clave,
    descripcion: `Permite ${accion} en ${modulo.etiqueta}`,
  })),
);

const codigoTermina = (sufijo: string) =>
  CATALOGO_PERMISOS.filter((permiso) => permiso.codigo.endsWith(sufijo)).map((p) => p.codigo);

/** Permisos del rol Visualizador: solo lectura y exportación. */
const PERMISOS_VISUALIZADOR = Array.from(
  new Set([...codigoTermina('.ver'), ...codigoTermina('.exportar')]),
);

/** Permisos del rol Editor: gestiona inventario sin tocar usuarios ni empresa. */
const PERMISOS_EDITOR = [
  'almacenes.ver',
  'tiendas.ver',
  'categorias.ver',
  'categorias.crear',
  'categorias.editar',
  'productos.ver',
  'productos.crear',
  'productos.editar',
  'productos.exportar',
  'inventario.ver',
  'inventario.editar',
  'inventario.exportar',
  'movimientos.ver',
  'movimientos.crear',
  'movimientos.exportar',
  'proveedores.ver',
  'proveedores.crear',
  'proveedores.editar',
  'proveedores.exportar',
  'reportes.ver',
  'reportes.exportar',
  'notificaciones.ver',
  'mensajes.ver',
  'mensajes.crear',
];

/**
 * Permisos asignados a cada rol. El valor `'*'` significa "todos los permisos".
 */
export const PERMISOS_POR_ROL: Record<NombreRol, string[] | '*'> = {
  [ROLES.ADMINISTRADOR]: '*',
  [ROLES.EDITOR]: PERMISOS_EDITOR,
  [ROLES.VISUALIZADOR]: PERMISOS_VISUALIZADOR,
};
