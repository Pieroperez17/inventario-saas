/** Tipos del dominio compartidos por el frontend. */

export interface RespuestaApi<T> {
  exito: boolean;
  mensaje?: string;
  datos: T;
  meta?: MetaPaginacion;
}

export interface MetaPaginacion {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  noLeidas?: number;
  noLeidos?: number;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

export interface Usuario {
  id: string;
  empresaId: string;
  nombres: string;
  apellidos: string;
  email: string;
  activo: boolean;
  ultimoAcceso?: string | null;
  creadoEn: string;
  rol: Rol;
}

export interface Empresa {
  id: string;
  razonSocial: string;
  ruc: string;
  direccion?: string | null;
  telefono?: string | null;
  email: string;
  logo?: string | null;
  moneda: string;
  zonaHoraria: string;
  activo: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  _count?: { productos: number };
}

export interface Ubicacion {
  id: string;
  nombre: string;
  direccion?: string | null;
  responsable?: string | null;
  telefono?: string | null;
  activo: boolean;
}

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  descripcion?: string | null;
  categoriaId?: string | null;
  categoria?: { id: string; nombre: string } | null;
  unidadMedida: string;
  precioCompra: number;
  precioVenta: number;
  stockMinimo: number;
  stockTotal?: number;
  bajoStock?: boolean;
  activo: boolean;
}

export type TipoUbicacion = 'ALMACEN' | 'TIENDA';
export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA';

export interface FilaInventario {
  id: string;
  productoId: string;
  producto: { id: string; sku: string; nombre: string; unidadMedida: string; stockMinimo: number };
  ubicacionTipo: TipoUbicacion;
  ubicacionId: string;
  ubicacionNombre: string;
  cantidad: number;
  bajoStock: boolean;
}

export interface ProductoConsolidado {
  id: string;
  sku: string;
  nombre: string;
  categoria: string | null;
  unidadMedida: string;
  stockTotal: number;
  stockMinimo: number;
  bajoStock: boolean;
  precioCompra: number;
  precioVenta: number;
  valorCompra: number;
  valorVenta: number;
}

export interface ReferenciaUbicacion {
  tipo: TipoUbicacion;
  id: string;
  nombre: string;
}

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo?: string | null;
  fecha: string;
  producto: { id: string; sku: string; nombre: string; unidadMedida: string };
  usuario: string | null;
  proveedor: string | null;
  origen: ReferenciaUbicacion | null;
  destino: ReferenciaUbicacion | null;
}

export interface Proveedor {
  id: string;
  razonSocial: string;
  ruc?: string | null;
  contacto?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  activo: boolean;
  _count?: { productos: number };
  productos?: { producto: { id: string; sku: string; nombre: string } }[];
}

export interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  creadoEn: string;
}

export interface Mensaje {
  id: string;
  asunto?: string | null;
  cuerpo: string;
  leido: boolean;
  creadoEn: string;
  remitente: { id: string; nombres: string; apellidos: string; email: string };
  destinatario: { id: string; nombres: string; apellidos: string; email: string };
}

export interface Contacto {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: { nombre: string };
}

export interface RegistroAuditoria {
  id: string;
  accion: string;
  entidad: string;
  entidadId?: string | null;
  creadoEn: string;
  ip?: string | null;
  usuario?: { nombres: string; apellidos: string; email: string } | null;
  detalles?: unknown;
}

export interface ResumenDashboard {
  tarjetas: {
    totalProductos: number;
    stockTotal: number;
    valorInventario: number;
    productosBajoMinimo: number;
    totalAlmacenes: number;
    totalTiendas: number;
    totalUsuarios: number;
  };
  existenciasPorUbicacion: { tipo: string; nombre: string; cantidad: number }[];
  topProductos: { sku: string; nombre: string; stock: number }[];
  movimientosRecientes: {
    id: string;
    tipo: TipoMovimiento;
    cantidad: number;
    fecha: string;
    producto: { sku: string; nombre: string };
  }[];
}
