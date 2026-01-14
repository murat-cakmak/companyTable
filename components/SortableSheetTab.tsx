"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Sheet } from "@/types/table";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { OPTION_COLORS } from "@/lib/constants";

interface SortableSheetTabProps {
    sheet: Sheet;
    isActive: boolean;
    isEditing: boolean;
    onActivate: (id: string) => void;
    onEditStart: (id: string) => void;
    onRename: (id: string, newName: string) => void;
    onColorChange: (id: string, color: string) => void;
}

export function SortableSheetTab({
    sheet,
    isActive,
    isEditing,
    onActivate,
    onEditStart,
    onRename,
    onColorChange,
}: SortableSheetTabProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: sheet.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isEditing) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                suppressHydrationWarning
                className="h-full relative font-mono text-sm"
            >
                <input
                    autoFocus
                    className="px-4 py-2 text-sm font-medium border-none outline-none bg-white dark:bg-zinc-950 min-w-[120px] text-center h-full ring-2 ring-indigo-500/20 z-20 relative"
                    defaultValue={sheet.name}
                    onBlur={(e) => onRename(sheet.id, e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter")
                            onRename(sheet.id, e.currentTarget.value);
                    }}
                    // Prevent drag when editing
                    onPointerDown={(e) => e.stopPropagation()}
                />
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            suppressHydrationWarning
            onClick={() => onActivate(sheet.id)}
            onDoubleClick={() => onEditStart(sheet.id)}
            className={cn(
                "group relative px-4 py-2 text-sm font-medium transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-[120px] h-full flex items-center justify-center cursor-pointer select-none border-r border-zinc-200 dark:border-zinc-800",
                isActive
                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-t-2 -mt-px z-10"
                    : "text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50"
            )}
        >
            {/* Active Tab Colored Top Border */}
            {isActive && (
                <div
                    className="absolute top-[-2px] left-0 right-0 h-[2px]"
                    style={{ backgroundColor: sheet.color || "#4f46e5" }} // Default indigo-600
                />
            )}

            <div className="flex items-center gap-2">
                {/* Color Indicator / Picker Trigger */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className={cn(
                                "w-2 h-2 rounded-full transition-all hover:scale-125 focus:outline-none",
                                !sheet.color && "opacity-0 group-hover:opacity-100 bg-zinc-300 dark:bg-zinc-600",
                                sheet.color && "opacity-100"
                            )}
                            style={{ backgroundColor: sheet.color }}
                            onClick={(e) => e.stopPropagation()} // Prevent activating tab when clicking color
                        />
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2" align="start">
                        <div className="grid grid-cols-5 gap-1">
                            <button
                                className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 bg-transparent flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onColorChange(sheet.id, ""); // Reset
                                }}
                                title="No Color"
                            >
                                <span className="w-4 h-[1px] bg-zinc-400 rotate-45 transform" />
                            </button>
                            {OPTION_COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: c.text }} // Use the vibrant text color for the dot
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onColorChange(sheet.id, c.text);
                                    }}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                <span>{sheet.name}</span>
            </div>
        </div>
    );
}
