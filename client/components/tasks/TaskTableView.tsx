import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { Task, TaskFilter } from "@/features/tasks/types";
import { MdChevronLeft, MdChevronRight, MdModeEdit, MdOutlineDeleteOutline } from "react-icons/md";

type TaskTableViewProps = {
  tasks: Task[];
  search: string;
  statusFilter: TaskFilter;
  page: number;
  totalCount: number;
  firstRow: number;
  lastRow: number;
  totalPages: number;
  isDeleting: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TaskFilter) => void;
  onPageChange: (page: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  openAddModal: () => void;
};

const statusOptions: Array<{ value: TaskFilter; label: string }> = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const getPaginationItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  if (currentPage <= 4) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
    pages.add(5);
  }
  if (currentPage >= totalPages - 3) {
    pages.add(totalPages - 4);
    pages.add(totalPages - 3);
    pages.add(totalPages - 2);
    pages.add(totalPages - 1);
  }

  const sortedPages = Array.from(pages)
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((a, b) => a - b);

  return sortedPages.reduce<Array<number | "...">>((items, pageNumber, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && pageNumber - previousPage > 1) {
      items.push("...");
    }
    items.push(pageNumber);
    return items;
  }, []);
};

export default function TaskTableView({
  tasks,
  search,
  statusFilter,
  page,
  totalCount,
  firstRow,
  lastRow,
  totalPages,
  isDeleting,
  onSearchChange,
  onStatusFilterChange,
  onPageChange,
  onEdit,
  onDelete,
  openAddModal,
}: TaskTableViewProps) {
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;
  const paginationItems = getPaginationItems(page, totalPages);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-center">
        <Input
          id="task-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by title"
          containerClassName="min-w-0"
        />
        <Select
          id="task-status-filter"
          options={statusOptions}
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as TaskFilter)}
        />
        <Button className="md:w-auto md:px-5" onClick={openAddModal}>
          Add Task
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Task</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Updated</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-900">{task.title}</p>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      task.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {task.status.at(0)?.toUpperCase() + task.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-500">{new Date(task.updated_at).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="icon" aria-label="Edit task" onClick={() => onEdit(task)}>
                      <MdModeEdit className="text-lg" />
                    </Button>
                    <Button
                      variant="icon"
                      color="danger"
                      aria-label="Delete task"
                      disabled={isDeleting}
                      onClick={() => onDelete(task)}
                    >
                      <MdOutlineDeleteOutline className="text-lg" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks.length === 0 ? (
        <div className="border-t border-slate-100 p-8 text-center text-sm text-slate-500">No tasks found.</div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-slate-200 p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>{totalCount > 0 ? `Showing ${firstRow}-${lastRow} of ${totalCount} tasks` : "Showing 0 tasks"}</p>

        <div className="flex items-center gap-1 overflow-x-auto">
          <Button
            type="button"
            variant="icon"
            aria-label="Previous page"
            disabled={!canGoPrevious}
            onClick={() => onPageChange(page - 1)}
          >
            <MdChevronLeft className="text-xl" />
          </Button>

          {paginationItems.map((item, index) =>
            item === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 min-w-10 items-center justify-center px-1 text-sm font-semibold text-slate-500"
              >
                ...
              </span>
            ) : (
              <Button
                key={item}
                variant="icon"
                color="success"
                type="button"
                onClick={() => onPageChange(item)}
                className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
                  item === page ? "bg-slate-800 text-black" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="icon"
            aria-label="Next page"
            disabled={!canGoNext}
            onClick={() => onPageChange(page + 1)}
          >
            <MdChevronRight className="text-xl" />
          </Button>
        </div>
      </div>
    </section>
  );
}
