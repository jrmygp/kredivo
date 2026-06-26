"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import SubTaskModal from "@/components/tasks/SubTaskModal";
import TaskTableView from "@/components/tasks/TaskTableView";
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from "@/features/tasks/hooks/useTasks";
import type { Task, TaskFilter, TaskSortBy, TaskSortOrder, TaskStatus } from "@/features/tasks/types";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mapDispatchToProps, mapStateToProps } from "@/redux";
import { connect } from "react-redux";
import { IoMdClose } from "react-icons/io";

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

type DashboardPageProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const DashboardPage = ({ handleResetState }: DashboardPageProps) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<TaskSortBy>("created");
  const [sortDirections, setSortDirections] = useState<Record<TaskSortBy, TaskSortOrder>>({
    title: "asc",
    status: "asc",
    subTasksCount: "asc",
    created: "desc",
  });
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSubTaskParent, setSelectedSubTaskParent] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("active");

  const tasksQuery = useTasks({
    status: filter,
    search: debouncedSearch,
    page,
    sortBy,
    sortOrder: sortDirections[sortBy],
  });
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const tasksResponse = tasksQuery.data;
  const tasks = tasksResponse?.data ?? [];

  const isSubmitting = createTaskMutation.isPending || updateTaskMutation.isPending;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

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

  const openSubTaskModal = (task: Task) => {
    setSelectedSubTaskParent(task);
  };

  const closeSubTaskModal = () => {
    setSelectedSubTaskParent(null);
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
            enqueueSnackbar("Task updated successfully.", {
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
          enqueueSnackbar("Task created successfully.", { variant: "success" });
        },
      },
    );
  };

  const handleDeleteTask = (task: Task) => {
    deleteTaskMutation.mutate(task.id, {
      onSuccess: (deletedTask) => {
        enqueueSnackbar(`Task "${deletedTask.title}" deleted successfully.`, {
          variant: "success",
        });
      },
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleFilterChange = (value: TaskFilter) => {
    setFilter(value);
    setPage(1);
  };

  const handleSortChange = (nextSortBy: TaskSortBy) => {
    setSortDirections((currentDirections) => ({
      ...currentDirections,
      [nextSortBy]: currentDirections[nextSortBy] === "asc" ? "desc" : "asc",
    }));
    setSortBy(nextSortBy);
    setPage(1);
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

          <Button color="danger" className="sm:w-auto sm:px-5" onClick={handleLogout}>
            Logout
          </Button>
        </header>

        {tasksQuery.isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">Memuat task...</div>
        ) : null}

        {tasksQuery.isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Failed to load tasks.
          </div>
        ) : null}

        {!tasksQuery.isLoading && !tasksQuery.isError ? (
          <TaskTableView
            tasks={tasks}
            search={search}
            statusFilter={filter}
            page={page}
            totalCount={tasksResponse?.totalCount ?? 0}
            firstRow={tasksResponse?.firstRow ?? 0}
            lastRow={tasksResponse?.lastRow ?? 0}
            totalPages={tasksResponse?.totalPages ?? 0}
            sortBy={sortBy}
            sortDirections={sortDirections}
            isDeleting={deleteTaskMutation.isPending}
            onSearchChange={handleSearchChange}
            onStatusFilterChange={handleFilterChange}
            onPageChange={setPage}
            onSortChange={handleSortChange}
            onEdit={openEditModal}
            onSubTasks={openSubTaskModal}
            onDelete={handleDeleteTask}
            openAddModal={openAddModal}
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
                <IoMdClose />
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
                <p className="text-sm text-red-600">Something went wrong, please try again.</p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outlined"
                  color="danger"
                  className="sm:w-auto sm:px-5"
                  onClick={closeModal}
                >
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

      {selectedSubTaskParent ? <SubTaskModal task={selectedSubTaskParent} onClose={closeSubTaskModal} /> : null}
    </main>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);
