"use client";

import { NativeSelect } from "@/components/ui/native-select";
import { Election, getMonthName } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

export function ElectionSelector({ elections }: { elections: Election[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedId = searchParams.get("electionId") || elections[0]?.id;
  return (
    <NativeSelect
      value={selectedId ?? ""}
      onChange={(e) => {
        const newId = e.target.value;
        // Change electionId param
        router.push(`?electionId=${newId}`);
      }}
    >
      {elections.map((election) => (
        <option key={election.id} value={election.id}>
          {getMonthName(election.mes)} del {election.ano}
        </option>
      ))}
    </NativeSelect>
  );
}
