import React from "react";
import { fetchCompanySettings } from "@/app/actions/settings";
import { SettingsForm } from "@/components/SettingsForm";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const data = await fetchCompanySettings();

    if (!data) {
        return <div className="p-8">Access Denied or Setup Incomplete</div>;
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Company Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage branding, defaults, and subscription.</p>
            </div>

            <SettingsForm
                initialSettings={data.settings}
                plan={data.plan || "Free"}
                subscriptionEndDate={data.subscriptionEndDate || null}
            />
        </div>
    );
}
