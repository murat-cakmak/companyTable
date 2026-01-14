"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { switchAdminCompany, logout } from "@/app/actions/auth";
import type { User, Company } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
    ChevronsUpDown,
    Check,
    Bell,
    AlertTriangle,
    ShieldAlert
} from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface AppHeaderProps {
    currentUser?: User & { company?: Company };
    allCompanies?: { id: string; name: string; subscriptionEndDate?: Date | null }[];
}

export function AppHeader({ currentUser, allCompanies = [] }: AppHeaderProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    const handleCompanySwitch = async (companyId: string) => {
        await switchAdminCompany(companyId);
        window.location.reload();
    };

    const handleLogout = async () => {
        await logout();
    };

    const links = [
        { href: "/", label: "Editor" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/users", label: "Team" },
    ];

    if (isSuperAdmin) {
        links.push({ href: "/campaigns", label: "Campaigns" });
    }

    // Notification Logic
    const notifications: any[] = [];

    // 1. Password Security
    if (currentUser?.mustChangePassword) {
        notifications.push({
            id: 'pass-security',
            title: 'Security Alert',
            description: 'You are using a temporary password. Update it now.',
            type: 'critical',
            href: '/profile',
            icon: ShieldAlert
        });
    }

    // 2. Subscription Expiry Logic
    const checkSubscription = (name: string, date: Date | null) => {
        if (!date) return null;

        const expiry = new Date(date);
        const now = new Date();
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Subject handling
        const subject = isSuperAdmin ? `${name} plan` : "Your plan";

        if (diffDays <= 14 && diffDays > 0) {
            return {
                id: `sub-exp-${name}`,
                title: 'Subscription Expiring',
                description: `${subject} expires in ${diffDays} days.`,
                type: 'warning',
                href: '/campaigns', // Super admin goes to campaigns
                icon: AlertTriangle
            };
        } else if (diffDays <= 0) {
            return {
                id: `sub-ended-${name}`,
                title: 'Subscription Expired',
                description: `${subject} has expired.`,
                type: 'critical',
                href: '/campaigns',
                icon: AlertTriangle
            };
        }
        return null;
    };

    if (isSuperAdmin && allCompanies.length > 0) {
        // Check ALL companies for Super Admin
        allCompanies.forEach(comp => {
            const notif = checkSubscription(comp.name, comp.subscriptionEndDate || null);
            if (notif) notifications.push(notif);
        });
    } else {
        // Check specific company for regular admin
        if (currentUser?.company) {
            const notif = checkSubscription(currentUser.company.name, currentUser.company.subscriptionEndDate);
            if (notif) {
                // Regular users go to settings
                notif.href = '/settings';
                notifications.push(notif);
            }
        }
    }

    return (
        <header className="h-14 border-b bg-white dark:bg-zinc-900 flex items-center px-4 shrink-0 shadow-sm z-10 justify-between">
            <div className="flex items-center gap-6">

                {/* Brand / Company Switcher */}
                {isSuperAdmin && mounted ? (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" role="combobox" aria-expanded={open} className="p-0 hover:bg-transparent h-auto font-semibold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                                    <span className="font-bold text-xs">{currentUser?.company?.name?.substring(0, 2).toUpperCase() || "CO"}</span>
                                </span>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="font-medium">{currentUser?.company?.name || "Select Company"}</span>
                                    <span className="text-[10px] text-zinc-500 font-normal">Switch Workspace</span>
                                </div>
                                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput placeholder="Search company..." />
                                <CommandList>
                                    <CommandEmpty>No company found.</CommandEmpty>
                                    <CommandGroup>
                                        {allCompanies.map((company) => (
                                            <CommandItem
                                                key={company.id}
                                                value={company.name}
                                                onSelect={() => {
                                                    handleCompanySwitch(company.id);
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        currentUser?.companyId === company.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {company.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                            <span className="font-bold text-xs">{currentUser?.company?.name?.substring(0, 2).toUpperCase() || "CO"}</span>
                        </span>
                        <div className="flex flex-col leading-none">
                            <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{currentUser?.company?.name || "Company Data"}</span>
                            <span className="text-[10px] text-zinc-500">Workspace</span>
                        </div>
                        {isSuperAdmin && <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />}
                    </div>
                )}

                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2 hidden md:block"></div>

                <nav className="hidden md:flex items-center gap-1">
                    {links.map(link => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                    isActive ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : "text-zinc-500 dark:text-zinc-400"
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:text-zinc-900 w-9 h-9">
                            <Bell className="w-5 h-5" />
                            {notifications.length > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-zinc-900">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[340px] p-0 shadow-lg border-zinc-200 dark:border-zinc-800">
                        <div className="p-3 border-b bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                            <span className="font-semibold text-sm">Notifications</span>
                            <span className="text-xs text-zinc-500">{notifications.length} New</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-1">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm flex flex-col items-center gap-2">
                                    <Bell className="w-8 h-8 opacity-20" />
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((n, i) => (
                                    <Link key={i} href={n.href} className="flex items-start gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors group">
                                        <div className={cn("mt-1 p-1.5 rounded-full shrink-0",
                                            n.type === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                        )}>
                                            <n.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className={cn("text-sm font-semibold", n.type === 'critical' ? 'text-red-600' : 'text-zinc-900 dark:text-zinc-200')}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-1 leading-snug">
                                                {n.description}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-zinc-200 transition-all p-0" suppressHydrationWarning>
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name || "User"}`} alt={currentUser?.name || "User"} />
                                <AvatarFallback className="text-[10px]">{currentUser?.name?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{currentUser?.name || "User"}</p>
                                <p className="text-xs leading-none text-muted-foreground truncate">
                                    {currentUser?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="cursor-pointer w-full flex items-center justify-between">
                                Profile
                                {currentUser?.mustChangePassword && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                )}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="cursor-pointer w-full">Billing</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="cursor-pointer w-full">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 font-medium focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer" onSelect={handleLogout}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
