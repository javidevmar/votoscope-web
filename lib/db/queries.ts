import { db } from ".";
import { eleccion, goldCongresoHemiciclo, partido } from "./schema";
import { eq, and, desc, isNull, gt } from "drizzle-orm";
import { PartyHemicycle } from "@/components/election/parliament";
import { Election } from "../utils";

export async function fetchElectionDataList(
  type: string, 
  autoId: string | null, 
  provinceId: string | null, 
  municipalityId: string | null
): Promise<Election[]> {
  // Construimos filtros dinámicos
  const filters = [
    eq(eleccion.tipo, type),
    autoId ? eq(eleccion.autoId, autoId) : isNull(eleccion.autoId),
    provinceId ? eq(eleccion.provId, provinceId) : isNull(eleccion.provId),
    municipalityId ? eq(eleccion.muniId, municipalityId) : isNull(eleccion.muniId)
  ];

  const result = await db
    .select({
      id: eleccion.id,
      ano: eleccion.ano,
      mes: eleccion.mes,
    })
    .from(eleccion)
    .where(and(...filters))
    .orderBy(desc(eleccion.ano), desc(eleccion.mes));

  return result;
}

export async function fetchCongressElectionData(
  electionId: string, 
  ambito: string, 
  provincia: string | null
): Promise<{ data: PartyHemicycle[]; error: string | null }> {
  try {
    const filters = [
      eq(goldCongresoHemiciclo.eleccionId, electionId),
      eq(goldCongresoHemiciclo.nivelAmbito, ambito),
      provincia ? eq(goldCongresoHemiciclo.codProvincia, provincia) : isNull(goldCongresoHemiciclo.codProvincia),
      gt(goldCongresoHemiciclo.escanos, 0)
    ];

    const rows = await db
      .select({
        partidoId: goldCongresoHemiciclo.partidoId,
        escanos: goldCongresoHemiciclo.escanos,
        votos: goldCongresoHemiciclo.votos,
        porcentajeVoto: goldCongresoHemiciclo.porcentajeVoto,
        partido: {
          siglas: partido.siglas,
          color: partido.color,
          nombre: partido.nombre
        }
      })
      .from(goldCongresoHemiciclo)
      .innerJoin(partido, eq(goldCongresoHemiciclo.partidoId, partido.id))
      .where(and(...filters))
      .orderBy(desc(goldCongresoHemiciclo.escanos));

    const parsed: PartyHemicycle[] = rows.map((row) => {
      // Drizzle ya nos devuelve el objeto estructurado gracias al select
      return {
        partyId: row.partidoId,
        siglas: row.partido.siglas ?? "Otros",
        color: row.partido.color ?? "#ccc",
        seats: row.escanos ?? 0,
        name: row.partido.nombre ?? "Otros",
      };
    });

    return { data: parsed, error: null };
  } catch (err: any) {
    console.error("Error fetching congress election data:", err);
    return { data: [], error: err.message || "Unknown error" };
  }
}
