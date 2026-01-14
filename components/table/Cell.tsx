"use client";

import React from "react";
import { Settings2, Palette, ChevronDown, Image as ImageIcon, Plus, Check, X, Sparkles, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn, generateId } from "@/lib/utils";
import { Cell, Column, SelectOption } from "@/types/table";
import { COLORS, OPTION_COLORS } from "@/lib/constants";

interface TableCellProps {
    cell: Cell;
    column: Column;
    rowId: string;
    onUpdate: (value: string) => void;
    onColorChange: (color: string) => void;
    onColumnUpdate: (columnId: string, updates: Partial<Column>) => void;
}

export function TableCell({
    cell,
    column,
    rowId,
    onUpdate,
    onColorChange,
    onColumnUpdate,
}: TableCellProps) {
    const col = column;

    // --- Select Logic Helpers ---
    const addOptionToColumn = (label: string) => {
        const color = OPTION_COLORS[Math.floor(Math.random() * OPTION_COLORS.length)].value;
        const newOption: SelectOption = { id: generateId(), label, color };
        onColumnUpdate(col.id, { options: [...(col.options || []), newOption] });
    };

    const updateOptionInColumn = (optionId: string, updates: Partial<SelectOption>) => {
        const newOptions = col.options?.map((opt) =>
            opt.id === optionId ? { ...opt, ...updates } : opt
        ) || [];
        onColumnUpdate(col.id, { options: newOptions });
    };

    const deleteOptionFromColumn = (optionId: string) => {
        const newOptions = col.options?.filter((opt) => opt.id !== optionId);
        onColumnUpdate(col.id, { options: newOptions });
        // Note: Clearing the cell value if it matches the deleted option should be handled by parent if needed, 
        // but for now we focus on the column update. The parent might need to scan rows.
        // In the original code, we scanned rows. Here we can't easily. 
        // We'll leave it for now, or we can trigger a parent action.
    };

    return (
        <div className="relative w-full h-full min-h-[46px] flex items-center">
            {/* TEXT TYPE */}
            {col.type === "text" && (
                <input
                    className="w-full h-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
                    value={cell?.value || ""}
                    onChange={(e) => onUpdate(e.target.value)}
                />
            )}

            {/* SELECT TYPE - RICH OPTIONS */}
            {col.type === "select" && (() => {
                const selectedOption = col.options?.find((o) => o.id === cell?.value);
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="w-full h-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between group/select relative">
                                {selectedOption ? (
                                    <span
                                        className="px-2 py-1 rounded-md text-xs font-medium border"
                                        style={{ backgroundColor: selectedOption.color, borderColor: "transparent" }}
                                    >
                                        {selectedOption.label}
                                    </span>
                                ) : (
                                    <span className="text-zinc-400">Select...</span>
                                )}
                                <ChevronDown className="w-3 h-3 text-zinc-300 opacity-0 group-hover/select:opacity-100 ml-auto" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[240px]" align="start">
                            <div className="p-2 border-b flex gap-1">
                                <Input
                                    placeholder="Find or create option..."
                                    className="h-8 text-xs flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.stopPropagation();
                                            if (e.currentTarget.value) {
                                                addOptionToColumn(e.currentTarget.value);
                                                e.currentTarget.value = "";
                                            }
                                        }
                                    }}
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        if (input.value) {
                                            addOptionToColumn(input.value);
                                            input.value = "";
                                        }
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto p-1">
                                {col.options?.map((option) => (
                                    <div
                                        key={option.id}
                                        className="flex items-center gap-1 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 group/option"
                                    >
                                        {/* Selection Click Area */}
                                        <button
                                            className="flex-1 flex items-center gap-2 text-sm text-left px-2 py-1.5"
                                            onClick={() => onUpdate(option.id)}
                                        >
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: option.color }}
                                            />
                                            {option.label}
                                            {cell?.value === option.id && (
                                                <Check className="w-3 h-3 ml-auto text-zinc-400" />
                                            )}
                                        </button>

                                        {/* Edit Controls (Visible on Hover) */}
                                        <div className="flex items-center gap-1 pr-1 opacity-0 group-hover/option:opacity-100 transition-opacity">
                                            {/* Color Picker Popover */}
                                            <Popover modal={true}>
                                                <PopoverTrigger asChild>
                                                    <button className="p-1 hover:bg-zinc-200 rounded">
                                                        <Palette className="w-3 h-3 text-zinc-400" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-36 p-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {OPTION_COLORS.map((c) => (
                                                            <button
                                                                key={c.value}
                                                                className="w-6 h-6 rounded-full border"
                                                                style={{ backgroundColor: c.value }}
                                                                onClick={() =>
                                                                    updateOptionInColumn(option.id, { color: c.value })
                                                                }
                                                            />
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                            {/* Rename Input Popover */}
                                            <Popover modal={true}>
                                                <PopoverTrigger asChild>
                                                    <button className="p-1 hover:bg-zinc-200 rounded">
                                                        <Type className="w-3 h-3 text-zinc-400" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-48 p-2">
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium text-xs">Rename Option</h4>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                defaultValue={option.label}
                                                                className="h-8"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        updateOptionInColumn(option.id, {
                                                                            label: e.currentTarget.value,
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                            {/* Delete Button */}
                                            <button
                                                className="p-1 hover:bg-red-100 hover:text-red-500 rounded"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteOptionFromColumn(option.id);
                                                }}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!col.options || col.options.length === 0) && (
                                    <div className="text-center text-xs text-zinc-400 py-4">No options</div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                );
            })()}

            {/* IMAGE TYPE */}
            {col.type === "image" && (
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="w-full h-full px-4 py-2 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5">
                            {cell?.value ? (
                                <img
                                    src={cell.value}
                                    alt="Cell"
                                    className="h-8 w-auto rounded object-cover shadow-sm"
                                />
                            ) : (
                                <ImageIcon className="w-4 h-4 text-zinc-300" />
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-3 w-80">
                        <div className="grid gap-2">
                            <div className="space-y-1">
                                <h4 className="font-medium leading-none">Image URL</h4>
                                <p className="text-xs text-muted-foreground">
                                    Paste an image URL to display.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    defaultValue={cell?.value}
                                    placeholder="https://..."
                                    className="h-8"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            onUpdate(e.currentTarget.value);
                                        }
                                    }}
                                />
                                <Button
                                    size="sm"
                                    className="h-8"
                                    onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        onUpdate(input.value);
                                    }}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            {/* MULTI-SELECT TYPE */}
            {col.type === "multi-select" && (() => {
                const selectedIds = Array.isArray(cell?.value) ? cell.value : [];
                const selectedOptions = col.options?.filter(o => selectedIds.includes(o.id));

                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="w-full h-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 group/select relative overflow-hidden">
                                {selectedOptions && selectedOptions.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {selectedOptions.map(opt => (
                                            <span
                                                key={opt.id}
                                                className="px-1.5 py-0.5 rounded text-[10px] font-medium border whitespace-nowrap"
                                                style={{ backgroundColor: opt.color, borderColor: "transparent" }}
                                            >
                                                {opt.label}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-zinc-400">Select...</span>
                                )}
                                <ChevronDown className="w-3 h-3 text-zinc-300 opacity-0 group-hover/select:opacity-100 ml-auto shrink-0" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[240px]" align="start">
                            <div className="p-2 border-b flex gap-1">
                                <Input
                                    placeholder="Create option..."
                                    className="h-8 text-xs flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.stopPropagation();
                                            if (e.currentTarget.value) {
                                                addOptionToColumn(e.currentTarget.value);
                                                e.currentTarget.value = "";
                                            }
                                        }
                                    }}
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        if (input.value) {
                                            addOptionToColumn(input.value);
                                            input.value = "";
                                        }
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto p-1">
                                {col.options?.map((option) => {
                                    const isSelected = selectedIds.includes(option.id);
                                    return (
                                        <div key={option.id} className="flex items-center gap-1 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 group/option">
                                            <button
                                                className="flex-1 flex items-center gap-2 text-sm text-left px-2 py-1.5"
                                                onClick={() => {
                                                    const newIds = isSelected
                                                        ? selectedIds.filter((id: string) => id !== option.id)
                                                        : [...selectedIds, option.id];
                                                    onUpdate(newIds);
                                                }}
                                            >
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
                                                {option.label}
                                                {isSelected && <Check className="w-3 h-3 ml-auto text-zinc-400" />}
                                            </button>
                                            <div className="flex items-center gap-1 pr-1 opacity-0 group-hover/option:opacity-100 transition-opacity">
                                                <Popover modal={true}>
                                                    <PopoverTrigger asChild>
                                                        <button className="p-1 hover:bg-zinc-200 rounded"><Palette className="w-3 h-3 text-zinc-400" /></button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-36 p-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {OPTION_COLORS.map(c => (
                                                                <button key={c.value} className="w-6 h-6 rounded-full border" style={{ backgroundColor: c.value }} onClick={() => updateOptionInColumn(option.id, { color: c.value })} />
                                                            ))}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                <button className="p-1 hover:bg-red-100 hover:text-red-500 rounded" onClick={(e) => { e.stopPropagation(); deleteOptionFromColumn(option.id); }}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!col.options || col.options.length === 0) && <div className="text-center text-xs text-zinc-400 py-4">No options</div>}
                            </div>
                        </PopoverContent>
                    </Popover>
                );
            })()}

            {/* FILE TYPE */}
            {col.type === "file" && (
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="w-full h-full px-4 py-2 flex items-center hover:bg-black/5 dark:hover:bg-white/5 group/file">
                            {cell?.value ? (
                                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 max-w-full truncate">
                                    <span className="truncate">{cell.value.name || "Attachment"}</span>
                                </div>
                            ) : (
                                <span className="text-zinc-300 text-xs flex items-center gap-1"><Plus className="w-3 h-3" /> Add</span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-3 w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Attachment</h4>
                                <p className="text-xs text-muted-foreground">Upload a file or enter a URL.</p>
                            </div>
                            <div className="grid gap-2">
                                <Input
                                    type="file"
                                    className="text-xs"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            // Mock upload by storing name and fake URL
                                            onUpdate({ name: file.name, url: URL.createObjectURL(file), type: file.type });
                                        }
                                    }}
                                />
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <Input placeholder="https://..." className="h-8" onChange={(e) => {
                                        // Store as generic link
                                        // We need to commit on Enter or blur preferably, but for now onChange to simplified 'onUpdate' might be too jittery if we store object.
                                        // Let's use a local state or just Ref for the inputs?
                                        // For simplicity in this Controlled Component, we might need a dedicated Save button if we want to type a URL.
                                    }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = e.currentTarget.value;
                                                if (val) onUpdate({ name: val, url: val, type: 'link' });
                                            }
                                        }}
                                    />
                                    <Button size="sm" className="h-8" onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        if (input.value) onUpdate({ name: input.value, url: input.value, type: 'link' });
                                    }}>Add</Button>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            {/* ICON TYPE */}
            {col.type === "icon" && (
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="w-full h-full px-4 py-2 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5">
                            {cell?.value === "check" && (
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                    <span className="text-xs">✓</span>
                                </div>
                            )}
                            {cell?.value === "alert" && (
                                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    <span className="text-xs">!</span>
                                </div>
                            )}
                            {cell?.value === "star" && (
                                <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                                    <span className="text-xs">★</span>
                                </div>
                            )}
                            {!cell?.value && <Sparkles className="w-4 h-4 text-zinc-300" />}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2">
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-green-600"
                                onClick={() => onUpdate("check")}
                            >
                                ✓
                            </button>
                            <button
                                className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-red-600"
                                onClick={() => onUpdate("alert")}
                            >
                                !
                            </button>
                            <button
                                className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-yellow-600"
                                onClick={() => onUpdate("star")}
                            >
                                ★
                            </button>
                            <button
                                className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-400"
                                onClick={() => onUpdate("")}
                            >
                                CLR
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            {/* Cell Settings Button */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 backdrop-blur-sm shadow-sm"
                    >
                        <Settings2 className="w-3 h-3 text-zinc-500" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2" align="start">
                    <div className="grid grid-cols-5 gap-1">
                        {COLORS.map((color) => (
                            <button
                                key={color}
                                className="w-6 h-6 rounded-full border border-zinc-200 cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => onColorChange(color)}
                            />
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
