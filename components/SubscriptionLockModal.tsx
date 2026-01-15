"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogPortal, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lock, CreditCard } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface SubscriptionLockModalProps {
    endDate: Date | string | null | undefined;
    role?: string;
}

export function SubscriptionLockModal({ endDate, role }: SubscriptionLockModalProps) {
    const t = useTranslations('Subscription');
    const [isLocked, setIsLocked] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Super admins are immune to lockout
        if (role === 'SUPER_ADMIN') {
            return;
        }

        if (!endDate) {
            // If no end date, one might assume free plan or error.
            // For now, let's assume if it is null, we don't lock (or it's infinite).
            return;
        }

        // If we are on the settings or profile page, we shouldn't block the user
        if (pathname === '/settings' || pathname === '/profile') {
            setIsLocked(false);
            return;
        }

        const end = new Date(endDate);
        const now = new Date();
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

        // Check if expired for more than 1 week
        if (now.getTime() - end.getTime() > oneWeekMs) {
            setIsLocked(true);
        } else {
            setIsLocked(false);
        }
    }, [endDate, pathname, role]);

    return (
        <Dialog open={isLocked} onOpenChange={() => { }} modal={false}>
            <DialogPortal>
                {/* Visual Backdrop - pointer-events-none allows clicking through to other elements */}
                <div className="fixed inset-0 z-50 bg-black/40 pointer-events-none" />

                <DialogPrimitive.Content
                    className={cn(
                        "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none sm:max-w-md",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    )}
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader className="flex flex-col items-center text-center">
                        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                            <Lock className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {t('suspendedTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-base pt-2 text-zinc-600 dark:text-zinc-400">
                            {t.rich('suspendedDesc', {
                                br: () => <br />
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 py-4">
                        {role === 'COMPANY_ADMIN' ? (
                            <>
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-sm text-amber-800 dark:text-amber-200 mb-2">
                                    <p className="font-medium">{t('actionRequired')}</p>
                                    <p>{t('adminActionDesc')}</p>
                                </div>

                                <Button asChild size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold">
                                    <Link href="/settings">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        {t('proceedPayment')}
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <div className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md p-4 text-sm text-zinc-600 dark:text-zinc-400 text-center">
                                <p className="font-medium mb-1 text-zinc-900 dark:text-zinc-100">{t('accessRestricted')}</p>
                                <p>{t('userRestrictedDesc')}</p>
                            </div>
                        )}
                    </div>
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
}
