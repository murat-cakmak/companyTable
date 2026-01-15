import React from "react";
import { getAuthenticatedUser } from "@/app/actions/auth";
import { ProfileForm } from "@/components/ProfileForm";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    let user = null;
    try {
        user = await getAuthenticatedUser();
    } catch (e) {
        // Handle unauth or error
    }

    if (!user) {
        return <div className="p-8">Please log in.</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Account Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your profile details and security preferences.</p>
            </div>

            <ProfileForm user={user as any} />
        </div>
    );
}
