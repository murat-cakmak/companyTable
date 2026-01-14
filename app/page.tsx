import { ExcelTable } from "@/components/ExcelTable";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 flex flex-col">
      <header className="h-10 border-b bg-white dark:bg-zinc-900 flex items-center px-4 shrink-0 shadow-sm z-10">
        <div className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          Company Data
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <ExcelTable />
      </div>
    </main>
  );
}
