/** Tema claro/oscuro con persistencia. El modo oscuro es el predeterminado. */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Tema = 'dark' | 'light';

interface EstadoTema {
  tema: Tema;
  alternar: () => void;
  aplicar: () => void;
}

export const useTemaStore = create<EstadoTema>()(
  persist(
    (set, get) => ({
      tema: 'dark',
      alternar: () => {
        const nuevo: Tema = get().tema === 'dark' ? 'light' : 'dark';
        set({ tema: nuevo });
        document.documentElement.classList.toggle('dark', nuevo === 'dark');
      },
      aplicar: () => {
        document.documentElement.classList.toggle('dark', get().tema === 'dark');
      },
    }),
    { name: 'inventario-tema' },
  ),
);
