import Button from "@/components/ui/Button";
import type { Task } from "@/features/tasks/types";
import { MdModeEdit, MdOutlineDeleteOutline } from "react-icons/md";

type TaskTableViewProps = {
  tasks: Task[];
  isDeleting: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export default function TaskTableView({ tasks, isDeleting, onEdit, onDelete }: TaskTableViewProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
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
                      task.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {task.status}
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
    </section>
  );
}
