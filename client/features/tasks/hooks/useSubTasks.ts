import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSubTask,
  deleteSubTask,
  getSubTasks,
  updateSubTask,
} from "../api/subTasks";

const subTasksQueryKey = ["sub-tasks"] as const;
const tasksQueryKey = ["tasks"] as const;

const invalidateTaskQueries = (queryClient: ReturnType<typeof useQueryClient>, taskId: number) => {
  queryClient.invalidateQueries({
    queryKey: [...subTasksQueryKey, taskId],
  });
  queryClient.invalidateQueries({ queryKey: tasksQueryKey });
};

export const useSubTasks = (taskId: number) => {
  return useQuery({
    queryKey: [...subTasksQueryKey, taskId],
    queryFn: () => getSubTasks(taskId),
  });
};

export const useCreateSubTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubTask,
    onSuccess: (_data, variables) => {
      invalidateTaskQueries(queryClient, variables.taskId);
    },
  });
};

export const useUpdateSubTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubTask,
    onSuccess: (_data, variables) => {
      invalidateTaskQueries(queryClient, variables.taskId);
    },
  });
};

export const useDeleteSubTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubTask,
    onSuccess: (_data, variables) => {
      invalidateTaskQueries(queryClient, variables.taskId);
    },
  });
};
