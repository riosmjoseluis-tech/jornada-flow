import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Check, Clock, Sun, Moon, Users, FileText, MapPin, UserCog, Map, Activity, Layers, ShieldCheck, Pencil, Trash2, MapPinned, X, Loader2, ExternalLink } from "lucide-react";
import { useJornadas } from "@/lib/jornadas-store";
import type { Actividad, TipoGrupo } from "@/lib/jornadas-data";

export const Route = createFileRoute("/jornada/$id")({
  component: JornadaDetail,
});

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function JornadaDetail() {
  const { id } = Route.useParams();
  const { jornadas, updateNota, updateJornada, deleteJornada } = useJornadas();
  const jornada = jornadas.find((j) => String(j.id) === String(id));
  const [nota, setNota] = useState(jornada?.nota ?? "");
  const [saved, setSaved] = useState(false);

  const [eventos, setEventos] = useState([])
  const [loadingEventos, setLoadingEventos] = useState(true)
  const [editAdmin, setEditAdmin] = useState(false);
  const [lat, setLat] = useState<number | undefined>(jornada?.notaLat);
  const [lng, setLng] = useState<number | undefined>(jornada?.notaLng);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  // admin form state
  const [tipoGrupo, setTipoGrupo] = useState<TipoGrupo>(jornada?.tipoGrupo ?? "general");
  const [grupos, setGrupos] = useState(jornada?.grupos ?? "general");
  const [actividad, setActividad] = useState<Actividad>(jornada?.actividad ?? "casa en casa");
  const [lugar, setLugar] = useState(jornada?.lugarEncuentro ?? "");
  const [capitan, setCapitan] = useState(jornada?.capitan ?? "");
  const [territorio, setTerritorio] = useState(jornada?.territorio ?? "");

  useEffect(() => {
    if (!jornada) return;
    setNota(jornada.nota);
    setTipoGrupo(jornada.tipoGrupo);
    setGrupos(jornada.grupos);
    setActividad(jornada.actividad);
    setLugar(jornada.lugarEncuentro);
    setCapitan(jornada.capitan);
    setTerritorio(jornada.territorio);
    setLat(jornada.notaLat);
    setLng(jornada.notaLng);
    setGpsError(null);
    setLoadingEventos(true);

    fetch(`/api/jornadas/${id}/eventos`)
      .then((r) => r.json())
      .then((data) => {
        setEventos(data);
      })
      .catch(console.error)
      .finally(() => {
        setLoadingEventos(false);
      });
  }, [jornada]);

  if (!jornada) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-muted-foreground">Jornada no encontrada</p>
        <Link to="/registros" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
          Volver
        </Link>
      </div>
    );
  }

  const [y, m, d] = jornada.fecha.split("-").map(Number);
  const fechaLarga = `${d} de ${MESES[m - 1]}, ${y}`;
  const dirty =
    nota !== jornada.nota || lat !== jornada.notaLat || lng !== jornada.notaLng;
  const hasCoords = typeof lat === "number" && typeof lng === "number";

  const handleSave = async () => {
    try {
      await updateNota(
        String(jornada.id),
        nota,
        hasCoords ? { lat, lng } : null
      );

      const response = await fetch(
        `/api/jornadas/${id}/eventos`
      );

      const data = await response.json();

      setEventos(data);
      setSaved(true);

    } catch (error) {
      console.error(error);
      alert("Error guardando nota");
    }
  };

  const captureGPS = () => {
    if (!("geolocation" in navigator)) {
      setGpsError("Tu dispositivo no soporta geolocalización");
      return;
    }

    setGpsError(null);
    setGpsLoading(true);

    let bestPosition: GeolocationPosition | null = null;
    let attempts = 0;

    let watchId = 0;

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        attempts++;

        if (
          !bestPosition ||
          pos.coords.accuracy < bestPosition.coords.accuracy
        ) {
          bestPosition = pos;
        }

        // si ya logró buena precisión
        if (pos.coords.accuracy <= 20 || attempts >= 5) {
          navigator.geolocation.clearWatch(watchId);

          if (!bestPosition) {
            setGpsError("No se pudo obtener ubicación");
            setGpsLoading(false);
            return;
          }

          const accuracy = bestPosition.coords.accuracy;

          setGpsAccuracy(accuracy);

          if (accuracy > 80) {
            setGpsError(
              `Ubicación poco precisa (${Math.round(
                accuracy,
              )}m). Muévete a un lugar abierto e inténtalo nuevamente.`,
            );

            setGpsLoading(false);
            return;
          }
          setGpsError(null);

          setLat(Number(bestPosition.coords.latitude.toFixed(6)));
          setLng(Number(bestPosition.coords.longitude.toFixed(6)));

          console.log(
            "GPS FINAL:",
            bestPosition.coords.latitude,
            bestPosition.coords.longitude,
            "Precisión:",
            accuracy,
          );

          setGpsLoading(false);
          setSaved(false);
        }
      },
      (err) => {
        navigator.geolocation.clearWatch(watchId);

        setGpsError(err.message || "No se pudo obtener la ubicación");
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  };

  const clearGPS = () => {
    setLat(undefined);
    setLng(undefined);
    setGpsAccuracy(null);
    setSaved(false);
  };

  const handleSaveAdmin = () => {
    updateJornada(jornada.id, {
      tipoGrupo,
      grupos: grupos.slice(0, 80),
      actividad,
      lugarEncuentro: lugar.slice(0, 200),
      capitan: capitan.slice(0, 120),
      territorio: territorio.slice(0, 2),
    });
    setEditAdmin(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background pb-32">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
          <Link
            to="/registros"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card transition active:scale-95"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Jornada
            </p>
            <h1 className="truncate text-lg font-semibold">{jornada.grupo}</h1>
          </div>
          {!editAdmin && (
            <button
              onClick={() => setEditAdmin(true)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 text-xs font-semibold text-success transition active:scale-95"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-md overflow-x-hidden px-5 pt-6">
        {/* Hero */}
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
              label="Jornada"
              value={jornada.turno}
            />
            <Stat icon={<Clock className="h-4 w-4" />} label="Horario" value={jornada.horaInicio} hint={`a ${jornada.horaFin}`} />
            <Stat icon={<Users className="h-4 w-4" />} label="Grupo" value={jornada.grupo.replace("Grupo ", "")} />
          </div>
        </div>

        {/* Información (admin-cargada, lectura para usuario) */}
        <section className="mt-6">
          <div className="mb-2 flex items-center gap-2 px-1">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Información de la jornada</h2>
            <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
              Editable
            </span>
          </div>

          {editAdmin ? (
            <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
              <Field label="Tipo de grupo" icon={<Layers className="h-3.5 w-3.5" />}>
                <select
                  value={tipoGrupo}
                  onChange={(e) => setTipoGrupo(e.target.value as TipoGrupo)}
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-success"
                >
                  <option value="general">general</option>
                  <option value="por grupo">por grupo</option>
                </select>
              </Field>
              <Field label="Grupos" icon={<Users className="h-3.5 w-3.5" />}>
                <input
                  value={grupos}
                  onChange={(e) => setGrupos(e.target.value)}
                  placeholder="general o grupos 1-3-5"
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-success"
                />
              </Field>
              <Field label="Actividad" icon={<Activity className="h-3.5 w-3.5" />}>
                <select
                  value={actividad}
                  onChange={(e) => setActividad(e.target.value as Actividad)}
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-success"
                >
                  <option value="casa en casa">casa en casa</option>
                  <option value="Cartas">Cartas</option>
                </select>
              </Field>
              <Field label="Lugar de encuentro" icon={<MapPin className="h-3.5 w-3.5" />}>
                <input
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  maxLength={200}
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-success"
                />
              </Field>
              <Field label="Capitán" icon={<UserCog className="h-3.5 w-3.5" />}>
                <input
                  value={capitan}
                  onChange={(e) => setCapitan(e.target.value)}
                  maxLength={120}
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-success"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">{capitan.length}/120</p>
              </Field>
              <Field label="Territorio" icon={<Map className="h-3.5 w-3.5" />}>
                <input
                  value={territorio}
                  onChange={(e) => setTerritorio(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 2))}
                  maxLength={2}
                  className="w-24 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm uppercase outline-none focus:border-success"
                />
              </Field>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditAdmin(false)}
                  className="flex-1 rounded-xl border border-border/60 py-2.5 text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAdmin}
                  className="flex-1 rounded-xl bg-success py-2.5 text-sm font-semibold text-success-foreground"
                >
                  Guardar info
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <InfoRow icon={<Layers className="h-3.5 w-3.5" />} label="Tipo de grupo" value={jornada.tipoGrupo} />
              <InfoRow icon={<Users className="h-3.5 w-3.5" />} label="Grupos" value={jornada.grupos} />
              <InfoRow icon={<Activity className="h-3.5 w-3.5" />} label="Actividad" value={jornada.actividad} />
              <InfoRow icon={<Map className="h-3.5 w-3.5" />} label="Territorio" value={jornada.territorio || "—"} />
              <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Lugar de encuentro" value={jornada.lugarEncuentro || "—"} className="col-span-2" />
              <InfoRow icon={<UserCog className="h-3.5 w-3.5" />} label="Capitán" value={jornada.capitan || "—"} className="col-span-2" />
            </div>
          )}

          {!editAdmin && (
            <button
              onClick={() => {
                if (confirm("¿Eliminar esta jornada? Esta acción no se puede deshacer.")) {
                  deleteJornada(String(jornada.id));
                  window.location.href = "/registros";
                }
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 py-2.5 text-sm font-semibold text-destructive transition active:scale-[0.98]"
            >
              <Trash2 className="h-4 w-4" /> Eliminar jornada
            </button>
          )}
        </section>

        {/* Nota editable por usuario */}
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
            onChange={(e) => { setNota(e.target.value); setSaved(false); }}
            placeholder="Describe el avance del día, novedades, observaciones…"
            rows={7}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-success focus:ring-2 focus:ring-success/20"
          />
          <p className="mt-2 px-1 text-[11px] text-muted-foreground">
            {nota.length} caracteres · único campo modificable por usuarios
          </p>

          {/* Ubicación GPS */}
          <div className="mt-4 rounded-2xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-success" />
              <h3 className="text-sm font-semibold">Ubicación de cierre</h3>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">GPS</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Marca dónde quedó el grupo al terminar (dentro o fuera del campo).
            </p>
            <p className="mt-1 text-[10px] text-amber-400">
              Para mayor precisión activa el GPS del teléfono y espera unos segundos.
            </p>

            {hasCoords ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-background/50 p-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Coordenadas</p>
                    <p className="mt-0.5 break-all font-mono text-xs text-foreground">{lat!.toFixed(6)}, {lng!.toFixed(6)}</p>
                    {gpsAccuracy && (
                      <p className="mt-1 text-[10px] font-medium text-success">
                        Precisión GPS: {Math.round(gpsAccuracy)}m
                      </p>
                    )}
                  </div>
                  <button
                    onClick={clearGPS}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition active:scale-95 hover:text-destructive"
                    aria-label="Quitar ubicación"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-success/40 bg-success/10 py-2.5 text-xs font-semibold text-success transition active:scale-[0.98]"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Abrir en Google Maps
                </a>
                <button
                  onClick={captureGPS}
                  disabled={gpsLoading}
                  className="w-full rounded-xl border border-border/60 py-2 text-xs font-medium text-muted-foreground active:scale-[0.98] disabled:opacity-60"
                >
                  {gpsLoading ? "Obteniendo…" : "Actualizar ubicación"}
                </button>
              </div>
            ) : (
              <button
                onClick={captureGPS}
                disabled={gpsLoading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-success py-2.5 text-sm font-semibold text-success-foreground shadow-[0_6px_20px_-6px_oklch(0.65_0.17_155/0.5)] transition active:scale-[0.98] disabled:opacity-70"
              >
                {gpsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPinned className="h-4 w-4" />}
                {gpsLoading ? "Obteniendo ubicación…" : "Capturar mi ubicación"}
              </button>
            )}
            {gpsError && (
              <p className="mt-2 text-[11px] font-medium text-destructive">{gpsError}</p>
            )}
          </div>
        </section>
        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2 px-1">
            <Clock className="h-4 w-4 text-success" />
            <h2 className="text-sm font-semibold">
              Historial de actividad
            </h2>
          </div>

          {loadingEventos ? (
            <div className="rounded-2xl border border-border/60 bg-card p-4 text-sm text-muted-foreground">
              Cargando historial...
            </div>
          ) : eventos.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-4 text-sm text-muted-foreground">
              Aún no hay registros
            </div>
          ) : (
            <div className="space-y-3">
              {eventos.map((evento: any) => (
                <div
                  key={evento.id}
                  className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-success">
                      {new Date(evento.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    {evento.nota || "Sin nota"}
                  </p>

                  {evento.latitud && evento.longitud && (
                    <div className="mt-3 break-all text-[11px] text-muted-foreground">
                      GPS: {evento.latitud}, {evento.longitud}
                      {evento.precisionGps && (
                        <span>
                          {" "}
                          · Precisión {Math.round(evento.precisionGps)}m
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

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

function InfoRow({ icon, label, value, className = "" }: { icon: React.ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-border/60 bg-card p-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 break-words text-sm font-medium capitalize">{value}</p>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </span>
      {children}
    </label>
  );
}
