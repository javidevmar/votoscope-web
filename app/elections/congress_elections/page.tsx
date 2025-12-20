"use client";

import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Parliament, PartyHemicycle } from "@/components/election/parliament";

type HemicicloRow = {
  partido_id: string;
  escanos: number;
  votos: number;
  porcentaje_voto: number | null;
  partido:
    | { siglas: string; color: string | null; nombre: string | null }
    | { siglas: string; color: string | null; nombre: string | null }[]
    | null;
};

async function fetchCongressElectionData() {
  const { data: electionRow, error: errElection } = await supabase
    .from("eleccion")
    .select("id")
    .eq("ano", 2023)
    .eq("mes", 7)
    .eq("tipo", "Generales")
    .is("auto_id", null)
    .is("prov_id", null)
    .is("muni_id", null)
    .single();

  if (errElection || !electionRow) {
    return {
      data: null,
      error: errElection?.message ?? "No se encontró la elección 2023-07",
    };
  }

  const { data, error } = await supabase
    .from("gold_congreso_hemiciclo")
    .select(
      "partido_id, escanos, votos, porcentaje_voto, partido:partido_id(siglas, color, nombre)"
    )
    .eq("eleccion_id", electionRow.id)
    .eq("nivel_ambito", "nacional")
    .is("cod_provincia", null)
    .gt("escanos", 0)
    .order("escanos", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const parsed: PartyHemicycle[] =
    data?.map((row: HemicicloRow) => {
      const partidoRaw = row.partido;
      const partido = Array.isArray(partidoRaw) ? partidoRaw[0] : partidoRaw;
      return {
        partyId: row.partido_id,
        siglas: partido?.siglas ?? "??",
        color: partido?.color ?? "#ccc",
        seats: row.escanos ?? 0,
        name: partido?.nombre ?? "Desconocido",
      };
    }) ?? [];

  return { data: parsed, error: null };
}

export default function CongressElections() {
  const [data, setData] = useState<PartyHemicycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await fetchCongressElectionData();
      if (error) {
        setError(error);
      } else if (data) {
        setData(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-4">Cargando hemiciclo...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 space-y-4 w-full">
      <h1 className="text-2xl font-semibold">Hemiciclo Congreso 2023</h1>
      <Parliament data={data} totalSeats={350} />
    </div>
  );
}
