import { useQuery } from "@tanstack/react-query";
import { useSupabaseSession } from "./useSupabaseSession";

export const useSessionQuery = () => {
  const { accessToken, user } = useSupabaseSession();

  const sessionQuery = useQuery({
    queryKey: ["session", accessToken],
    queryFn: async () => {
      // Si quieres validar el token contra tu backend hazlo aquí.
      // Por ahora simplemente devolvemos el usuario:
      return { user, accessToken };
    },
    enabled: !!accessToken,
    refetchInterval: 30 * 1000, // 30 segundos
  });
  return { sessionQuery };
};
