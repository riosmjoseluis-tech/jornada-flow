import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { jornadasIniciales, type Jornada } from "./jornadas-data";

interface Ctx {
  jornadas: Jornada[];
  updateNota: (id: string, nota: string) => void;
}

const JornadasContext = createContext<Ctx | null>(null);
const KEY = "jornadas-v1";

export function JornadasProvider({ children }: { children: ReactNode }) {
  const [jornadas, setJornadas] = useState<Jornada[]>(jornadasIniciales);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setJornadas(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(jornadas));
    } catch {}
  }, [jornadas]);

  const updateNota = (id: string, nota: string) =>
    setJornadas((prev) => prev.map((j) => (j.id === id ? { ...j, nota } : j)));

  return (
    <JornadasContext.Provider value={{ jornadas, updateNota }}>
      {children}
    </JornadasContext.Provider>
  );
}

export function useJornadas() {
  const ctx = useContext(JornadasContext);
  if (!ctx) throw new Error("useJornadas must be inside JornadasProvider");
  return ctx;
}
