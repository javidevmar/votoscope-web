import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Legislative bodies and electoral types
 */
export interface LegislativeBody {
  name: string;
}

export const names: Record<string, LegislativeBody> =
{
  congress: {
    name: "Congreso de los Diputados"
  }
}

/**
 * Database entity types
 */
// Entity which represents a row in the gold_congreso_hemiciclo table
export type HemicicloRow = {
  partido_id: string;
  escanos: number;
  votos: number;
  porcentaje_voto: number | null;
  partido: { siglas: string; color: string | null; nombre: string | null; } |
  { siglas: string; color: string | null; nombre: string | null; }[] |
  null;
};

export type Election = {
  id: string;
  ano: number;
  mes: number;
};

// Constants
export const electoralTypes = {
  generales: "Generales",
}

export const ambitos = {
  nacional: "nacional",
}

export function getMonthName(month: number): string {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return months[month - 1];
}

export const ccaaList = [
  { id: "01", name: "Andalucía" },
  { id: "02", name: "Aragón" },
  { id: "03", name: "Principado de Asturias" },
  { id: "04", name: "Illes Balears" },
  { id: "05", name: "Canarias" },
  { id: "06", name: "Cantabria" },
  { id: "07", name: "Castilla y León" },
  { id: "08", name: "Castilla-La Mancha" },
  { id: "09", name: "Cataluña/Catalunya" },
  { id: "10", name: "Comunitat Valenciana" },
  { id: "11", name: "Extremadura" },
  { id: "12", name: "Galicia" },
  { id: "13", name: "Comunidad de Madrid" },
  { id: "14", name: "Región de Murcia" },
  { id: "15", name: "Comunidad Foral de Navarra" },
  { id: "16", name: "País Vasco/Euskadi" },
  { id: "17", name: "La Rioja" },
  { id: "18", name: "Ceuta" },
  { id: "19", name: "Melilla" },
];
