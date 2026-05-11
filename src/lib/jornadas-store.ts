import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jornadasIniciales, type Jornada } from "./jornadas-data";

interface JornadasState {
  jornadas: Jornada[];
  updateNota: (id: string, nota: string) => void;
}

export const useJornadasStore = create<JornadasState>()(
  persist(
    (set) => ({
      jornadas: jornadasIniciales,
      updateNota: (id, nota) =>
        set((s) => ({
          jornadas: s.jornadas.map((j) => (j.id === id ? { ...j, nota } : j)),
        })),
    }),
    { name: "jornadas-store" }
  )
);
