// src/hooks/useSearchPDFs.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllPDFs, searchPDFsByQuery } from "@/actions/searchPDFsByQuery";

export const useSearchPDFs = () => {
  return useMutation({
    mutationKey: ["search-pdfs"],
    mutationFn: async (query: string) => await searchPDFsByQuery(query),
  });
};

export const useAllPDFs = () => {
  return useQuery({
    queryKey: ["all-pdfs"],
    queryFn: async () => await getAllPDFs(),
  });
};
