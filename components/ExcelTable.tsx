"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, GripHorizontal, Settings2, Palette, ChevronDown, Image as ImageIcon, Type, List, Sparkles, X, Check } from "lucide-react";
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
    CommandSeparator,
} from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Helper for generating unique IDs (fallback for crypto.randomUUID)
const generateId = () => Math.random().toString(36).substring(2, 9);

// Types
export type CellStyle = {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
};

export type Cell = {
    id: string;
    value: string;
    style?: CellStyle;
};

export type ColumnType = "text" | "select" | "image" | "icon";

export type SelectOption = {
    id: string;
    label: string;
    color: string;
};

export type Column = {
    id: string;
    header: string;
    type: ColumnType;
    options?: SelectOption[]; // Expanded for rich options
    width?: number;
    style?: CellStyle;
};

type Row = {
    id: string;
    cells: Record<string, Cell>; // Keyed by column ID
    style?: CellStyle;
};

const INITIAL_COLUMNS: Column[] = [
    { id: "col-1", header: "Column A", type: "text" },
    { id: "col-2", header: "Column B", type: "text" },
    { id: "col-3", header: "Column C", type: "text" },
];

const INITIAL_ROWS: Row[] = [
    {
        id: "row-1",
        cells: {
            "col-1": { id: "cell-1-1", value: "Data A1" },
            "col-2": { id: "cell-1-2", value: "Data B1" },
            "col-3": { id: "cell-1-3", value: "Data C1" },
        },
    },
    {
        id: "row-2",
        cells: {
            "col-1": { id: "cell-2-1", value: "Data A2" },
            "col-2": { id: "cell-2-2", value: "Data B2" },
            "col-3": { id: "cell-2-3", value: "Data C2" },
        },
    },
];

const COLORS = [
    "#ffffff", // White
    "#f8fafc", // Slate 50
    "#f1f5f9", // Slate 100
    "#e2e8f0", // Slate 200
    "#fee2e2", // Red 100
    "#ffedd5", // Orange 100
    "#fef9c3", // Yellow 100
    "#dcfce7", // Green 100
    "#dbeafe", // Blue 100
    "#e0e7ff", // Indigo 100
    "#f3e8ff", // Purple 100
    "#fae8ff", // Fuchsia 100
    "#ffe4e6", // Rose 100
];

const OPTION_COLORS = [
    { label: "Red", value: "#fee2e2", text: "#ef4444" },
    { label: "Orange", value: "#ffedd5", text: "#f97316" },
    { label: "Amber", value: "#fef3c7", text: "#f59e0b" },
    { label: "Yellow", value: "#fef9c3", text: "#eab308" },
    { label: "Lime", value: "#ecfccb", text: "#84cc16" },
    { label: "Green", value: "#dcfce7", text: "#22c55e" },
    { label: "Emerald", value: "#d1fae5", text: "#10b981" },
    { label: "Teal", value: "#ccfbf1", text: "#14b8a6" },
    { label: "Cyan", value: "#cffafe", text: "#06b6d4" },
    { label: "Sky", value: "#e0f2fe", text: "#0ea5e9" },
    { label: "Blue", value: "#dbeafe", text: "#3b82f6" },
    { label: "Indigo", value: "#e0e7ff", text: "#6366f1" },
    { label: "Violet", value: "#ede9fe", text: "#8b5cf6" },
    { label: "Purple", value: "#f3e8ff", text: "#a855f7" },
    { label: "Fuchsia", value: "#fae8ff", text: "#d946ef" },
    { label: "Pink", value: "#fce7f3", text: "#ec4899" },
    { label: "Rose", value: "#ffe4e6", text: "#f43f5e" },
    { label: "Slate", value: "#f1f5f9", text: "#64748b" },
    { label: "Gray", value: "#e5e7eb", text: "#4b5563" },
    { label: "Zinc", value: "#e4e4e7", text: "#52525b" },
    { label: "Neutral", value: "#e5e5e5", text: "#525252" },
    { label: "Stone", value: "#e7e5e4", text: "#57534e" },
];

