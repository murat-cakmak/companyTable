import { ExcelTable } from "@/components/ExcelTable";
import { AppHeader } from "@/components/AppHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 flex flex-col">
      <AppHeader />

      <div className="flex-1 overflow-hidden">
        <ExcelTable />
      </div>
    </main>
  );
}
