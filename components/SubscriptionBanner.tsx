"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

export function SubscriptionBanner({ endDate }: { endDate: Date | null | undefined }) {
    const t = useTranslations('Subscription');

    if (!endDate) return null;

    const isExpired = new Date(endDate) < new Date();

    if (!isExpired) return null;

    return (
        <div className="bg-red-600 text-white text-center py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2 shadow-md relative z-20 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
                {t('expiredBanner')}
            </span>
            <Link href="/settings" className="underline hover:text-red-100 ml-1 font-bold">
                {t('renewNow')}
            </Link>
        </div>
    );
}
