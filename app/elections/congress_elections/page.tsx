import { Parliament, PartyHemicycle } from "@/components/election/parliament";
import { ElectionSelector } from "@/components/election/election-selector";
import {
  fetchCongressElectionData,
  fetchElectionDataList,
} from "@/lib/supabase/queries";
import { ambitos, Election, electoralTypes, getMonthName } from "@/lib/utils";
import { NativeSelect } from "@/components/ui/native-select";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    electionId?: string;
  }>;
}

export default async function CongressElections(props: PageProps) {
  const searchParams = await props.searchParams;
  const electionId = searchParams.electionId;

  const elections = await fetchElectionDataList(
    electoralTypes.generales,
    null,
    null,
    null
  );

  // Si no hay ID en la URL, redirigimos a la elección más reciente
  if (!electionId && elections.length > 0) {
    redirect(`/elections/congress_elections?electionId=${elections[0].id}`);
  }

  const selectedElection = electionId
    ? elections.find((e) => e.id === electionId)
    : elections[0];

  if (!selectedElection) {
    return <div className="p-4">No hay datos disponibles.</div>;
  }

  const { data, error } = await fetchCongressElectionData(
    selectedElection.id,
    ambitos.nacional,
    null
  );

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  // 5. Renderizado final (sin useEffects, directo al grano)
  return (
    <div className="p-4 space-y-4 w-full">
      {/* Pasamos la lista al Cliente para que pinte el selector */}
      <ElectionSelector elections={elections} />
      <h1 className="text-2xl font-semibold">
        Hemiciclo Congreso {selectedElection.ano}
      </h1>
      {/* Renderizamos el gráfico con los datos que acabamos de bajar */}
      <Parliament data={data || []} totalSeats={350} />
    </div>
  );
}
