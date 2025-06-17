"use client";

import PdfsTable from "@/feature/admin/components/PdfsTable/PdfsTable";
import SearchPdfs from "@/feature/admin/components/SearchPdfs/SearchPdfs";
import { useAllPDFs, useSearchPDFs } from "@/feature/admin/hooks/useSearchPDFs";
import { useEffect, useState } from "react";

export default function SeePdfsPage() {
  const { data, isLoading } = useAllPDFs();
  const { mutateAsync: searchPDFs, isPending: isSearching } = useSearchPDFs();
  const [searchResults, setSearchResults] = useState(data?.results ?? []);

  useEffect(() => {
    if (data === undefined) return;
    setSearchResults(data?.results ?? []);
  }, [data]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(data?.results || []);
      return;
    }

    const result = await searchPDFs(query);
    if (result?.results) {
      setSearchResults(result.results);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de PDFs</h1>
          <p className="text-muted-foreground mt-2">
            Busca y gestiona todos los documentos PDF subidos al sistema
          </p>
        </div>

        <SearchPdfs onSearch={handleSearch} isLoading={isSearching} />

        {searchResults != undefined && <PdfsTable data={searchResults} />}
      </div>
    </div>
  );
}
