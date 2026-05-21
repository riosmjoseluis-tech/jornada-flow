import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarDays, ChevronRight, Sun, Moon, Users, Plus, BarChart3, MapPin } from "lucide-react";
import { useJornadas } from "@/lib/jornadas-store";
import type { Jornada } from "@/lib/jornadas-data";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Jornadas — Control de turnos" },
      { name: "description", content: "Lista de jornadas AM/PM con notas de avance." },
    ],
  }),
});

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_CORTOS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function parseFecha(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function Index() {
  const { jornadas, isAdmin, setAdmin } = useJornadas();

  const grupos = useMemo(() => {
    const sorted = [...jornadas].sort((a, b) => {
      if (a.fecha === b.fecha) return a.turno === "AM" ? -1 : 1;
      return a.fecha < b.fecha ? 1 : -1;
    });
    const map = new Map<string, Jornada[]>();
    for (const j of sorted) {
      const d = parseFecha(j.fecha);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(j);
    }
    return Array.from(map.entries()).map(([key, items]) => {
      const [y, m] = key.split("-").map(Number);
      return { key, label: `${MESES[m]} ${y}`, items };
    });
  }, [jornadas]);

  const totalPendientes = jornadas.filter((j) => !j.nota.trim()).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-md px-5 pb-4 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Congregacion Machali
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Jornadas Predicacion</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/historial"
                className="flex h-8 items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 text-[11px] font-semibold text-muted-foreground transition active:scale-95 hover:text-foreground"
                aria-label="Ver historial"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Historial
              </Link>
              <button
                onClick={() => {
                  if (isAdmin) { setAdmin(false); return; }
                  const pass = window.prompt("Contraseña de administrador");
                  if (pass === null) return;
                  if (pass === "admin1234") setAdmin(true);
                  else window.alert("Contraseña incorrecta");
                }}
                className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold transition active:scale-95 ${
                  isAdmin
                    ? "border-success/40 bg-success/15 text-success"
                    : "border-border/60 bg-card text-muted-foreground"
                }`}
                aria-label="Alternar modo admin"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isAdmin ? "bg-success" : "bg-muted-foreground/50"}`} />
                {isAdmin ? "Admin" : "Usuario"}
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-2 w-2 rounded-full bg-success" />
            <span>{jornadas.length} registros · {totalPendientes} sin nota</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pb-24 pt-4">
        {grupos.map((g) => (
          <section key={g.key} className="mb-7">
            <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {g.label}
            </h2>
            <ul className="space-y-2.5">
              {g.items.map((j) => (
                <li key={j.id}>
                  <JornadaCard jornada={j} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      {isAdmin && (
        <Link
          to="/jornada/nueva"
          className="fixed bottom-6 left-1/2 z-20 flex h-14 -translate-x-1/2 items-center gap-2 rounded-full bg-success px-6 font-semibold text-success-foreground shadow-[0_10px_30px_-8px_oklch(0.65_0.17_155/0.7)] transition active:scale-95"
          aria-label="Nueva jornada"
        >
          <Plus className="h-5 w-5" />
          Nueva jornada
        </Link>
      )}
    </div>
  );
}

function JornadaCard({ jornada }: { jornada: Jornada }) {
  const d = parseFecha(jornada.fecha);
  const dia = d.getDate();
  const diaSemana = DIAS_CORTOS[d.getDay()];
  const tienNota = jornada.nota.trim().length > 0;

  return (
    <Link
      to="/jornada/$id"
      params={{ id: jornada.id }}
      className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-3 pr-4 transition active:scale-[0.985] active:bg-card/80 hover:border-border"
    >
      {/* Calendario verde */}
      <div className="relative flex h-14 w-14 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl bg-success text-success-foreground shadow-[0_4px_14px_-4px_oklch(0.65_0.17_155/0.5)]">
        <CalendarDays className="absolute right-1 top-1 h-3 w-3 opacity-60" />
        <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">
          {diaSemana}
        </span>
        <span className="text-xl font-bold leading-none">{dia}</span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              jornada.turno === "AM"
                ? "bg-amber-500/15 text-amber-300"
                : "bg-indigo-500/15 text-indigo-300"
            }`}
          >
            {jornada.turno === "AM" ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            {jornada.turno}
          </span>
          <span className="text-xs text-muted-foreground">
            {jornada.horaInicio} – {jornada.horaFin}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="truncate text-sm font-medium text-foreground">{jornada.grupo}</p>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          {typeof jornada.notaLat === "number" && typeof jornada.notaLng === "number" && (
            <MapPin className="h-3 w-3 shrink-0 text-success" />
          )}
          <p className="truncate text-xs text-muted-foreground">
            {tienNota ? jornada.nota : "Sin nota de avance"}
          </p>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
