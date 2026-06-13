/**
 * Capa de servicios de la API: funciones tipadas que envuelven al cliente Axios.
 */
import { cliente } from './cliente';
import {
  RespuestaApi,
  MetaPaginacion,
  Usuario,
  Empresa,
  Categoria,
  Ubicacion,
  Producto,
  FilaInventario,
  ProductoConsolidado,
  Movimiento,
  Proveedor,
  Notificacion,
  Mensaje,
  Contacto,
  RegistroAuditoria,
  ResumenDashboard,
} from '../tipos/modelos';

export interface Pagina<T> {
  datos: T[];
  meta?: MetaPaginacion;
}

type Consulta = Record<string, unknown>;

/** CRUD genérico para recursos REST estándar. */
function crearRecurso<T>(ruta: string) {
  return {
    listar: async (params?: Consulta): Promise<Pagina<T>> => {
      const { data } = await cliente.get<RespuestaApi<T[]>>(ruta, { params });
      return { datos: data.datos, meta: data.meta };
    },
    obtener: async (id: string): Promise<T> => {
      const { data } = await cliente.get<RespuestaApi<T>>(`${ruta}/${id}`);
      return data.datos;
    },
    crear: async (cuerpo: unknown): Promise<T> => {
      const { data } = await cliente.post<RespuestaApi<T>>(ruta, cuerpo);
      return data.datos;
    },
    actualizar: async (id: string, cuerpo: unknown): Promise<T> => {
      const { data } = await cliente.put<RespuestaApi<T>>(`${ruta}/${id}`, cuerpo);
      return data.datos;
    },
    eliminar: async (id: string): Promise<void> => {
      await cliente.delete(`${ruta}/${id}`);
    },
  };
}

export const apiProductos = crearRecurso<Producto>('/productos');
export const apiCategorias = crearRecurso<Categoria>('/categorias');
export const apiAlmacenes = crearRecurso<Ubicacion>('/almacenes');
export const apiTiendas = crearRecurso<Ubicacion>('/tiendas');
export const apiProveedores = crearRecurso<Proveedor>('/proveedores');
export const apiUsuarios = crearRecurso<Usuario>('/usuarios');

export interface SesionResp {
  usuario: Usuario;
  empresa: Empresa;
  tokens: { accessToken: string; refreshToken: string };
}

export const apiAuth = {
  login: async (email: string, password: string): Promise<SesionResp> =>
    (await cliente.post<RespuestaApi<SesionResp>>('/auth/login', { email, password })).data.datos,
  registro: async (cuerpo: unknown): Promise<SesionResp> =>
    (await cliente.post<RespuestaApi<SesionResp>>('/auth/registro', cuerpo)).data.datos,
  perfil: async (): Promise<{ usuario: Usuario; empresa: Empresa; permisos: string[] }> =>
    (await cliente.get<RespuestaApi<{ usuario: Usuario; empresa: Empresa; permisos: string[] }>>('/auth/yo')).data.datos,
  logout: async (refreshToken: string): Promise<void> => {
    await cliente.post('/auth/logout', { refreshToken });
  },
  cambiarContrasena: async (actual: string, nueva: string): Promise<void> => {
    await cliente.post('/auth/cambiar-contrasena', { actual, nueva });
  },
};

export const apiEmpresa = {
  obtener: async (): Promise<Empresa> => (await cliente.get<RespuestaApi<Empresa>>('/empresa')).data.datos,
  actualizar: async (cuerpo: unknown): Promise<Empresa> =>
    (await cliente.put<RespuestaApi<Empresa>>('/empresa', cuerpo)).data.datos,
};

export const apiUsuariosExtra = {
  cambiarEstado: async (id: string, activo: boolean): Promise<Usuario> =>
    (await cliente.patch<RespuestaApi<Usuario>>(`/usuarios/${id}/estado`, { activo })).data.datos,
  restablecer: async (id: string, nueva: string): Promise<void> => {
    await cliente.post(`/usuarios/${id}/restablecer-contrasena`, { nueva });
  },
};

export const apiInventario = {
  porUbicacion: async (params?: Consulta): Promise<Pagina<FilaInventario>> => {
    const { data } = await cliente.get<RespuestaApi<FilaInventario[]>>('/inventario', { params });
    return { datos: data.datos, meta: data.meta };
  },
  consolidado: async (params?: Consulta): Promise<Pagina<ProductoConsolidado>> => {
    const { data } = await cliente.get<RespuestaApi<ProductoConsolidado[]>>('/inventario/consolidado', { params });
    return { datos: data.datos, meta: data.meta };
  },
  alertas: async (): Promise<ProductoConsolidado[]> =>
    (await cliente.get<RespuestaApi<ProductoConsolidado[]>>('/inventario/alertas')).data.datos,
};

