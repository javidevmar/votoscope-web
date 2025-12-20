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