export function ExcelTable() {
    // Types
    type Sheet = {
        id: string;
        name: string;
        columns: Column[];
        rows: Row[];
    };

    const [sheets, setSheets] = useState<Sheet[]>([
        {
            id: "sheet-1",
            name: "Sheet 1",
            columns: INITIAL_COLUMNS,
            rows: INITIAL_ROWS,
        },
    ]);
    const [activeSheetId, setActiveSheetId] = useState<string>("sheet-1");
    const [editingSheetId, setEditingSheetId] = useState<string | null>(null);

    const activeSheet = sheets.find((s) => s.id === activeSheetId)!;
    const { columns, rows } = activeSheet;

    const updateActiveSheet = (updates: Partial<Sheet>) => {
        setSheets((prev) =>
            prev.map((sheet) =>
                sheet.id === activeSheetId ? { ...sheet, ...updates } : sheet
            )
        );
    };

    // --- Actions ---

    const addSheet = () => {
        const newId = `sheet-${generateId()}`;
        const newSheet: Sheet = {
            id: newId,
            name: `Sheet ${sheets.length + 1}`,
            columns: INITIAL_COLUMNS,
            rows: [],
        };
        setSheets([...sheets, newSheet]);
        setActiveSheetId(newId);
    };

    const addColumn = (type: ColumnType = "text") => {
        const newColId = `col-${generateId()}`;

        let initialOptions: SelectOption[] | undefined;
        if (type === "select") {
            initialOptions = [
                { id: generateId(), label: "Done", color: "#dcfce7" },
                { id: generateId(), label: "In Progress", color: "#ffedd5" },
                { id: generateId(), label: "To Do", color: "#f1f5f9" },
            ];
        }

        const newColumn: Column = {
            id: newColId,
            header: `Column ${columns.length + 1}`,
            type,
            options: initialOptions,
        };

        const newColumns = [...columns, newColumn];
        const newRows = rows.map((row) => ({
            ...row,
            cells: {
                ...row.cells,
                [newColId]: { id: `cell-${row.id}-${newColId}`, value: "" },
            },
        }));

        updateActiveSheet({ columns: newColumns, rows: newRows });
    };

    const addRow = () => {
        const newRowId = `row-${generateId()}`;
        const newCells: Record<string, Cell> = {};

        columns.forEach((col) => {
            newCells[col.id] = {
                id: `cell-${newRowId}-${col.id}`,
                value: "",
                style: col.style,
            };
        });

        const newRow: Row = {
            id: newRowId,
            cells: newCells,
        };

        updateActiveSheet({ rows: [...rows, newRow] });
    };

    const updateCell = (rowId: string, colId: string, value: string) => {
        const newRows = rows.map((row) => {
            if (row.id !== rowId) return row;
            return {
                ...row,
                cells: {
                    ...row.cells,
                    [colId]: { ...row.cells[colId], value },
                },
            };
        });
        updateActiveSheet({ rows: newRows });
    };

    const updateHeader = (colId: string, value: string) => {
        const newColumns = columns.map((col) =>
            col.id === colId ? { ...col, header: value } : col
        );
        updateActiveSheet({ columns: newColumns });
    };

    const deleteColumn = (colId: string) => {
        const newColumns = columns.filter((col) => col.id !== colId);
        const newRows = rows.map((row) => {
            const newCells = { ...row.cells };
            delete newCells[colId];
            return { ...row, cells: newCells };
        });
        updateActiveSheet({ columns: newColumns, rows: newRows });
    };

    const deleteRow = (rowId: string) => {
        const newRows = rows.filter((row) => row.id !== rowId);
        updateActiveSheet({ rows: newRows });
    };

    const setCellColor = (rowId: string, colId: string, color: string) => {
        const newRows = rows.map((row) => {
            if (row.id !== rowId) return row;
            const cell = row.cells[colId];
            return {
                ...row,
                cells: {
                    ...row.cells,
                    [colId]: {
                        ...cell,
                        style: { ...cell.style, backgroundColor: color },
                    },
                },
            };
        });
        updateActiveSheet({ rows: newRows });
    };

    const setColumnColor = (colId: string, color: string) => {
        const newColumns = columns.map((col) =>
            col.id === colId
                ? { ...col, style: { ...col.style, backgroundColor: color } }
                : col
        );

        const newRows = rows.map((row) => {
            const cell = row.cells[colId];
            return {
                ...row,
                cells: {
                    ...row.cells,
                    [colId]: {
                        ...cell,
                        style: { ...cell.style, backgroundColor: color },
                    },
                },
            };
        });

        updateActiveSheet({ columns: newColumns, rows: newRows });
    };

    const updateSheetName = (sheetId: string, newName: string) => {
        setSheets((prev) =>
            prev.map((sheet) =>
                sheet.id === sheetId ? { ...sheet, name: newName } : sheet
            )
        );
        setEditingSheetId(null);
    };

    // --- Select Option Logic ---
    const addOptionToColumn = (colId: string, label: string) => {
        const color = OPTION_COLORS[Math.floor(Math.random() * OPTION_COLORS.length)].value;
        const newOption: SelectOption = { id: generateId(), label, color };

        const newColumns = columns.map(c =>
            c.id === colId
                ? { ...c, options: [...(c.options || []), newOption] }
                : c
        );
        updateActiveSheet({ columns: newColumns });
    };

    const updateOptionInColumn = (colId: string, optionId: string, updates: Partial<SelectOption>) => {
        const newColumns = columns.map(c => {
            if (c.id !== colId) return c;
            const newOptions = c.options?.map(opt =>
                opt.id === optionId ? { ...opt, ...updates } : opt
            ) || [];
            return { ...c, options: newOptions };
        });
        updateActiveSheet({ columns: newColumns });
    };

    const deleteOptionFromColumn = (colId: string, optionId: string) => {
        const newColumns = columns.map(c => {
            if (c.id !== colId) return c;
            return { ...c, options: c.options?.filter(opt => opt.id !== optionId) };
        });
        // Also clear cells that had this value
        const newRows = rows.map(r => {
            if (r.cells[colId]?.value === optionId) {
                return {
                    ...r,
                    cells: { ...r.cells, [colId]: { ...r.cells[colId], value: "" } }
                };
            }
            return r;
        });

        updateActiveSheet({ columns: newColumns, rows: newRows });
    };

    // --- Render ---

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] w-full gap-4 pb-14">
            <div className="flex items-center gap-2">
                <Button onClick={addRow} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Row
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Plus className="w-4 h-4" /> Add Column
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" align="start">
                        <div className="grid gap-2">
                            <div className="font-medium text-sm text-muted-foreground px-2">Column Type</div>
                            <Button
                                variant="ghost"
                                className="justify-start gap-2 h-9"
                                onClick={() => addColumn("text")}
                            >
                                <Type className="w-4 h-4" /> Text
                            </Button>
                            <Button
                                variant="ghost"
                                className="justify-start gap-2 h-9"
                                onClick={() => addColumn("select")}
                            >
                                <List className="w-4 h-4" /> Dropdown
                            </Button>
                            <Button
                                variant="ghost"
                                className="justify-start gap-2 h-9"
                                onClick={() => addColumn("image")}
                            >
                                <ImageIcon className="w-4 h-4" /> Image
                            </Button>
                            <Button
                                variant="ghost"
                                className="justify-start gap-2 h-9"
                                onClick={() => addColumn("icon")}
                            >
                                <Sparkles className="w-4 h-4" /> Icon
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-zinc-950 flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-900 border-b sticky top-0 z-20">
                            <tr>
                                <th className="px-4 py-3 w-12 text-center text-zinc-400 font-medium bg-zinc-50 dark:bg-zinc-900">
                                    #
                                </th>
                                {columns.map((col) => (
                                    <th
                                        key={col.id}
                                        className="px-4 py-2 min-w-[150px] border-r last:border-r-0 group relative bg-zinc-50 dark:bg-zinc-900"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <input
                                                className="bg-transparent border-none focus:ring-0 p-0 w-full font-semibold text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400"
                                                value={col.header}
                                                onChange={(e) => updateHeader(col.id, e.target.value)}
                                            />
                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                        >
                                                            <Palette className="w-3 h-3 text-zinc-400" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-40 p-2" align="start">
                                                        <div className="grid grid-cols-5 gap-1">
                                                            {COLORS.map((color) => (
                                                                <button
                                                                    key={color}
                                                                    className="w-6 h-6 rounded-full border border-zinc-200 cursor-pointer hover:scale-110 transition-transform"
                                                                    style={{ backgroundColor: color }}
                                                                    onClick={() => setColumnColor(col.id, color)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => deleteColumn(col.id)}
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-400" />
                                                </Button>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th className="w-10 bg-zinc-50 dark:bg-zinc-900"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr
                                    key={row.id}
                                    className="bg-white dark:bg-zinc-950 border-b hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-center text-zinc-400 font-mono text-xs border-r bg-zinc-50/30 sticky left-0 z-10">
                                        {index + 1}
                                    </td>
                                    {columns.map((col) => {
                                        const cell = row.cells[col.id];
                                        return (
                                            <td
                                                key={`${row.id}-${col.id}`}
                                                className="p-0 border-r last:border-r-0 relative group"
                                                style={{
                                                    backgroundColor: cell?.style?.backgroundColor,
                                                }}
                                            >
                                                <div className="relative w-full h-full min-h-[46px] flex items-center">
                                                    {/* TEXT TYPE */}
                                                    {col.type === "text" && (
                                                        <input
                                                            className="w-full h-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
                                                            value={cell?.value || ""}
                                                            onChange={(e) =>
                                                                updateCell(row.id, col.id, e.target.value)
                                                            }
                                                        />
                                                    )}

                                                    {/* SELECT TYPE - RICH OPTIONS */}
                                                    {col.type === "select" && (() => {
                                                        const selectedOption = col.options?.find(o => o.id === cell?.value);
                                                        return (
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <button className="w-full h-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between group/select relative">
                                                                        {selectedOption ? (
                                                                            <span className="px-2 py-1 rounded-md text-xs font-medium border" style={{ backgroundColor: selectedOption.color, borderColor: "transparent" }}>
                                                                                {selectedOption.label}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-zinc-400">Select...</span>
                                                                        )}
                                                                        <ChevronDown className="w-3 h-3 text-zinc-300 opacity-0 group-hover/select:opacity-100 ml-auto" />
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="p-0 w-[240px]" align="start">
                                                                    <div className="p-2 border-b">
                                                                        <div className="p-2 border-b flex gap-1">
                                                                            <Input
                                                                                placeholder="Find or create option..."
                                                                                className="h-8 text-xs flex-1"
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === "Enter") {
                                                                                        e.stopPropagation();
                                                                                        if (e.currentTarget.value) {
                                                                                            addOptionToColumn(col.id, e.currentTarget.value);
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
                                                                                        addOptionToColumn(col.id, input.value);
                                                                                        input.value = "";
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <Plus className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="max-h-[200px] overflow-y-auto p-1">
                                                                        {col.options?.map((option) => (
                                                                            <div key={option.id} className="flex items-center gap-1 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 group/option">
                                                                                {/* Selection Click Area */}
                                                                                <button
                                                                                    className="flex-1 flex items-center gap-2 text-sm text-left px-2 py-1.5"
                                                                                    onClick={() => updateCell(row.id, col.id, option.id)}
                                                                                >
                                                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
                                                                                    {option.label}
                                                                                    {cell?.value === option.id && <Check className="w-3 h-3 ml-auto text-zinc-400" />}
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
                                                                                                {OPTION_COLORS.map(c => (
                                                                                                    <button
                                                                                                        key={c.value}
                                                                                                        className="w-6 h-6 rounded-full border"
                                                                                                        style={{ backgroundColor: c.value }}
                                                                                                        onClick={() => updateOptionInColumn(col.id, option.id, { color: c.value })}
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
                                                                                                                updateOptionInColumn(col.id, option.id, { label: e.currentTarget.value });
                                                                                                                // Close popover logic would go here ideally
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
                                                                                            deleteOptionFromColumn(col.id, option.id);
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
                                                                                    updateCell(row.id, col.id, e.currentTarget.value);
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Button size="sm" className="h-8" onClick={(e) => {
                                                                            // Trigger update via sibling input (hacky but works for demo) or controlled state
                                                                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                                            updateCell(row.id, col.id, input.value);
                                                                        }}>Save</Button>
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
                                                                    {/* Simple icon renderer map for demo purposes */}
                                                                    {cell?.value === "check" && <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><span className="text-xs">✓</span></div>}
                                                                    {cell?.value === "alert" && <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><span className="text-xs">!</span></div>}
                                                                    {cell?.value === "star" && <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center"><span className="text-xs">★</span></div>}
                                                                    {!cell?.value && <Sparkles className="w-4 h-4 text-zinc-300" />}
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-40 p-2">
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <button
                                                                        className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-green-600"
                                                                        onClick={() => updateCell(row.id, col.id, "check")}
                                                                    >✓</button>
                                                                    <button
                                                                        className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-red-600"
                                                                        onClick={() => updateCell(row.id, col.id, "alert")}
                                                                    >!</button>
                                                                    <button
                                                                        className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-yellow-600"
                                                                        onClick={() => updateCell(row.id, col.id, "star")}
                                                                    >★</button>
                                                                    <button
                                                                        className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-400"
                                                                        onClick={() => updateCell(row.id, col.id, "")}
                                                                    >CLR</button>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    )}

                                                    {/* Cell Settings Button (kept absolute) */}
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
                                                        <PopoverContent
                                                            className="w-40 p-2"
                                                            align="start"
                                                        >
                                                            <div className="grid grid-cols-5 gap-1">
                                                                {COLORS.map((color) => (
                                                                    <button
                                                                        key={color}
                                                                        className="w-6 h-6 rounded-full border border-zinc-200 cursor-pointer hover:scale-110 transition-transform"
                                                                        style={{ backgroundColor: color }}
                                                                        onClick={() =>
                                                                            setCellColor(row.id, col.id, color)
                                                                        }
                                                                    />
                                                                ))}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </td>
                                        );
                                    })}
                                    <td className="px-2 text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => deleteRow(row.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {rows.length === 0 && (
                        <div className="p-8 text-center text-zinc-500">
                            No rows. Click "Add Row" to start.
                        </div>
                    )}
                </div>
            </div>

            {/* Sheets Bar */}
            <div className="fixed bottom-0 left-0 right-0 border-t divide-x overflow-x-auto bg-zinc-50 dark:bg-zinc-900 z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] h-12 flex items-center">
                {sheets.map((sheet) =>
                    editingSheetId === sheet.id ? (
                        <input
                            key={sheet.id}
                            autoFocus
                            className="px-4 py-2 text-sm font-medium border-none outline-none bg-white dark:bg-zinc-950 min-w-[100px] text-center h-full"
                            defaultValue={sheet.name}
                            onBlur={(e) => updateSheetName(sheet.id, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter")
                                    updateSheetName(sheet.id, e.currentTarget.value);
                            }}
                        />
                    ) : (
                        <button
                            key={sheet.id}
                            onClick={() => setActiveSheetId(sheet.id)}
                            onDoubleClick={() => setEditingSheetId(sheet.id)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-[100px] h-full flex items-center justify-center",
                                activeSheetId === sheet.id
                                    ? "bg-white dark:bg-zinc-950 text-indigo-600 border-t-2 border-t-indigo-600 -mt-px relative z-10"
                                    : "text-zinc-500"
                            )}
                        >
                            {sheet.name}
                        </button>
                    )
                )}
                <button
                    onClick={addSheet}
                    className="px-4 py-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 h-full flex items-center justify-center border-l"
                    title="Add Sheet"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
