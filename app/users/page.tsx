import React from "react";
import { fetchCompanyUsers } from "@/app/actions/users";
import { UserManagement } from "@/components/UserManagement";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const users = await fetchCompanyUsers();

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Team Members</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your team and their access permissions.</p>
                </div>
            </div>

            <UserManagement initialUsers={users} />
        </div>
    );
}
