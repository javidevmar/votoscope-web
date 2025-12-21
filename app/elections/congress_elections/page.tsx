import { Parliament, PartyHemicycle } from "@/components/election/parliament";
import { ElectionSelector } from "@/components/election/election-select";
import {
  fetchCongressElectionData,
  fetchElectionDataList,
} from "@/lib/supabase/queries";
import { ambitos, Election, electoralTypes, getMonthName } from "@/lib/utils";
import { NativeSelect } from "@/components/ui/native-select";
import { redirect } from "next/navigation";
import { ElectionMap } from "@/components/maps/map";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LocationSelector } from "@/components/election/location-select";

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="col-span-2 border-2 border-dashed bg-gray-100 rounded-xl flex justify-between items-center p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/elections/congress_elections">
                Nacional
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <LocationSelector />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ElectionSelector elections={elections} />
      </div>
      <div className="p-4 space-y-4 w-full">
        <Parliament data={data || []} totalSeats={350} />
      </div>
      <ElectionMap />
      <div className="col-span-2 border-2 border-dashed bg-gray-100 h-96 rounded-xl">
        Ficha
      </div>
    </div>
  );
}
