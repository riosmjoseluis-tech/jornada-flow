import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, BarChart3, CheckCircle2, Circle, Sun, Moon, TrendingUp, Activity } from "lucide-react";
import { useJornadas } from "@/lib/jornadas-store";
import type { Jornada } from "@/lib/jornadas-data";

export const Route = createFileRoute("/historial")({
  component: Historial,
  head: () => ({
    meta: [
      { title: "Historial — Estadísticas de jornadas" },
      { name: "description", content: "Avance mensual y estadísticas de jornadas." },
    ],
  }),
});

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function Historial() {
  const { jornadas } = useJornadas();

  const { meses, total, conNota, pctGlobal, mejorMes, actAgg } = useMemo(() => {
    const map = new Map<string, Jornada[]>();
    for (const j of jornadas) {
      const [y, m] = j.fecha.split("-").map(Number);
      const key = `${y}-${String(m).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(j);
    }
    const meses = Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, items]) => {
        const [y, m] = key.split("-").map(Number);
        const completas = items.filter((i) => i.nota.trim().length > 0).length;
        const am = items.filter((i) => i.turno === "AM").length;
        const pm = items.length - am;
        const pct = items.length ? Math.round((completas / items.length) * 100) : 0;
        return {
          key,
          label: `${MESES[m - 1]} ${y}`,
          total: items.length,
          completas,
          pendientes: items.length - completas,
          am,
          pm,
          pct,
        };
      });

    const total = jornadas.length;
    const conNota = jornadas.filter((j) => j.nota.trim().length > 0).length;
    const pctGlobal = total ? Math.round((conNota / total) * 100) : 0;
    const mejorMes = meses.reduce<typeof meses[number] | null>(
      (best, m) => (!best || m.pct > best.pct ? m : best),
      null,
    );

    const actMap = new Map<string, number>();
    for (const j of jornadas) actMap.set(j.actividad, (actMap.get(j.actividad) ?? 0) + 1);
    const actAgg = Array.from(actMap.entries()).map(([k, v]) => ({ k, v, pct: total ? Math.round((v / total) * 100) : 0 }));

    return { meses, total, conNota, pctGlobal, mejorMes, actAgg };
  }, [jornadas]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card active:scale-95" aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Estadísticas</p>
            <h1 className="truncate text-lg font-semibold">Historial de avance</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-5 pt-6">
        {/* Resumen global */}
        <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/40 p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">Avance global</span>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-5xl font-bold leading-none text-success">{pctGlobal}%</span>
            <span className="pb-1 text-sm text-muted-foreground">{conNota}/{total} jornadas</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pctGlobal}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Mini label="Total" value={total} />
            <Mini label="Con nota" value={conNota} accent />
            <Mini label="Pendientes" value={total - conNota} />
          </div>
        </section>

        {/* Mejor mes */}
        {mejorMes && total > 0 && (
          <section className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-success">Mejor mes</p>
              <p className="text-sm font-semibold">{mejorMes.label} · {mejorMes.pct}% completado</p>
            </div>
          </section>
        )}

        {/* Por mes */}
        <section>
          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Avance por mes
          </h2>
          {meses.length === 0 ? (
            <p className="rounded-2xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
              Aún no hay jornadas registradas
            </p>
          ) : (
            <ul className="space-y-2.5">
              {meses.map((m) => (
                <li key={m.key} className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold capitalize">{m.label}</p>
                    <span className={`text-sm font-bold ${m.pct >= 80 ? "text-success" : m.pct >= 40 ? "text-amber-300" : "text-muted-foreground"}`}>
                      {m.pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${m.pct >= 80 ? "bg-success" : m.pct >= 40 ? "bg-amber-400" : "bg-muted-foreground/40"}`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" />{m.completas} con nota</span>
                    <span className="inline-flex items-center gap-1"><Circle className="h-3 w-3" />{m.pendientes} pendientes</span>
                    <span className="inline-flex items-center gap-1"><Sun className="h-3 w-3 text-amber-300" />{m.am} AM</span>
                    <span className="inline-flex items-center gap-1"><Moon className="h-3 w-3 text-indigo-300" />{m.pm} PM</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Actividades */}
        {actAgg.length > 0 && (
          <section>
            <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Distribución por actividad
            </h2>
            <ul className="space-y-2 rounded-2xl border border-border/60 bg-card p-4">
              {actAgg.map((a) => (
                <li key={a.k}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 capitalize text-foreground">
                      <Activity className="h-3 w-3 text-muted-foreground" />{a.k}
                    </span>
                    <span className="text-muted-foreground">{a.v} · {a.pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${a.pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function Mini({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-bold ${accent ? "text-success" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
