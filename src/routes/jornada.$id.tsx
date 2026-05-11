import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Check, Clock, Sun, Moon, Users, FileText } from "lucide-react";
import { useJornadas } from "@/lib/jornadas-store";

export const Route = createFileRoute("/jornada/$id")({
  component: JornadaDetail,
});

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function JornadaDetail() {
  const { id } = Route.useParams();
  const { jornadas, updateNota } = useJornadas();
  const navigate = useNavigate();
  const jornada = jornadas.find((j) => j.id === id);

  const [nota, setNota] = useState(jornada?.nota ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (jornada) setNota(jornada.nota);
  }, [jornada?.id]);

  if (!jornada) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-muted-foreground">Jornada no encontrada</p>
        <Link to="/" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
          Volver
        </Link>
      </div>
    );
  }

  const [y, m, d] = jornada.fecha.split("-").map(Number);
  const fechaLarga = `${d} de ${MESES[m - 1]}, ${y}`;
  const dirty = nota !== jornada.nota;

  const handleSave = () => {
    updateNota(jornada.id, nota);
    setSaved(true);
    setTimeout(() => {
      navigate({ to: "/" });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card transition active:scale-95"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Jornada
            </p>
            <h1 className="truncate text-lg font-semibold">{jornada.grupo}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pt-6">
        {/* Hero card */}
        <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/40 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-success text-success-foreground shadow-[0_8px_24px_-6px_oklch(0.65_0.17_155/0.55)]">
              <CalendarDays className="h-4 w-4 opacity-80" />
              <span className="mt-0.5 text-2xl font-bold leading-none">{d}</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Fecha</p>
              <p className="text-base font-semibold capitalize">{fechaLarga}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Stat
              icon={jornada.turno === "AM" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              label="Turno"
              value={jornada.turno}
            />
            <Stat
              icon={<Clock className="h-4 w-4" />}
              label="Horario"
              value={`${jornada.horaInicio}`}
              hint={`a ${jornada.horaFin}`}
            />
            <Stat
              icon={<Users className="h-4 w-4" />}
              label="Grupo"
              value={jornada.grupo.replace("Grupo ", "")}
            />
          </div>
        </div>

        {/* Nota editable */}
        <section className="mt-6">
          <div className="mb-2 flex items-center gap-2 px-1">
            <FileText className="h-4 w-4 text-success" />
            <h2 className="text-sm font-semibold">Nota de avance</h2>
            <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
              Editable
            </span>
          </div>
          <textarea
            value={nota}
            onChange={(e) => {
              setNota(e.target.value);
              setSaved(false);
            }}
            placeholder="Describe el avance del día, novedades, materiales, observaciones…"
            rows={8}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-success focus:ring-2 focus:ring-success/20"
          />
          <p className="mt-2 px-1 text-[11px] text-muted-foreground">
            {nota.length} caracteres · solo este campo puede modificarse
          </p>
        </section>
      </main>

      {/* Bottom action */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-md px-5 py-4">
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-success font-semibold text-success-foreground shadow-[0_6px_20px_-6px_oklch(0.65_0.17_155/0.6)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            {saved ? <Check className="h-5 w-5" /> : null}
            {saved ? "Guardado" : dirty ? "Guardar nota" : "Sin cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1.5 text-sm font-semibold leading-tight">{value}</p>
      {hint ? <p className="text-[10px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
