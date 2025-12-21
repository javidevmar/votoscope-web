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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-2 border-2 border-dashed bg-gray-100 rounded-xl flex justify-between items-center p-4">
        <div>Breadcrumbs</div>
        <ElectionSelector elections={elections} />
      </div>
      <div className="p-4 space-y-4 w-full">
        <Parliament data={data || []} totalSeats={350} />
      </div>
      <div className="border-2 border-dashed bg-gray-100 h-96 rounded-xl">
        Mapa
      </div>
      <div className="col-span-2 border-2 border-dashed bg-gray-100 h-96 rounded-xl">
        Ficha
      </div>
    </div>
  );
}
