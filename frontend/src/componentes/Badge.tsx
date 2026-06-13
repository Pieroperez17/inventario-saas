import clsx from 'clsx';

type Variante = 'verde' | 'rojo' | 'ambar' | 'azul' | 'gris' | 'morado';

const estilos: Record<Variante, string> = {
  verde: 'bg-emerald-500/15 text-emerald-400',
  rojo: 'bg-rose-500/15 text-rose-400',
  ambar: 'bg-amber-500/15 text-amber-400',
  azul: 'bg-sky-500/15 text-sky-400',
  gris: 'bg-slate-500/15 text-slate-300',
  morado: 'bg-marca-500/15 text-marca-300',
};

export function Badge({ children, variante = 'gris' }: { children: React.ReactNode; variante?: Variante }) {
  return <span className={clsx('badge', estilos[variante])}>{children}</span>;
}
