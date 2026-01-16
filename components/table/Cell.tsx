"use client";

import React from "react";
import { Settings2, Palette, ChevronDown, Image as ImageIcon, Plus, Check, X, Sparkles, Type, Trash2, ExternalLink, Link as LinkIcon, FileText, Cloud } from "lucide-react";
import { GoogleDrivePicker } from "@/components/GoogleDrivePicker";
import { useTableContext } from "@/lib/TableContext";
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
import { useTranslations } from "next-intl";

interface TableCellProps {
    cell: Cell;
    column: Column;
    rowId: string;
    onUpdate: (value: any) => void;
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
    const t = useTranslations('Cell');
    const { googleDriveConfig } = useTableContext();
    const col = column;

    // Helper to determine text color
    const getTextColor = (bgColor: string) => {
        if (!bgColor) return "inherit";
        const lower = bgColor.toLowerCase();
        // Check hardcoded lights
        if (["#f3f4f6", "#ffffff", "#f8fafc", "#f9fafb"].includes(lower)) return "#18181b";
        // Check known pastels from constants
        const isPastel = OPTION_COLORS.some(c => c.value.toLowerCase() === lower);
        if (isPastel) return "#18181b";

        return "#ffffff";
    };

    // --- Select Logic Helpers ---
    const addOptionToColumn = (label: string) => {
        const color = OPTION_COLORS[Math.floor(Math.random() * OPTION_COLORS.length)].text;
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
    };