export const apiMovimientos = {
  listar: async (params?: Consulta): Promise<Pagina<Movimiento>> => {
    const { data } = await cliente.get<RespuestaApi<Movimiento[]>>('/movimientos', { params });
    return { datos: data.datos, meta: data.meta };
  },
  registrar: async (cuerpo: unknown): Promise<Movimiento> =>
    (await cliente.post<RespuestaApi<Movimiento>>('/movimientos', cuerpo)).data.datos,
};

export const apiProveedoresExtra = {
  asociarProductos: async (id: string, productoIds: string[]): Promise<Proveedor> =>
    (await cliente.post<RespuestaApi<Proveedor>>(`/proveedores/${id}/productos`, { productoIds })).data.datos,
};

export const apiNotificaciones = {
  listar: async (params?: Consulta): Promise<Pagina<Notificacion>> => {
    const { data } = await cliente.get<RespuestaApi<Notificacion[]>>('/notificaciones', { params });
    return { datos: data.datos, meta: data.meta };
  },
  noLeidas: async (): Promise<number> =>
    (await cliente.get<RespuestaApi<{ noLeidas: number }>>('/notificaciones/no-leidas')).data.datos.noLeidas,
  leer: async (id: string): Promise<void> => {
    await cliente.patch(`/notificaciones/${id}/leer`);
  },
  leerTodas: async (): Promise<void> => {
    await cliente.post('/notificaciones/leer-todas');
  },
};

export const apiMensajes = {
  bandeja: async (params?: Consulta): Promise<Pagina<Mensaje>> => {
    const { data } = await cliente.get<RespuestaApi<Mensaje[]>>('/mensajes', { params });
    return { datos: data.datos, meta: data.meta };
  },
  enviados: async (params?: Consulta): Promise<Pagina<Mensaje>> => {
    const { data } = await cliente.get<RespuestaApi<Mensaje[]>>('/mensajes/enviados', { params });
    return { datos: data.datos, meta: data.meta };
  },
  contactos: async (): Promise<Contacto[]> =>
    (await cliente.get<RespuestaApi<Contacto[]>>('/mensajes/contactos')).data.datos,
  obtener: async (id: string): Promise<Mensaje> =>
    (await cliente.get<RespuestaApi<Mensaje>>(`/mensajes/${id}`)).data.datos,
  enviar: async (cuerpo: unknown): Promise<Mensaje> =>
    (await cliente.post<RespuestaApi<Mensaje>>('/mensajes', cuerpo)).data.datos,
  noLeidos: async (): Promise<number> =>
    (await cliente.get<RespuestaApi<{ noLeidos: number }>>('/mensajes/no-leidos')).data.datos.noLeidos,
};

export const apiAuditoria = {
  listar: async (params?: Consulta): Promise<Pagina<RegistroAuditoria>> => {
    const { data } = await cliente.get<RespuestaApi<RegistroAuditoria[]>>('/auditoria', { params });
    return { datos: data.datos, meta: data.meta };
  },
};

export const apiDashboard = {
  resumen: async (): Promise<ResumenDashboard> =>
    (await cliente.get<RespuestaApi<ResumenDashboard>>('/dashboard')).data.datos,
};

export interface FilaKardex {
  fecha: string;
  tipo: string;
  motivo: string;
  origen: string;
  destino: string;
  entrada: number;
  salida: number;
  saldo: number;
}

export const apiReportes = {
  valorizado: async (): Promise<{ filas: ProductoConsolidado[]; totales: { valorCompra: number; valorVenta: number; unidades: number; items: number } }> =>
    (await cliente.get<RespuestaApi<{ filas: ProductoConsolidado[]; totales: { valorCompra: number; valorVenta: number; unidades: number; items: number } }>>('/reportes/valorizado')).data.datos,
  kardex: async (
    productoId: string,
    params?: Consulta,
  ): Promise<{ producto: { id: string; sku: string; nombre: string; unidadMedida: string }; filas: FilaKardex[] }> =>
    (
      await cliente.get<RespuestaApi<{ producto: { id: string; sku: string; nombre: string; unidadMedida: string }; filas: FilaKardex[] }>>(
        `/reportes/kardex/${productoId}`,
        { params },
      )
    ).data.datos,
};

/** Descarga un archivo Excel desde un endpoint de exportación. */
export async function descargarExcel(ruta: string, params?: Consulta): Promise<void> {
  const resp = await cliente.get(ruta, { params, responseType: 'blob' });
  const url = URL.createObjectURL(resp.data as Blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  const disposicion = (resp.headers['content-disposition'] as string) || '';
  const coincidencia = /filename="?([^"]+)"?/.exec(disposicion);
  enlace.download = coincidencia?.[1] || 'export.xlsx';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
