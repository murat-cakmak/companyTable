import React from "react";
import { fetchAllCompanies } from "@/app/actions/campaigns";
import { CampaignManagement } from "@/components/CampaignManagement";

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
    const companies = await fetchAllCompanies();

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Campaigns & Companies</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage client companies, subscription plans, and validity periods.</p>
            </div>

            <CampaignManagement initialCompanies={companies} />
        </div>
    );
}
