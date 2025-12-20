import { PartyHemicycle } from "@/components/election/parliament";
import { Election, HemicicloRow } from "../utils";
import { supabase } from "./client";

export async function fetchElectionDataList(type: string, autoId: string | null, 
    provinceId: string | null, 
    municipalityId: string | null) : Promise<Election[]>{
    const { data: electionRow, error: errElection } = await supabase
    .from("eleccion")
    .select("id, ano, mes")
    .eq("tipo", type)
    .is("auto_id", autoId)
    .is("prov_id", provinceId)
    .is("muni_id", municipalityId)
    .order("ano", { ascending: false })
    .order("mes", { ascending: false });

  if (errElection) {
    console.error("Error fetching election data", errElection);
    return [];
  }

  return electionRow;
}

export async function fetchCongressElectionData(electionId: string, 
    ambito: string, provincia: string | null) : Promise<{data: PartyHemicycle[], error: string | null}> {

  const { data, error } = await supabase
    .from("gold_congreso_hemiciclo")
    .select(
      "partido_id, escanos, votos, porcentaje_voto, partido:partido_id(siglas, color, nombre)"
    )
    .eq("eleccion_id", electionId)
    .eq("nivel_ambito", ambito)
    .is("cod_provincia", provincia)
    .gt("escanos", 0)
    .order("escanos", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  const parsed: PartyHemicycle[] = data?.map((row: HemicicloRow) => {
    const partidoRaw = row.partido;
    const partido = Array.isArray(partidoRaw) ? partidoRaw[0] : partidoRaw;
    return {
      partyId: row.partido_id,
      siglas: partido?.siglas ?? "Otros",
      color: partido?.color ?? "#ccc",
      seats: row.escanos ?? 0,
      name: partido?.nombre ?? "Otros",
    };
  }) ?? [];

  return { data: parsed, error: null };
}


