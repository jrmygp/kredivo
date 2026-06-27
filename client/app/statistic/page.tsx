"use client";

import Button from "@/components/ui/Button";
import { useTaskStats } from "@/features/stats/hooks/useStats";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import { MdArrowBack } from "react-icons/md";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StatisticPage() {
  const router = useRouter();
  const statsQuery = useTaskStats();
  const stats = statsQuery.data;

  const chartData: ChartData<"bar"> = {
    labels: ["Active", "Completed"],
    datasets: [
      {
        label: "Tasks",
        data: [stats?.activeTasks ?? 0, stats?.completedTasks ?? 0],
        backgroundColor: ["rgba(59, 130, 246, 0.85)", "rgba(16, 185, 129, 0.85)"],
        borderColor: ["rgb(37, 99, 235)", "rgb(5, 150, 105)"],
        borderRadius: 8,
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">Task Overview</h1>
          </div>

          <Button variant="contained" className="sm:w-auto sm:px-5" onClick={() => router.push("/dashboard")}>
            <MdArrowBack className="mr-2 text-lg" />
            Dashboard
          </Button>
        </header>

        {statsQuery.isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Memuat statistik...
          </div>
        ) : null}

        {statsQuery.isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Failed to load statistics.
          </div>
        ) : null}

        {!statsQuery.isLoading && !statsQuery.isError ? (
          <>
            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Total Task</p>
                <p className="mt-3 text-4xl font-bold text-slate-900">{stats?.totalTasks ?? 0}</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Completion Rate</p>
                <p className="mt-3 text-4xl font-bold text-emerald-700">{stats?.completionRate ?? 0}%</p>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">Active vs Completed</h2>
              </div>
              <div className="h-80">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
