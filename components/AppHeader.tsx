"use client";

import React from "react";
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
import { switchAdminCompany } from "@/app/actions/auth";
import type { User, Company } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
    ChevronsUpDown,
    Check
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
import { useState, useEffect } from "react";

interface AppHeaderProps {
    currentUser?: User & { company?: Company };
    allCompanies?: { id: string; name: string }[];
}

export function AppHeader({ currentUser, allCompanies = [] }: AppHeaderProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Fix hydration mismatch by only rendering complex interactive components on client
    useEffect(() => {
        setMounted(true);
    }, []);

    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    const handleCompanySwitch = async (companyId: string) => {
        await switchAdminCompany(companyId);
        window.location.reload();
    };

    const links = [
        { href: "/", label: "Editor" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/users", label: "Team" },
        { href: "/campaigns", label: "Campaigns" },
    ];

    // Filter links based on role if needed (e.g. Campaigns only for SUPER_ADMIN/Company Admin)

    return (
        <header className="h-10 border-b bg-white dark:bg-zinc-900 flex items-center px-4 shrink-0 shadow-sm z-10 justify-between">
            <div className="flex items-center gap-6">

                {/* Brand / Company Switcher */}
                {isSuperAdmin && mounted ? (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" role="combobox" aria-expanded={open} className="p-0 hover:bg-transparent h-auto font-semibold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                {currentUser?.company?.name || "Select Company"}
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
                    <div className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        {currentUser?.company?.name || "Company Data"}
                        {isSuperAdmin && <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />}
                    </div>
                )}

                <nav className="flex items-center gap-4">
                    {links.map(link => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-xs font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400",
                                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full" suppressHydrationWarning>
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name || "User"}`} alt={currentUser?.name || "User"} />
                                <AvatarFallback className="text-[10px]">{currentUser?.name?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{currentUser?.name || "User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
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
                        <DropdownMenuItem className="text-red-500 font-medium">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
