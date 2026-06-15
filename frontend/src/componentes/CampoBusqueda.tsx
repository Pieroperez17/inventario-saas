import { Search } from 'lucide-react';

export function CampoBusqueda({
  valor,
  onCambio,
  placeholder = 'Buscar…',
}: {
  valor: string;
  onCambio: (valor: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
      <input
        className="campo pl-9"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
