"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC } from "react";

// Create a client
const queryClient = new QueryClient();

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

export const ReactQueryProvider: FC<ReactQueryProviderProps> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
