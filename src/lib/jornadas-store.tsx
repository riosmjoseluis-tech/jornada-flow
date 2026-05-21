import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { jornadasIniciales, type Jornada } from "./jornadas-data";

const API_URL = import.meta.env.VITE_API_URL;

interface Ctx {
  jornadas: Jornada[];
  updateNota: (
    id: string,
    nota: string,
    coords?: { lat?: number; lng?: number } | null
  ) => Promise<void>;
  updateJornada: (
    id: string,
    patch: Partial<Omit<Jornada, "id">>
  ) => void;
  addJornada: (j: Omit<Jornada, "id">) => Promise<void>;
  deleteJornada: (id: string) => void;
  isAdmin: boolean;
  setAdmin: (v: boolean) => void;
}

const JornadasContext = createContext<Ctx | null>(null);

const ADMIN_KEY = "jornadas-admin";

export function JornadasProvider({ children }: { children: ReactNode }) {
  const [jornadas, setJornadas] =
    useState<Jornada[]>(jornadasIniciales);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/jornadas`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setJornadas(data);
        }

        setIsAdmin(localStorage.getItem(ADMIN_KEY) === "1");
      } catch (err) {
        console.error("Error cargando jornadas:", err);
      }
    };

    load();
  }, []);

  const setAdmin = (v: boolean) => {
    setIsAdmin(v);
    try {
      localStorage.setItem(ADMIN_KEY, v ? "1" : "0");
    } catch {}
  };

  // ✅ CREATE JORNADA (CORRECTO)
  const addJornada = async (j: Omit<Jornada, "id">) => {
    try {
      const res = await fetch(`${API_URL}/jornadas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(j),
      });

      if (!res.ok) throw new Error("Error creando jornada");

      const data = await res.json();

      setJornadas((prev) => [data, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateNota = async (
    id: string,
    nota: string,
    coords?: { lat?: number; lng?: number } | null
  ) => {
    try {
      const body = {
        nota,
        notaLat: coords?.lat ?? null,
        notaLng: coords?.lng ?? null,
      };

      const res = await fetch(
        `${API_URL}/jornadas/${id}/nota`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        throw new Error("Error actualizando nota");
      }

      setJornadas((prev) =>
        prev.map((j) =>
          j.id === id
            ? {
                ...j,
                nota,
                notaLat: coords?.lat,
                notaLng: coords?.lng,
              }
            : j
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateJornada = (
    id: string,
    patch: Partial<Omit<Jornada, "id">>
  ) => {
    setJornadas((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, ...patch } : j
      )
    );
  };

  const deleteJornada = (id: string) => {
    setJornadas((prev) =>
      prev.filter((j) => j.id !== id)
    );
  };

  return (
    <JornadasContext.Provider
      value={{
        jornadas,
        updateNota,
        updateJornada,
        addJornada,
        deleteJornada,
        isAdmin,
        setAdmin,
      }}
    >
      {children}
    </JornadasContext.Provider>
  );
}

export function useJornadas() {
  const ctx = useContext(JornadasContext);
  if (!ctx)
    throw new Error(
      "useJornadas must be inside JornadasProvider"
    );
  return ctx;
}
