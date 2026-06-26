"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TaskTableView from "@/components/tasks/TaskTableView";
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from "@/features/tasks/hooks/useTasks";
import type { Task, TaskFilter, TaskStatus } from "@/features/tasks/types";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mapDispatchToProps, mapStateToProps } from "@/redux";
import { connect } from "react-redux";

const filters: Array<{ value: TaskFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

type DashboardPageProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const DashboardPage = ({ handleResetState }: DashboardPageProps) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("active");

  const tasksQuery = useTasks(filter);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const tasks = tasksQuery.data ?? [];

  const isSubmitting = createTaskMutation.isPending || updateTaskMutation.isPending;

  const openAddModal = () => {
    createTaskMutation.reset();
    updateTaskMutation.reset();
    setSelectedTask(null);
    setTitle("");
    setStatus("active");
    setModalMode("add");
  };

  const openEditModal = (task: Task) => {
    createTaskMutation.reset();
    updateTaskMutation.reset();
    setSelectedTask(task);
    setTitle(task.title);
    setStatus(task.status);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedTask(null);
    setTitle("");
    setStatus("active");
  };

  const handleSubmitTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    if (modalMode === "edit" && selectedTask) {
      updateTaskMutation.mutate(
        { id: selectedTask.id, title: trimmedTitle, status },
        {
          onSuccess: () => {
            closeModal();
            enqueueSnackbar("Task berhasil diperbarui.", {
              variant: "success",
            });
          },
        },
      );
      return;
    }

    createTaskMutation.mutate(
      { title: trimmedTitle },
      {
        onSuccess: () => {
          closeModal();
          enqueueSnackbar("Task berhasil dibuat.", { variant: "success" });
        },
      },
    );
  };

  const handleDeleteTask = (task: Task) => {
    deleteTaskMutation.mutate(task.id, {
      onSuccess: (deletedTask) => {
        enqueueSnackbar(`Task "${deletedTask.title}" berhasil dihapus.`, {
          variant: "success",
        });
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    handleResetState();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">My Tasks</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-auto">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`h-10 min-w-20 rounded-md px-3 text-sm font-semibold transition sm:min-w-28 ${
                    filter === item.value ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <Button className="sm:w-auto sm:px-5" onClick={openAddModal}>
              Add Task
            </Button>

            <Button color="danger" className="sm:w-auto sm:px-5" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </header>

        {tasksQuery.isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">Memuat task...</div>
        ) : null}

        {tasksQuery.isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Failed to laod tasks.
          </div>
        ) : null}

        {!tasksQuery.isLoading && !tasksQuery.isError ? (
          <TaskTableView
            tasks={tasks}
            isDeleting={deleteTaskMutation.isPending}
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
          />
        ) : null}
      </div>

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{modalMode === "add" ? "Add Task" : "Edit Task"}</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md px-2 py-1 text-lg leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close modal"
              >
                x
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmitTask}>
              <Input
                id="task-title"
                label="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Input title"
                autoFocus
              />

              {modalMode === "edit" ? (
                <Select
                  id="task-status"
                  label="Status"
                  options={statusOptions}
                  value={status}
                  onChange={(event) => setStatus(event.target.value as TaskStatus)}
                />
              ) : null}

              {createTaskMutation.isError || updateTaskMutation.isError ? (
                <p className="text-sm text-red-600">Task belum bisa disimpan. Coba cek input atau koneksi backend.</p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="outlined" className="sm:w-auto sm:px-5" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="sm:w-auto sm:px-5" disabled={isSubmitting || !title.trim()}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);
