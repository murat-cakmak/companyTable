import React from "react";
import Link from "next/link";
import { fetchDashboardStats } from "@/app/actions/dashboard";
import {
    Layout,
    Table as TableIcon,
    List,
    Clock,
    ArrowRight,
    TrendingUp,
    FileSpreadsheet
} from "lucide-react";

export const dynamic = 'force-dynamic'; // Ensure stats are always fresh

export default async function DashboardPage() {
    const stats = await fetchDashboardStats();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Overview of your company's data and activity.</p>
                </div>
                <Link href="/">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                        Open Editor <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Sheets"
                    value={stats.totalSheets}
                    icon={<FileSpreadsheet className="h-4 w-4 text-indigo-600" />}
                    trend="+1 this week"
                />
                <StatCard
                    title="Total Tables"
                    value={stats.totalTables}
                    icon={<TableIcon className="h-4 w-4 text-emerald-600" />}
                    trend="Stable"
                />
                <StatCard
                    title="Total Rows"
                    value={stats.totalRows}
                    icon={<List className="h-4 w-4 text-amber-600" />}
                    trend="+12% increase"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity / Sheets */}
                <div className="col-span-4 bg-white dark:bg-zinc-900 border rounded-xl shadow-sm">
                    <div className="p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-zinc-500" />
                                Recent Sheets
                            </h3>
                            <span className="text-xs text-zinc-500">Last 5 active sheets</span>
                        </div>

                        {stats.recentSheets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center text-zinc-500">
                                <p>No sheets found.</p>
                                <Link href="/" className="text-indigo-600 hover:underline text-sm mt-2">Create your first sheet</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stats.recentSheets.map((sheet, i) => (
                                    <div key={sheet.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {sheet.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">{sheet.name}</p>
                                                <p className="text-xs text-zinc-500">Edited {new Date(sheet.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Link href="/">
                                            <button className="text-xs font-medium text-zinc-500 hover:text-indigo-600 px-2 py-1 rounded bg-white dark:bg-zinc-800 border opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                Open
                                            </button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Visualization Mockup */}
                <div className="col-span-3 bg-white dark:bg-zinc-900 border rounded-xl shadow-sm p-6 flex flex-col">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-zinc-500" />
                        Data Growth
                    </h3>
                    <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2">
                        {/* Mock Charts */}
                        {[40, 65, 34, 78, 55, 90, 85].map((h, i) => (
                            <div key={i} className="w-full bg-indigo-50 dark:bg-indigo-900/10 rounded-t-sm relative group overflow-hidden" style={{ height: `${h}%` }}>
                                <div className="absolute bottom-0 left-0 right-0 bg-indigo-500/80 h-0 transition-all duration-700 ease-out group-hover:h-full" style={{ height: `${h}%` }} />
                                <div className="absolute bottom-0 left-0 right-0 top-0 bg-gradient-to-t from-indigo-500/20 to-transparent" />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400 mt-2 px-2">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend }: { title: string, value: number, icon: React.ReactNode, trend: string }) {
    return (
        <div className="rounded-xl border bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-zinc-500">{title}</h3>
                {icon}
            </div>
            <div className="flex items-end justify-between pt-2">
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-zinc-500 font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    {trend}
                </p>
            </div>
        </div>
    );
}
