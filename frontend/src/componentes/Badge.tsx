import clsx from 'clsx';

type Variante = 'verde' | 'rojo' | 'ambar' | 'azul' | 'gris' | 'morado';

const estilos: Record<Variante, string> = {
  verde: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  rojo: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  ambar: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  azul: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
  gris: 'bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
  morado: 'bg-marca-100 text-marca-700 dark:bg-marca-500/15 dark:text-marca-300',
};

export function Badge({ children, variante = 'gris' }: { children: React.ReactNode; variante?: Variante }) {
  return <span className={clsx('badge', estilos[variante])}>{children}</span>;
}
