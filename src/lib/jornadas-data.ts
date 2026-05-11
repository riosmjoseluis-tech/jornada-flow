export type Turno = "AM" | "PM";
export type TipoGrupo = "general" | "por grupo";
export type Actividad = "casa en casa" | "Cartas";

export interface Jornada {
  id: string;
  fecha: string; // ISO date
  turno: Turno;
  horaInicio: string;
  horaFin: string;
  grupo: string;
  tipoGrupo: TipoGrupo;
  grupos: string; // "general" o "grupos 1-3-5"
  actividad: Actividad;
  lugarEncuentro: string;
  capitan: string; // hasta 120 chars
  territorio: string; // varchar(2)
  nota: string;
}

export const jornadasIniciales: Jornada[] = [
  { id: "1", fecha: "2026-05-11", turno: "AM", horaInicio: "07:00", horaFin: "13:00", grupo: "Grupo A-1", tipoGrupo: "por grupo", grupos: "grupos 1-3-5", actividad: "casa en casa", lugarEncuentro: "Salón del Reino", capitan: "Juan Pérez", territorio: "12", nota: "Avance del 65% en la zona norte." },
  { id: "2", fecha: "2026-05-11", turno: "PM", horaInicio: "14:00", horaFin: "20:00", grupo: "Grupo B-2", tipoGrupo: "general", grupos: "general", actividad: "Cartas", lugarEncuentro: "Plaza Central", capitan: "María López", territorio: "07", nota: "" },
  { id: "3", fecha: "2026-05-09", turno: "AM", horaInicio: "07:00", horaFin: "13:00", grupo: "Grupo A-3", tipoGrupo: "por grupo", grupos: "grupos 2-4", actividad: "casa en casa", lugarEncuentro: "Salón del Reino", capitan: "Carlos Ruiz", territorio: "03", nota: "Sin novedades." },
  { id: "4", fecha: "2026-05-07", turno: "PM", horaInicio: "14:00", horaFin: "20:00", grupo: "Grupo C-1", tipoGrupo: "general", grupos: "general", actividad: "Cartas", lugarEncuentro: "Café del parque", capitan: "Ana Torres", territorio: "15", nota: "Materiales pendientes." },
  { id: "5", fecha: "2026-05-05", turno: "AM", horaInicio: "06:30", horaFin: "12:30", grupo: "Grupo A-1", tipoGrupo: "por grupo", grupos: "grupos 1-3-5", actividad: "casa en casa", lugarEncuentro: "Salón del Reino", capitan: "Juan Pérez", territorio: "11", nota: "" },
  { id: "6", fecha: "2026-05-05", turno: "PM", horaInicio: "13:30", horaFin: "19:30", grupo: "Grupo B-2", tipoGrupo: "por grupo", grupos: "grupos 2-4", actividad: "casa en casa", lugarEncuentro: "Esquina principal", capitan: "Pedro Gómez", territorio: "08", nota: "Inspección completada." },
  { id: "7", fecha: "2026-05-02", turno: "AM", horaInicio: "07:00", horaFin: "13:00", grupo: "Grupo D-4", tipoGrupo: "general", grupos: "general", actividad: "Cartas", lugarEncuentro: "Plaza Central", capitan: "Luisa Méndez", territorio: "20", nota: "" },
  { id: "8", fecha: "2026-04-29", turno: "PM", horaInicio: "14:00", horaFin: "20:00", grupo: "Grupo A-1", tipoGrupo: "por grupo", grupos: "grupos 1-3-5", actividad: "casa en casa", lugarEncuentro: "Salón del Reino", capitan: "Juan Pérez", territorio: "05", nota: "Avance 80%." },
];
