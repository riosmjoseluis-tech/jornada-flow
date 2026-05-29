import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Database, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Inicio,
});

function Inicio() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-black text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(2,6,23,.20), rgba(2,6,23,.35)), url('https://jornada.bydlightsolutions.com/background.jpeg')",
        }}
      /> <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(34,197,94,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.16)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-[2px] animate-[laserMove_4s_ease-in-out_infinite] bg-emerald-300 shadow-[0_0_18px_4px_rgba(16,185,129,0.9),0_0_60px_12px_rgba(16,185,129,0.35)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-400/30 bg-emerald-400/10 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
          <Database className="h-10 w-10 text-emerald-300" />
        </div>

        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
          <Zap className="h-3.5 w-3.5" />
          Congregacion Villa del Lago
        </p>

        <h1 className="text-4xl font-black leading-tight tracking-tight">Bienvenidos</h1>
        <h2 className="mt-2 text-xl font-semibold text-emerald-200">Sistema de Registros</h2>


        <Link
          to="/registros"
          className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-400 px-5 py-4 text-base font-bold text-slate-950 shadow-[0_0_35px_rgba(16,185,129,0.45)] transition hover:bg-emerald-300 active:scale-[0.98]"
        >
          Entrar a Sistema          <ArrowRight className="h-5 w-5" />
        </Link>

        <div className="mt-8 flex flex-col items-center gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Acceso seguro a jornadas y anotaciones
          </div>

          <p className="text-[11px] text-slate-500/80">
            Sistema desarrollado por BydLight Solutions SPA
          </p>
        </div>
      </div>

      <style>{`
        @keyframes laserMove {
          0%, 100% { transform: translateY(-180px); opacity: 0.45; }
          50% { transform: translateY(180px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
