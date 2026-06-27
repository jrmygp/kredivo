"use client";

import type { Task } from "@/features/tasks/types";
import { IoMdClose } from "react-icons/io";
import SubTaskList from "./SubTaskList";

type SubTaskModalProps = {
  task: Task;
  onClose: () => void;
};

export default function SubTaskModal({ task, onClose }: SubTaskModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Sub-Tasks</p>
            <h2 className="mt-1 truncate text-xl font-bold text-slate-900">{task.title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-lg leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <IoMdClose />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <SubTaskList taskId={task.id} />
        </div>
      </div>
    </div>
  );
}
