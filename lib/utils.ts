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
