"use client";

import React, { useState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function LoginForm() {
    const t = useTranslations('Auth');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await login(formData);

        if (result.success) {
            // Redirect happens via middleware or router
            window.location.href = "/";
        } else {
            setError(result.error || t('loginFailed'));
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-300" htmlFor="email">
                    {t('emailLabel')}
                </label>
                <div className="relative">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        placeholder={t('emailPlaceholder')}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-900 dark:text-zinc-300" htmlFor="password">
                        {t('passwordLabel')}
                    </label>
                    <div className="text-sm">
                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                            {t('forgotPassword')}
                        </a>
                    </div>
                </div>
                <div className="relative">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{t('loginFailed')}</h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
                        </div>
                    </div>
                </div>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('signIn')}
            </Button>

            <div className="text-center text-xs text-zinc-500">
                {t.rich('demoHint', {
                    b: (chunks) => <b>{chunks}</b>
                })}
                <br />
                {t('newAdminsHint')}
            </div>
        </form>
    );
}
