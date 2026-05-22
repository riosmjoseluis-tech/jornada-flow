import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CalendarDays, Plus } from "lucide-react";
import { useJornadas } from "@/lib/jornadas-store";
import type { Actividad, TipoGrupo, Turno } from "@/lib/jornadas-data";

export const Route = createFileRoute("/jornada/nueva")({
  component: NuevaJornada,
});

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function NuevaJornada() {
  const { addJornada, isAdmin } = useJornadas();
  const navigate = useNavigate();

  const [fecha, setFecha] = useState(todayISO());
  const [turno, setTurno] = useState<Turno>("AM");
  const [horaInicio, setHoraInicio] = useState("07:00");
  const [horaFin, setHoraFin] = useState("13:00");
  const [grupo, setGrupo] = useState("");
  const [tipoGrupo, setTipoGrupo] = useState<TipoGrupo>("general");
  const [grupos, setGrupos] = useState("general");
  const [actividad, setActividad] = useState<Actividad>("casa en casa");
  const [lugar, setLugar] = useState("");
  const [capitan, setCapitan] = useState("");
  const [territorio, setTerritorio] = useState("");

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-muted-foreground">Solo el modo admin puede crear jornadas</p>
        <Link to="/" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Volver</Link>
      </div>
    );
  }

  const valid = fecha && grupo.trim().length > 0;

  const handleSave = async () => {
    if (!valid) return;
    await addJornada({
      fecha, turno, horaInicio, horaFin,
      grupo: grupo.trim(),
      tipoGrupo, grupos: grupos.slice(0, 80), actividad,
      lugarEncuentro: lugar.slice(0, 200),
      capitan: capitan.slice(0, 120),
      territorio: territorio.slice(0, 2),
      nota: "",
    });
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card active:scale-95" aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Admin</p>
            <h1 className="truncate text-lg font-semibold">Nueva jornada</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground">
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-3 px-5 pt-6">
        <Field label="Fecha">
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls} />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Jornada">
            <select value={turno} onChange={(e) => setTurno(e.target.value as Turno)} className={inputCls}>
              <option value="AM">AM</option><option value="PM">PM</option>
            </select>
          </Field>
          <Field label="Inicio">
            <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Fin">
            <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Grupo (etiqueta visible)">
          <input value={grupo} onChange={(e) => setGrupo(e.target.value)} placeholder="Grupo A-1" className={inputCls} />
        </Field>
        <Field label="Tipo de grupo">
          <select value={tipoGrupo} onChange={(e) => setTipoGrupo(e.target.value as TipoGrupo)} className={inputCls}>
            <option value="general">general</option>
            <option value="por grupo">por grupo</option>
          </select>
        </Field>
        <Field label="Grupos">
          <input value={grupos} onChange={(e) => setGrupos(e.target.value)} placeholder="general o grupos 1-3-5" className={inputCls} />
        </Field>
        <Field label="Actividad">
          <select value={actividad} onChange={(e) => setActividad(e.target.value as Actividad)} className={inputCls}>
            <option value="casa en casa">casa en casa</option>
            <option value="Cartas">Cartas</option>
          </select>
        </Field>
        <Field label="Lugar de encuentro">
          <input value={lugar} onChange={(e) => setLugar(e.target.value)} maxLength={200} className={inputCls} />
        </Field>
        <Field label={`Capitán (${capitan.length}/120)`}>
          <input value={capitan} onChange={(e) => setCapitan(e.target.value)} maxLength={120} className={inputCls} />
        </Field>
        <Field label="Territorio (2)">
          <input
            value={territorio}
            onChange={(e) => setTerritorio(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 2))}
            maxLength={2}
            className={`${inputCls} w-24 uppercase`}
          />
        </Field>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-md px-5 py-4">
          <button
            onClick={handleSave}
            disabled={!valid}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-success font-semibold text-success-foreground shadow-[0_6px_20px_-6px_oklch(0.65_0.17_155/0.6)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            <Plus className="h-5 w-5" /> Crear jornada
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border/60 bg-card px-3 py-2.5 text-sm outline-none focus:border-success";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
