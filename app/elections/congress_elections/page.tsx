"use client";

import { useEffect, useState } from "react";
import { Parliament, PartyHemicycle } from "@/components/election/parliament";
import {
  fetchCongressElectionData,
  fetchElectionDataList,
} from "@/lib/supabase/queries";
import { ambitos, Election, electoralTypes, getMonthName } from "@/lib/utils";
import { NativeSelect } from "@/components/ui/native-select";

export default function CongressElections() {
  const [data, setData] = useState<PartyHemicycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchElectionDataList(
        electoralTypes.generales,
        null,
        null,
        null
      );
      setElections(data);
      setSelectedElection(data[0]);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    async function load() {
      // 1. Si no hay elección, no cargues nada (y limpia datos viejos si quieres)
      if (!selectedElection) return;

      setLoading(true);
      const { data, error } = await fetchCongressElectionData(
        selectedElection.id, // Ya sabemos que no es null aquí
        ambitos.nacional,
        null
      );
      if (error) {
        setError(error);
      } else if (data) {
        setData(data);
      }
      setLoading(false);
    }
    load();
  }, [selectedElection]);

  if (loading && data.length === 0)
    return <div className="p-4">Cargando hemiciclo...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 space-y-4 w-full">
      <NativeSelect
        value={selectedElection?.id ?? ""}
        onChange={(e) => {
          setLoading(true);
          const newSelection = elections.find(
            (election) => election.id === e.target.value
          );
          setSelectedElection(newSelection ?? null);
        }}
      >
        {elections.map((election) => (
          <option key={election.id} value={election.id}>
            {getMonthName(election.mes)} del {election.ano}
          </option>
        ))}
      </NativeSelect>
      <h1 className="text-2xl font-semibold">
        Hemiciclo Congreso {selectedElection?.ano}
      </h1>
      <Parliament data={data} totalSeats={350} />
    </div>
  );
}
