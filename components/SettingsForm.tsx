"use client";

import React, { useState } from "react";
import { CompanySettings, updateCompanySettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import {
    Palette,
    Globe,
    CreditCard,
    Save,
    Image as ImageIcon,
    LayoutTemplate
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface SettingsFormProps {
    initialSettings: CompanySettings;
    plan: string;
    subscriptionEndDate: Date | null;
}

export function SettingsForm({ initialSettings, plan, subscriptionEndDate }: SettingsFormProps) {
    const t = useTranslations('Settings');
    const tCommon = useTranslations('Common');
    const [settings, setSettings] = useState<CompanySettings>(initialSettings);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'branding' | 'preferences'>('branding');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await updateCompanySettings(settings);
        if (res.success) {
            alert(t('saved'));
        } else {
            alert(t('saveError'));
        }
        setLoading(false);
    };

    const updateField = (key: keyof CompanySettings, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 space-y-2">
                <button
                    onClick={() => setActiveTab('branding')}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                        activeTab === 'branding'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    )}
                >
                    <Palette className="w-4 h-4" />
                    {t('branding')}
                </button>
                <button
                    onClick={() => setActiveTab('preferences')}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                        activeTab === 'preferences'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    )}
                >
                    <Globe className="w-4 h-4" />
                    {t('regionalPreferences')}
                </button>

                <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="px-4">
                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">{t('subscription')}</h4>
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-indigo-500" />
                                <span className="font-semibold text-sm">{t('plan', { plan })}</span>
                            </div>
                            <div className="text-xs text-zinc-500" suppressHydrationWarning>
                                {t('expires', { date: subscriptionEndDate ? new Date(subscriptionEndDate).toLocaleDateString() : t('lifetime') })}
                            </div>
                            <Button variant="outline" size="sm" className="w-full text-xs h-7">
                                {t('manageBilling')}
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content */}
            <main className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border shadow-sm p-6 md:p-8 min-h-[500px]">
                <form onSubmit={handleSave} className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold">
                                {activeTab === 'branding' ? t('companyBranding') : t('preferences')}
                            </h2>
                            <p className="text-sm text-zinc-500 mt-1">
                                {activeTab === 'branding'
                                    ? t('brandingDesc')
                                    : t('regionalPreferencesDesc')}
                            </p>
                        </div>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                            <Save className="w-4 h-4" />
                            {loading ? tCommon('loading') : tCommon('save')}
                        </Button>
                    </div>

                    {activeTab === 'branding' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-zinc-400" />
                                    {t('companyLogoUrl')}
                                </label>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="url"
                                            value={settings.logoUrl || ""}
                                            onChange={e => updateField('logoUrl', e.target.value)}
                                            className="w-full p-2 border rounded-md text-sm bg-transparent focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            placeholder="https://example.com/logo.png"
                                        />
                                    </div>
                                    <div className="w-10 h-10 rounded border bg-zinc-50 flex items-center justify-center overflow-hidden shrink-0">
                                        {settings.logoUrl ? (
                                            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <LayoutTemplate className="w-4 h-4 text-zinc-300" />
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500">{t('logoHint')}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-zinc-400" />
                                    {t('brandColor')}
                                </label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={settings.brandColor || "#4f46e5"}
                                        onChange={e => updateField('brandColor', e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={settings.brandColor || "#4f46e5"}
                                        onChange={e => updateField('brandColor', e.target.value)}
                                        className="w-32 p-2 border rounded-md text-sm bg-transparent font-mono uppercase"
                                        maxLength={7}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">{t('brandColorHint')}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('dateFormat')}</label>
                                <select
                                    value={settings.dateFormat || "DD.MM.YYYY"}
                                    onChange={e => updateField('dateFormat', e.target.value)}
                                    className="w-full p-2 border rounded-md text-sm bg-transparent focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                >
                                    <option value="DD.MM.YYYY">DD.MM.YYYY (14.01.2026)</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY (01/14/2026)</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-01-14)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('currency')}</label>
                                <select
                                    value={settings.currency || "USD"}
                                    onChange={e => updateField('currency', e.target.value)}
                                    className="w-full p-2 border rounded-md text-sm bg-transparent focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="TRY">TRY (₺)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}