    return (
        <div className="relative w-full h-full min-h-[46px] flex items-center">
            {/* TEXT TYPE */}
            {col.type === "text" && (
                <input
                    className="w-full h-full px-3 py-3 bg-transparent border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
                    value={cell?.value || ""}
                    onChange={(e) => onUpdate(e.target.value)}
                />
            )}

            {/* ... (select type skipped) ... */}

            {/* DATE TYPE */}
            {col.type === "date" && (
                <input
                    type="date"
                    className="w-full h-full px-3 py-3 bg-transparent border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none text-xs font-mono text-zinc-600 dark:text-zinc-200 dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    value={cell?.value || ""}
                    onChange={(e) => onUpdate(e.target.value)}
                />
            )}

            {/* PRICE TYPE */}
            {col.type === "price" && (
                <div className="relative w-full h-full group/price">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-medium">₺</span>
                    <input
                        type="number"
                        className="w-full h-full pl-7 pr-2 py-3 bg-transparent border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none text-xs font-mono text-zinc-700 dark:text-zinc-200"
                        placeholder="0.00"
                        value={cell?.value || ""}
                        onChange={(e) => onUpdate(e.target.value)}
                    />
                </div>
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
                                        style={{
                                            backgroundColor: selectedOption.color,
                                            borderColor: "transparent",
                                            color: getTextColor(selectedOption.color)
                                        }}
                                    >
                                        {selectedOption.label}
                                    </span>
                                ) : (
                                    <span className="text-zinc-400">{t('select')}</span>
                                )}
                                <ChevronDown className="w-3 h-3 text-zinc-300 opacity-0 group-hover/select:opacity-100 ml-auto" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[240px]" align="start">
                            <div className="p-2 border-b flex gap-1">
                                <Input
                                    placeholder={t('findOption')}
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
                                                                style={{ backgroundColor: c.text }}
                                                                onClick={() =>
                                                                    updateOptionInColumn(option.id, { color: c.text })
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
                                                        <h4 className="font-medium text-xs">{t('renameOption')}</h4>
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
                                    <div className="text-center text-xs text-zinc-400 py-4">{t('noOptions')}</div>
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
                                <h4 className="font-medium leading-none">{t('imageUrl')}</h4>
                                <p className="text-xs text-muted-foreground">
                                    {t('imageUrlDesc')}
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
                                    {t('save')}
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
                                                style={{
                                                    backgroundColor: opt.color,
                                                    borderColor: "transparent",
                                                    color: getTextColor(opt.color)
                                                }}
                                            >
                                                {opt.label}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-zinc-400">{t('select')}</span>
                                )}
                                <ChevronDown className="w-3 h-3 text-zinc-300 opacity-0 group-hover/select:opacity-100 ml-auto shrink-0" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[240px]" align="start">
                            <div className="p-2 border-b flex gap-1">
                                <Input
                                    placeholder={t('createOption')}
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
                                                                <button key={c.value} className="w-6 h-6 rounded-full border" style={{ backgroundColor: c.text }} onClick={() => updateOptionInColumn(option.id, { color: c.text })} />
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
                                {(!col.options || col.options.length === 0) && <div className="text-center text-xs text-zinc-400 py-4">{t('noOptions')}</div>}
                            </div>
                        </PopoverContent>
                    </Popover>
                );
            })()}

            {/* FILE TYPE */}
            {col.type === "file" && (() => {
                // Ensure value is an array of attachments
                // Migration for legacy single-object values
                const rawValue = cell?.value;
                const attachments: Array<{
                    id: string;
                    name: string;
                    url: string;
                    type: string;
                    addedAt: number;
                }> = Array.isArray(rawValue)
                        ? rawValue
                        : rawValue && typeof rawValue === 'object'
                            ? [{ ...rawValue, id: rawValue.id || generateId(), addedAt: Date.now() }]
                            : [];

                // Sort by addedAt just in case
                const sortedAttachments = [...attachments].sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));

                const addAttachment = (newAttachment: { name: string; url: string; type: string }) => {
                    const entry = {
                        id: generateId(),
                        ...newAttachment,
                        addedAt: Date.now(),
                    };
                    onUpdate([...attachments, entry]);
                };

                const deleteAttachment = (id: string) => {
                    onUpdate(attachments.filter(a => a.id !== id));
                };

                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="w-full h-full px-4 py-2 flex items-center hover:bg-black/5 dark:hover:bg-white/5 group/file text-left">
                                {sortedAttachments.length > 0 ? (
                                    <div className="flex items-center gap-2 text-xs w-full">
                                        {sortedAttachments.length === 1 ? (
                                            <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-100 dark:border-blue-800 max-w-full truncate">
                                                {sortedAttachments[0].type === 'link' ? <LinkIcon className="w-3 h-3 shrink-0" /> : <FileText className="w-3 h-3 shrink-0" />}
                                                <span className="truncate">{sortedAttachments[0].name || t('attachment')}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-100 dark:border-blue-800">
                                                <FileText className="w-3 h-3 shrink-0" />
                                                <span className="font-medium">{sortedAttachments.length}</span>
                                                <span className="opacity-70">{t('attachment')}s</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-zinc-300 text-xs flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> {t('add')}
                                    </span>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-80" align="start">
                            <div className="flex flex-col max-h-[400px]">
                                {/* Header */}
                                <div className="p-3 border-b bg-zinc-50 dark:bg-zinc-900">
                                    <h4 className="font-medium text-xs text-zinc-500 uppercase tracking-wider">{t('attachment')} ({attachments.length})</h4>
                                </div>

                                {/* List */}
                                <div className="flex-1 overflow-y-auto min-h-[100px] p-2 space-y-1">
                                    {sortedAttachments.length > 0 ? (
                                        sortedAttachments.map((file, index) => (
                                            <div key={file.id} className="group flex items-center gap-3 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm">
                                                <span className="text-zinc-400 font-mono text-xs w-5 shrink-0 text-right">{index + 1}.</span>

                                                <div className="p-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border text-zinc-500">
                                                    {file.type === 'link' ? <LinkIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate text-zinc-700 dark:text-zinc-200" title={file.name}>{file.name}</div>
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-500 hover:text-blue-600 hover:underline truncate block"
                                                    >
                                                        {file.url}
                                                    </a>
                                                </div>

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteAttachment(file.id);
                                                        }}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-zinc-400 text-xs">
                                            {t('noOptions')}
                                        </div>
                                    )}
                                </div>

                                {/* Add New Section */}
                                <div className="p-3 border-t bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-500">{t('add')}</label>

                                        {/* File Upload */}


                                        {/* Link Input */}
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="https://..."
                                                className="h-8 text-xs bg-white dark:bg-black"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = e.currentTarget.value;
                                                        if (val) {
                                                            addAttachment({ name: val, url: val, type: 'link' });
                                                            e.currentTarget.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <Button
                                                size="sm"
                                                className="h-8 w-8 px-0 shrink-0"
                                                onClick={(e) => {
                                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                    if (input.value) {
                                                        addAttachment({ name: input.value, url: input.value, type: 'link' });
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="relative py-1">
                                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-50 dark:bg-zinc-900 px-2 text-muted-foreground">{t('or')}</span></div>
                                        </div>

                                        <GoogleDrivePicker
                                            config={googleDriveConfig}
                                            onSelect={(files) => {
                                                files.forEach(f => addAttachment({ name: f.name, url: f.embedUrl || f.url, type: 'drive' }));
                                            }}>
                                            <Button variant="outline" className="w-full h-8 flex gap-2 items-center justify-center text-xs">
                                                <Cloud className="w-4 h-4" />
                                                {t('drive')}
                                            </Button>
                                        </GoogleDrivePicker>
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                );
            })()}

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
                                className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs font-bold"
                                onClick={() => onUpdate("")}
                            >
                                {t('clear')}
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            )}

        </div>
    );
}
