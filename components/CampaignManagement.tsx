"use client";

import React, { useState } from "react";
import { CompanyData, createCompany, updateCompany, deleteCompany } from "@/app/actions/campaigns";
import {
    Building2,
    Plus,
    Calendar,
    MoreHorizontal,
    Trash2,
    Edit,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CampaignManagement({ initialCompanies }: { initialCompanies: CompanyData[] }) {
    const [companies, setCompanies] = useState(initialCompanies);
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [plan, setPlan] = useState("FREE");
    const [endDate, setEndDate] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    // Success State
    const [successPass, setSuccessPass] = useState<string | null>(null);

    const resetForm = () => {
        setName("");
        setAdminEmail("");
        setPlan("FREE");
        setEndDate("");
        setIsActive(true);
        setEditingId(null);
    };

    const openCreate = () => {
        resetForm();
        setIsOpen(true);
    };

    const openEdit = (c: CompanyData) => {
        setEditingId(c.id);
        setName(c.name);
        setAdminEmail(c.adminEmail || "");
        setPlan(c.plan);
        setEndDate(c.subscriptionEndDate ? new Date(c.subscriptionEndDate).toISOString().split('T')[0] : "");
        setIsActive(c.isActive);
        setIsOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const dateVal = endDate ? new Date(endDate) : null;

        if (editingId) {
            // Update
            const res = await updateCompany(editingId, {
                name,
                plan,
                isActive,
                subscriptionEndDate: dateVal
            });
            if (res.success) {
                // Optimistic update or reload
                window.location.reload();
            } else {
                alert("Failed to update");
            }
        } else {
            // Create
            if (!adminEmail) {
                alert("Admin email is required for new companies");
                setLoading(false);
                return;
            }
            const res = await createCompany({
                name,
                plan,
                subscriptionEndDate: dateVal,
                adminEmail
            });

            const result = res as any; // Cast to access tempPassword if present

            if (result.success) {
                if (result.tempPassword) {
                    setSuccessPass(result.tempPassword);
                    setIsOpen(false);
                } else {
                    window.location.reload();
                }
            } else {
                alert("Failed to create: " + res.error);
            }
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete and all data associated? This cannot be undone.")) return;
        const res = await deleteCompany(id);
        if (res.success) {
            setCompanies(companies.filter(c => c.id !== id));
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-500" />
                    Companies
                </h2>
                <Button onClick={openCreate} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="w-4 h-4" />
                    New Company
                </Button>
            </div>

            {/* Modal / Form Area */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-xl shadow-xl border p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold mb-4">{editingId ? "Edit Company" : "New Company"}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Company Name</label>
                                <input
                                    className="w-full border rounded p-2 text-sm bg-zinc-50 dark:bg-zinc-800"
                                    value={name} onChange={e => setName(e.target.value)} required
                                />
                            </div>

                            {!editingId && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Admin Email</label>
                                    <input
                                        type="email"
                                        className="w-full border rounded p-2 text-sm bg-zinc-50 dark:bg-zinc-800"
                                        value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required
                                        placeholder="admin@company.com"
                                    />
                                    <p className="text-xs text-zinc-500 mt-1">A user account will be created or assigned.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Plan</label>
                                    <select
                                        className="w-full border rounded p-2 text-sm bg-zinc-50 dark:bg-zinc-800"
                                        value={plan} onChange={e => setPlan(e.target.value)}
                                    >
                                        <option value="FREE">Free</option>
                                        <option value="PRO">Pro</option>
                                        <option value="ENTERPRISE">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Active Status</label>
                                    <select
                                        className="w-full border rounded p-2 text-sm bg-zinc-50 dark:bg-zinc-800"
                                        value={isActive ? "true" : "false"} onChange={e => setIsActive(e.target.value === 'true')}
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Subscription End Date</label>
                                <input
                                    type="date"
                                    className="w-full border rounded p-2 text-sm bg-zinc-50 dark:bg-zinc-800"
                                    value={endDate} onChange={e => setEndDate(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {loading ? "Saving..." : "Save Company"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {companies.map(c => (
                    <div key={c.id} className="bg-white dark:bg-zinc-900 border rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-colors relative group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{c.name}</h4>
                                    <p className="text-xs text-zinc-500">{c.adminEmail || "No Admin"}</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-zinc-400">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEdit(c)}>
                                        <Edit className="w-4 h-4 mr-2" /> Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(c.id)}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="space-y-3 mt-4">
                            <div className="flex justify-between text-sm border-b pb-2">
                                <span className="text-zinc-500">Plan</span>
                                <span className="font-medium bg-zinc-100 dark:bg-zinc-800 px-2 rounded text-xs py-0.5">{c.plan}</span>
                            </div>
                            <div className="flex justify-between text-sm border-b pb-2">
                                <span className="text-zinc-500">Status</span>
                                {c.isActive ? (
                                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                        <CheckCircle2 className="w-3 h-3" /> Active
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                                        <XCircle className="w-3 h-3" /> Suspended
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Expires</span>
                                <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300" suppressHydrationWarning>
                                    <Calendar className="w-3 h-3 text-zinc-400" />
                                    {c.subscriptionEndDate
                                        ? new Date(c.subscriptionEndDate).toLocaleDateString()
                                        : "Lifetime"}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Success Password Modal */}
            {successPass && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-xl shadow-xl border p-6 text-center animate-in zoom-in-95">
                        <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold">Company Created!</h3>
                        <p className="text-zinc-500 text-sm mt-2">
                            A temporary password has been generated for the admin.
                        </p>
                        <div className="my-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded font-mono text-lg font-bold select-all border border-zinc-200 dark:border-zinc-700">
                            {successPass}
                        </div>
                        <p className="text-xs text-red-500 mb-4">
                            Copy this password now. It will not be shown again.
                        </p>
                        <Button onClick={() => window.location.reload()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                            Done & Reload
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
