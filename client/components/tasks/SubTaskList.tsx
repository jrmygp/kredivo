"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCreateSubTask, useDeleteSubTask, useSubTasks, useUpdateSubTask } from "@/features/tasks/hooks/useSubTasks";
import type { SubTask, TaskStatus } from "@/features/tasks/types";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { MdAdd, MdCheck, MdClose, MdDeleteOutline, MdEdit } from "react-icons/md";

type SubTaskListProps = {
  taskId: number;
};

export default function SubTaskList({ taskId }: SubTaskListProps) {
  const { enqueueSnackbar } = useSnackbar();
  const subTasksQuery = useSubTasks(taskId);
  const createSubTaskMutation = useCreateSubTask();
  const updateSubTaskMutation = useUpdateSubTask();
  const deleteSubTaskMutation = useDeleteSubTask();
  const [newTitle, setNewTitle] = useState("");
  const [editingSubTask, setEditingSubTask] = useState<SubTask | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("active");

  const subTasks = subTasksQuery.data ?? [];
  const isSaving = createSubTaskMutation.isPending || updateSubTaskMutation.isPending;

  const handleCreate = () => {
    const title = newTitle.trim();
    if (!title) {
      return;
    }

    createSubTaskMutation.mutate(
      { taskId, title },
      {
        onSuccess: () => {
          setNewTitle("");
          enqueueSnackbar("Sub-task created successfully.", { variant: "success" });
        },
      },
    );
  };

  const startEdit = (subTask: SubTask) => {
    setEditingSubTask(subTask);
    setEditTitle(subTask.title);
    setEditStatus(subTask.status);
  };

  const cancelEdit = () => {
    setEditingSubTask(null);
    setEditTitle("");
    setEditStatus("active");
  };

  const handleUpdate = () => {
    if (!editingSubTask) {
      return;
    }

    const title = editTitle.trim();
    if (!title) {
      return;
    }

    updateSubTaskMutation.mutate(
      { taskId, id: editingSubTask.id, title, status: editStatus },
      {
        onSuccess: () => {
          cancelEdit();
          enqueueSnackbar("Sub-task updated successfully.", { variant: "success" });
        },
      },
    );
  };

  const handleToggleStatus = (subTask: SubTask) => {
    const nextStatus = subTask.status === "active" ? "completed" : "active";

    updateSubTaskMutation.mutate(
      { taskId, id: subTask.id, status: nextStatus },
      {
        onSuccess: () => {
          enqueueSnackbar("Sub-task status updated.", { variant: "success" });
        },
      },
    );
  };

  const handleDelete = (subTask: SubTask) => {
    deleteSubTaskMutation.mutate(
      { taskId, id: subTask.id },
      {
        onSuccess: (deletedSubTask) => {
          enqueueSnackbar(`Sub-task "${deletedSubTask.title}" deleted successfully.`, {
            variant: "success",
          });
        },
      },
    );
  };

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Sub-tasks</p>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-500">{subTasks.length}</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {subTasksQuery.isLoading ? <p className="text-sm text-slate-500">Loading sub-tasks...</p> : null}

        {subTasks.map((subTask) => {
          const isEditing = editingSubTask?.id === subTask.id;

          return (
            <div key={subTask.id} className="rounded-lg border border-slate-200 bg-white p-3">
              {isEditing ? (
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <Input
                    id={`sub-task-title-${subTask.id}`}
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    placeholder="Sub-task title"
                    containerClassName="min-w-0"
                  />

                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="icon"
                      aria-label="Save sub-task"
                      disabled={isSaving || !editTitle.trim()}
                      onClick={handleUpdate}
                    >
                      <MdCheck className="text-lg" />
                    </Button>
                    <Button variant="icon" color="danger" aria-label="Cancel edit sub-task" onClick={cancelEdit}>
                      <MdClose className="text-lg" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(subTask)}
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        subTask.status === "completed"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white text-transparent"
                      }`}
                    >
                      <MdCheck className="text-sm" />
                    </span>
                    <span
                      className={`truncate text-sm font-medium ${
                        subTask.status === "completed" ? "text-slate-400 line-through" : "text-slate-800"
                      }`}
                    >
                      {subTask.title}
                    </span>
                  </button>

                  <div className="flex gap-2">
                    <Button variant="icon" aria-label="Edit sub-task" onClick={() => startEdit(subTask)}>
                      <MdEdit className="text-lg" />
                    </Button>

                    <Button
                      variant="icon"
                      color="danger"
                      aria-label="Delete sub-task"
                      disabled={deleteSubTaskMutation.isPending}
                      onClick={() => handleDelete(subTask)}
                    >
                      <MdDeleteOutline className="text-lg" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!subTasksQuery.isLoading && subTasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            No sub-tasks yet.
          </p>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          id={`new-sub-task-${taskId}`}
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="Add sub-task"
          containerClassName="min-w-0"
        />
        <Button
          variant="outlined"
          className="sm:w-auto sm:px-4"
          disabled={createSubTaskMutation.isPending || !newTitle.trim()}
          onClick={handleCreate}
        >
          <MdAdd className="mr-1 text-lg" />
          Add
        </Button>
      </div>
    </div>
  );
}
