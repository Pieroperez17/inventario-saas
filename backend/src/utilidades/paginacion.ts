/**
 * Helpers para paginación, ordenamiento y búsqueda del lado del servidor.
 */
import { Request } from 'express';

export interface ParametrosListado {
  pagina: number;
  limite: number;
  saltar: number;
  buscar: string;
  ordenarPor?: string;
  orden: 'asc' | 'desc';
}

export interface MetaPaginacion {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

/** Extrae y normaliza los parámetros de listado desde el query string. */
export function obtenerParametrosListado(
  req: Request,
  opciones: { limitePorDefecto?: number; ordenPorDefecto?: 'asc' | 'desc' } = {},
): ParametrosListado {
  const { limitePorDefecto = 10, ordenPorDefecto = 'desc' } = opciones;
  const q = req.query;

  let pagina = parseInt(String(q.pagina ?? '1'), 10);
  let limite = parseInt(String(q.limite ?? limitePorDefecto), 10);
  if (!Number.isFinite(pagina) || pagina < 1) pagina = 1;
  if (!Number.isFinite(limite) || limite < 1) limite = limitePorDefecto;
  if (limite > 100) limite = 100;

  const orden = String(q.orden).toLowerCase() === 'asc' ? 'asc' : ordenPorDefecto;
  const ordenarPor = q.ordenarPor ? String(q.ordenarPor) : undefined;
  const buscar = q.buscar ? String(q.buscar).trim() : '';

  return { pagina, limite, saltar: (pagina - 1) * limite, buscar, ordenarPor, orden };
}

/** Construye la metadata de paginación para las respuestas. */
export function construirMeta(total: number, pagina: number, limite: number): MetaPaginacion {
  return {
    pagina,
    limite,
    total,
    totalPaginas: Math.max(1, Math.ceil(total / limite)),
  };
}

/**
 * Construye un objeto `orderBy` de Prisma de forma segura: solo permite ordenar
 * por campos de la lista blanca; si no, usa el campo por defecto.
 */
export function construirOrden(
  ordenarPor: string | undefined,
  orden: 'asc' | 'desc',
  permitidos: string[],
  porDefecto: string,
): Record<string, 'asc' | 'desc'> {
  const campo = ordenarPor && permitidos.includes(ordenarPor) ? ordenarPor : porDefecto;
  return { [campo]: orden };
}
