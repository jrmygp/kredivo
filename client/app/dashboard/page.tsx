"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Tabs from "@/components/ui/Tabs";
import TaskTableView from "@/components/tasks/TaskTableView";
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from "@/features/tasks/hooks/useTasks";
import type { Task, TaskFilter, TaskStatus } from "@/features/tasks/types";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useSnackbar } from "notistack";
import { useMemo, useState } from "react";
import { MdModeEdit, MdOutlineDeleteOutline } from "react-icons/md";
import { useRouter } from "next/navigation";
import { mapDispatchToProps, mapStateToProps } from "@/redux";
import { connect } from "react-redux";

const columns: Array<{ id: TaskStatus; title: string; description: string }> = [
  {
    id: "active",
    title: "Active",
    description: "Task yang masih perlu dikerjakan.",
  },
  {
    id: "completed",
    title: "Completed",
    description: "Task yang sudah selesai.",
  },
];

const filters: Array<{ value: TaskFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

type TaskView = "kanban" | "table";

const taskViews: Array<{ value: TaskView; label: string }> = [
  { value: "table", label: "Table" },
  { value: "kanban", label: "Kanban" },
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
  const [view, setView] = useState<TaskView>("table");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("active");

  const tasksQuery = useTasks(filter);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const tasks = tasksQuery.data ?? [];

  const visibleColumns = filter === "all" ? columns : columns.filter((column) => column.id === filter);

  const tasksByStatus = useMemo(() => {
    const tasks = tasksQuery.data ?? [];

    return columns.reduce<Record<TaskStatus, Task[]>>(
      (accumulator, column) => {
        accumulator[column.id] = tasks.filter((task) => task.status === column.id);
        return accumulator;
      },
      { active: [], completed: [] },
    );
  }, [tasksQuery.data]);

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

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      return;
    }

    updateTaskMutation.mutate(
      {
        id: Number(draggableId),
        status: destination.droppableId as TaskStatus,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Status task berhasil diperbarui.", {
            variant: "success",
          });
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">My Tasks</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Tambah task, ubah detailnya, atau geser kartu ke kolom completed saat pekerjaan sudah selesai.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Tabs items={taskViews} value={view} onChange={setView} />

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
            Gagal memuat task. Pastikan backend berjalan dan token login masih valid.
          </div>
        ) : null}

        {!tasksQuery.isLoading && !tasksQuery.isError && view === "table" ? (
          <TaskTableView
            tasks={tasks}
            isDeleting={deleteTaskMutation.isPending}
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
          />
        ) : null}

        {!tasksQuery.isLoading && !tasksQuery.isError && view === "kanban" ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <section className={`grid gap-4 ${visibleColumns.length === 1 ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}>
              {visibleColumns.map((column) => {
                const columnTasks = tasksByStatus[column.id];

                return (
                  <Droppable droppableId={column.id} key={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[28rem] rounded-lg border p-3 transition ${
                          snapshot.isDraggingOver ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">
                              {column.title}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">{column.description}</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {columnTasks.length}
                          </span>
                        </div>

                        <div className="flex flex-col gap-3">
                          {columnTasks.map((task, index) => (
                            <Draggable draggableId={String(task.id)} index={index} key={task.id}>
                              {(dragProvided, dragSnapshot) => (
                                <article
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition ${
                                    dragSnapshot.isDragging
                                      ? "rotate-1 shadow-xl ring-2 ring-emerald-200"
                                      : "hover:border-slate-300 hover:shadow-md"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <h3 className="text-sm font-semibold leading-6 text-slate-900">{task.title}</h3>
                                      <p className="mt-1 text-xs text-slate-500">
                                        Updated {new Date(task.updated_at).toLocaleDateString("id-ID")}
                                      </p>
                                    </div>
                                    <span
                                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                                        task.status === "completed"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-amber-100 text-amber-700"
                                      }`}
                                    >
                                      {task.status}
                                    </span>
                                  </div>

                                  <div className="mt-4 flex gap-2">
                                    <Button variant="icon" aria-label="Edit task" onClick={() => openEditModal(task)}>
                                      <MdModeEdit className="text-lg" />
                                    </Button>
                                    <Button
                                      variant="icon"
                                      color="danger"
                                      aria-label="Delete task"
                                      disabled={deleteTaskMutation.isPending}
                                      onClick={() => handleDeleteTask(task)}
                                    >
                                      <MdOutlineDeleteOutline className="text-lg" />
                                    </Button>
                                  </div>
                                </article>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}

                          {columnTasks.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                              Belum ada task di kolom ini.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </section>
          </DragDropContext>
        ) : null}
      </div>

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{modalMode === "add" ? "Add Task" : "Edit Task"}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modalMode === "add"
                    ? "Buat task baru dengan judul yang jelas."
                    : "Perbarui judul task yang dipilih."}
                </p>
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
                placeholder="Masukkan judul task"
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
