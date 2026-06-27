import { useQuery } from "@tanstack/react-query";
import { getTaskStats } from "../api/stats";

const statsQueryKey = ["stats"] as const;

export const useTaskStats = () => {
  return useQuery({
    queryKey: statsQueryKey,
    queryFn: getTaskStats,
    staleTime: 0,
    refetchOnMount: "always",
  });
};
