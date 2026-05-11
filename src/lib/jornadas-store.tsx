import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { jornadasIniciales, type Jornada } from "./jornadas-data";

interface Ctx {
  jornadas: Jornada[];
  updateNota: (id: string, nota: string) => void;
  updateJornada: (id: string, patch: Partial<Omit<Jornada, "id">>) => void;
  addJornada: (j: Omit<Jornada, "id">) => string;
  deleteJornada: (id: string) => void;
  isAdmin: boolean;
  setAdmin: (v: boolean) => void;
}

const JornadasContext = createContext<Ctx | null>(null);
const KEY = "jornadas-v2";
const ADMIN_KEY = "jornadas-admin";

export function JornadasProvider({ children }: { children: ReactNode }) {
  const [jornadas, setJornadas] = useState<Jornada[]>(jornadasIniciales);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setJornadas(JSON.parse(raw));
      setIsAdmin(localStorage.getItem(ADMIN_KEY) === "1");
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(jornadas)); } catch {}
  }, [jornadas]);

  const setAdmin = (v: boolean) => {
    setIsAdmin(v);
    try { localStorage.setItem(ADMIN_KEY, v ? "1" : "0"); } catch {}
  };

  const updateNota = (id: string, nota: string) =>
    setJornadas((prev) => prev.map((j) => (j.id === id ? { ...j, nota } : j)));

  const updateJornada = (id: string, patch: Partial<Omit<Jornada, "id">>) =>
    setJornadas((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));

  return (
    <JornadasContext.Provider value={{ jornadas, updateNota, updateJornada, isAdmin, setAdmin }}>
      {children}
    </JornadasContext.Provider>
  );
}

export function useJornadas() {
  const ctx = useContext(JornadasContext);
  if (!ctx) throw new Error("useJornadas must be inside JornadasProvider");
  return ctx;
}
