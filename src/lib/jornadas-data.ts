export type Turno = "AM" | "PM";

export interface Jornada {
  id: string;
  fecha: string; // ISO date
  turno: Turno;
  horaInicio: string;
  horaFin: string;
  grupo: string;
  nota: string;
}

export const jornadasIniciales: Jornada[] = [
  { id: "1", fecha: "2026-05-11", turno: "AM", horaInicio: "07:00", horaFin: "13:00", grupo: "Grupo A-1", nota: "Avance del 65% en la zona norte." },
  { id: "2", fecha: "2026-05-11", turno: "PM", horaInicio: "14:00", horaFin: "20:00", grupo: "Grupo B-2", nota: "" },
  { id: "3", fecha: "2026-05-09", turno: "AM", horaInicio: "07:00", horaFin: "13:00", grupo: "Grupo A-3", nota: "Sin novedades." },
  { id: "4", fecha: "2026-05-07", turno: "PM", horaInicio: "14:00", horaFin: "20:00", grupo: "Grupo C-1", nota: "Materiales pendientes." },
  { id: "5", fecha: "2026-05-05", turno: "AM", horaInicio: "06:30", horaFin: "12:30", grupo: "Grupo A-1", nota: "" },
  { id: "6", fecha: "2026-05-05", turno: "PM", horaInicio: "13:30", horaFin: "19:30", grupo: "Grupo B-2", nota: "Inspección completada." },
  { id: "7", fecha: "2026-05-02", turno: "AM", horaInicio: "07:00", horaFin: "13:00", grupo: "Grupo D-4", nota: "" },
  { id: "8", fecha: "2026-04-29", turno: "PM", horaInicio: "14:00", horaFin: "20:00", grupo: "Grupo A-1", nota: "Avance 80%." },
];
