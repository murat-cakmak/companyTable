import { ExcelTable } from "@/components/ExcelTable";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-4">
      <div className="w-full space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Editable Data Table
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            A dynamic table with editable cells, rows, and columns.
          </p>
        </div>

        <ExcelTable />
      </div>
    </main>
  );
}
