"use client";

import React, { useState } from "react";
import { User, Company, Role } from "@prisma/client";
import { updateProfile, changePassword } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Lock, Building, Mail, Shield, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProfileFormProps {
    user: User & { company: Company | null };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const t = useTranslations('Profile');
    const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');

    // General Form
    const [name, setName] = useState(user.name || "");
    const [loading, setLoading] = useState(false);

    // Password Form
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [passLoading, setPassLoading] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await updateProfile({ name });
        if (res.success) {
            alert(t('pupdated'));
        } else {
            alert(t('pupdateError'));
        }
        setLoading(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            alert(t('passMismatch'));
            return;
        }
        if (newPass.length < 6) {
            alert(t('passMinLength'));
            return;
        }

        setPassLoading(true);
        const res = await changePassword(newPass);
        if (res.success) {
            alert(t('passChanged'));
            setNewPass("");
            setConfirmPass("");
        } else {
            alert(t('passChangeError'));
        }
        setPassLoading(false);
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar / Tabs */}
            <aside className="w-full md:w-64 space-y-2">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'general'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                        : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                        }`}
                >
                    <UserIcon className="w-4 h-4" />
                    {t('generalInfo')}
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'security'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                        : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                        }`}
                >
                    <Lock className="w-4 h-4" />
                    {t('securityPassword')}
                    {user.mustChangePassword && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                </button>
            </aside>

            {/* Content Area */}
            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border shadow-sm p-6 md:p-8 min-h-[400px]">
                {activeTab === 'general' ? (
                    <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h2 className="text-xl font-bold mb-6">{t('profileInfo')}</h2>

                        <div className="space-y-6">
                            {/* Read Only Tech Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('emailAddress')}</label>
                                    <div className="flex items-center gap-2 text-sm font-medium p-3 bg-zinc-50 dark:bg-zinc-800 rounded border">
                                        <Mail className="w-4 h-4 text-zinc-400" />
                                        {user.email}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('role')}</label>
                                    <div className="flex items-center gap-2 text-sm font-medium p-3 bg-zinc-50 dark:bg-zinc-800 rounded border">
                                        <Shield className="w-4 h-4 text-zinc-400" />
                                        {user.role}
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('company')}</label>
                                    <div className="flex items-center gap-2 text-sm font-medium p-3 bg-zinc-50 dark:bg-zinc-800 rounded border">
                                        <Building className="w-4 h-4 text-zinc-400" />
                                        {user.company?.name || t('noCompany')}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-zinc-100 dark:border-zinc-800" />

                            {/* Editable Form */}
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('fullName')}</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full p-2 border rounded-md text-sm bg-transparent focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        {loading ? t('saving') : t('saveChanges')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                            {t('securitySettings')}
                            {user.mustChangePassword && (
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full border border-red-200">
                                    {t('actionRequired')}
                                </span>
                            )}
                        </h2>

                        {user.mustChangePassword && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 mb-6 rounded-r-md">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    {t('tempPasswordWarning')}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('newPassword')}</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={newPass}
                                        onChange={e => setNewPass(e.target.value)}
                                        className="w-full p-2 border rounded-md text-sm bg-transparent focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        placeholder={t('minCharPlaceholder')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('confirmNewPassword')}</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={confirmPass}
                                        onChange={e => setConfirmPass(e.target.value)}
                                        className="w-full p-2 border rounded-md text-sm bg-transparent focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        placeholder={t('repeatPasswordPlaceholder')}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button type="submit" disabled={passLoading} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900">
                                    {passLoading ? t('updating') : t('updatePassword')}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
