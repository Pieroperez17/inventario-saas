import { useEffect, useState } from 'react';

/** Devuelve el valor "retrasado" tras un periodo de inactividad. */
export function useDebounce<T>(valor: T, ms = 350): T {
  const [retrasado, setRetrasado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setRetrasado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return retrasado;
}
