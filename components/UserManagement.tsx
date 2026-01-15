"use client";

import React, { useState } from "react";
import { UserData, inviteUser, deleteUser } from "@/app/actions/users";
import {
    Trash2,
    UserPlus,
    Mail,
    Shield,
    MoreHorizontal,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function UserManagement({ initialUsers }: { initialUsers: UserData[] }) {
    const t = useTranslations('Users');
    const [users, setUsers] = useState(initialUsers);
    const [isInviting, setIsInviting] = useState(false);

    // Invite Form State
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("VIEWER");
    const [loading, setLoading] = useState(false);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await inviteUser(email, role);
        if (res.success) {
            alert(t('invitedSuccess'));
            setEmail("");
            setIsInviting(false);
            // In a real app we'd re-fetch, but for now let's just reload or trust revalidate
            window.location.reload();
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('deleteConfirm'))) return;
        const res = await deleteUser(id);
        if (res.success) {
            setUsers(users.filter(u => u.id !== id));
        } else {
            alert(t('deleteError'));
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        placeholder={t('searchPlaceholder')}
                    />
                </div>
                <Button onClick={() => setIsInviting(!isInviting)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <UserPlus className="w-4 h-4" />
                    {t('inviteMember')}
                </Button>
            </div>

            {/* Invite Form (Inline for simplicity) */}
            {isInviting && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 p-6 rounded-xl animate-in slide-in-from-top-2 duration-300">
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-4">{t('inviteTitle')}</h3>
                    <form onSubmit={handleInvite} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-medium text-zinc-500">{t('emailAddress')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-4 h-10 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    placeholder={t('emailPlaceholder')}
                                />
                            </div>
                        </div>
                        <div className="w-48 space-y-2">
                            <label className="text-xs font-medium text-zinc-500">{t('role')}</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    className="w-full pl-9 pr-4 h-10 text-sm border rounded-lg bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none"
                                >
                                    <option value="VIEWER">{t('roleViewer')}</option>
                                    <option value="EDITOR">{t('roleEditor')}</option>
                                    <option value="COMPANY_ADMIN">{t('roleAdmin')}</option>
                                </select>
                            </div>
                        </div>
                        <Button type="submit" disabled={loading} className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white w-32">
                            {loading ? t('sending') : t('sendInvite')}
                        </Button>
                    </form>
                </div>
            )}

            {/* User List */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b bg-zinc-50/50 dark:bg-zinc-800/50">
                            <th className="px-6 py-4 font-medium text-zinc-500">{t('tableUser')}</th>
                            <th className="px-6 py-4 font-medium text-zinc-500">{t('tableRole')}</th>
                            <th className="px-6 py-4 font-medium text-zinc-500">{t('tableJoined')}</th>
                            <th className="px-6 py-4 font-medium text-zinc-500 text-right">{t('tableActions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                                            <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-zinc-900 dark:text-zinc-100">{user.name || t('unknown')}</div>
                                            <div className="text-xs text-zinc-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                        user.role === 'COMPANY_ADMIN'
                                            ? "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                                            : user.role === 'EDITOR'
                                                ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                                                : "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                                    )}>
                                        {user.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-zinc-500" suppressHydrationWarning>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="text-red-600 gap-2" onClick={() => handleDelete(user.id)}>
                                                <Trash2 className="w-4 h-4" /> {t('removeUser')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-8 text-center text-zinc-500">{t('noUsers')}</div>
                )}
            </div>
        </div>
    );
}


