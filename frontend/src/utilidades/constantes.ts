/** Constantes del frontend: roles y configuración de navegación. */

export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  EDITOR: 'Editor',
  VISUALIZADOR: 'Visualizador',
} as const;

export type NombreRol = (typeof ROLES)[keyof typeof ROLES];

/** Roles que pueden crear/editar (no Visualizador). */
export const ROLES_EDICION: string[] = [ROLES.ADMINISTRADOR, ROLES.EDITOR];

export const ETIQUETA_MOVIMIENTO: Record<string, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  TRANSFERENCIA: 'Transferencia',
};
