import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Package, DollarSign, Boxes, AlertTriangle, Warehouse, Store, Users } from 'lucide-react';
import { ComponentType } from 'react';
import { apiDashboard } from '../api/servicios';
import { useAuthStore } from '../store/authStore';
import { useTemaStore } from '../store/temaStore';
import { formatearMoneda, formatearNumero, formatearFechaHora } from '../utilidades/formato';
import { EncabezadoPagina } from '../componentes/EncabezadoPagina';
import { Spinner } from '../componentes/Spinner';
import { Badge } from '../componentes/Badge';

const COLORES = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6'];

function Metrica({
  icono: Icono,
  etiqueta,
  valor,
  color,
}: {
  icono: ComponentType<{ className?: string }>;
  etiqueta: string;
  valor: string | number;
  color: string;
}) {
  return (
    <div className="tarjeta flex items-center gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icono className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-600 dark:text-slate-400">{etiqueta}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{valor}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const moneda = useAuthStore((s) => s.empresa?.moneda ?? 'PEN');
  const tema = useTemaStore((s) => s.tema);
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: apiDashboard.resumen });

  if (isLoading || !data) return <Spinner texto="Cargando panel…" />;
  const { tarjetas, existenciasPorUbicacion, topProductos, movimientosRecientes } = data;

  const colorGrid = tema === 'dark' ? '#1e293b' : '#e2e8f0';
  const colorTick = tema === 'dark' ? '#94a3b8' : '#475569';
  const estiloTooltip =
    tema === 'dark'
      ? { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }
      : { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a' };

  return (
    <div>
      <EncabezadoPagina titulo="Dashboard" descripcion="Resumen general de tu inventario" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metrica icono={Package} etiqueta="Productos" valor={formatearNumero(tarjetas.totalProductos)} color="bg-marca-500/20 text-marca-600 dark:text-marca-300" />
        <Metrica icono={DollarSign} etiqueta="Valor del inventario" valor={formatearMoneda(tarjetas.valorInventario, moneda)} color="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300" />
        <Metrica icono={Boxes} etiqueta="Stock total (unidades)" valor={formatearNumero(tarjetas.stockTotal)} color="bg-sky-500/20 text-sky-600 dark:text-sky-300" />
        <Metrica icono={AlertTriangle} etiqueta="Productos bajo mínimo" valor={formatearNumero(tarjetas.productosBajoMinimo)} color="bg-amber-500/20 text-amber-600 dark:text-amber-300" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metrica icono={Warehouse} etiqueta="Almacenes" valor={tarjetas.totalAlmacenes} color="bg-slate-500/20 text-slate-600 dark:text-slate-300" />
        <Metrica icono={Store} etiqueta="Tiendas" valor={tarjetas.totalTiendas} color="bg-slate-500/20 text-slate-600 dark:text-slate-300" />
        <Metrica icono={Users} etiqueta="Usuarios" valor={tarjetas.totalUsuarios} color="bg-slate-500/20 text-slate-600 dark:text-slate-300" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="tarjeta">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Existencias por ubicación</h3>
          {existenciasPorUbicacion.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-600 dark:text-slate-400">Sin datos de inventario.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={existenciasPorUbicacion}>
                <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} />
                <XAxis dataKey="nombre" tick={{ fill: colorTick, fontSize: 12 }} />
                <YAxis tick={{ fill: colorTick, fontSize: 12 }} />
                <Tooltip contentStyle={estiloTooltip} />
                <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                  {existenciasPorUbicacion.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="tarjeta">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Top productos por stock</h3>
          {topProductos.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-600 dark:text-slate-400">Sin datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProductos} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} />
                <XAxis type="number" tick={{ fill: colorTick, fontSize: 12 }} />
                <YAxis type="category" dataKey="sku" width={70} tick={{ fill: colorTick, fontSize: 12 }} />
                <Tooltip contentStyle={estiloTooltip} />
                <Bar dataKey="stock" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-6 tarjeta">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Movimientos recientes</h3>
        {movimientosRecientes.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-600 dark:text-slate-400">Aún no hay movimientos.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {movimientosRecientes.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <Badge variante={m.tipo === 'ENTRADA' ? 'verde' : m.tipo === 'SALIDA' ? 'rojo' : 'azul'}>
                    {m.tipo}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{m.producto.nombre}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{m.producto.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatearNumero(m.cantidad)}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{formatearFechaHora(m.fecha)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
