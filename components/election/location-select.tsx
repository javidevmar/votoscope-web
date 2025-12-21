"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NativeSelect } from "@/components/ui/native-select";
import { ccaaList } from "@/lib/utils";
import { useState } from "react";

export function LocationSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState(
    searchParams.get("ccaaId") || ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("Navigate to region:", e.target.value);

    setSelectedId(e.target.value);
    // When url is prepared
    // router.push(`?ccaaId=${e.target.value}`);
  };

  return (
    <NativeSelect
      value={selectedId}
      onChange={handleChange}
      className="bg-transparent border-none shadow-none p-0 pr-5 h-auto font-medium text-foreground w-auto focus:ring-0 cursor-pointer hover:bg-gray-100 rounded px-1 transition-colors"
    >
      <option value="" disabled>
        Comunidad Autónoma
      </option>
      {ccaaList.map((ccaa) => (
        <option key={ccaa.id} value={ccaa.id}>
          {ccaa.name}
        </option>
      ))}
    </NativeSelect>
  );
}
