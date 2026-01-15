"use client";

import React, { useState } from "react";
import { Plus, Trash2, Palette, Type, List, Sparkles, Image as ImageIcon, Paperclip, CheckSquare, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn, generateId } from "@/lib/utils";
import { Column, Row, ColumnType, SelectOption, TableData } from "@/types/table";
import { TableCell } from "@/components/table/Cell";
import { COLORS, OPTION_COLORS } from "@/lib/constants";
import { useTranslations } from "next-intl";

interface SingleTableProps {
    tableData: TableData;
    onUpdate: (tableId: string, updates: Partial<TableData>) => void;
    onDelete?: (tableId: string) => void;
}

export function SingleTable({ tableData, onUpdate, onDelete }: SingleTableProps) {
    const t = useTranslations('TableDefaults');
    const { id: tableId, columns, rows } = tableData;

    // --- Actions ---

    const addColumn = (type: ColumnType = "text") => {
        const newColId = `col-${generateId()}`;

        let initialOptions: SelectOption[] | undefined;
        if (type === "select" || type === "multi-select") {
            initialOptions = [
                { id: generateId(), label: t('done'), color: "#dcfce7" },
                { id: generateId(), label: t('inProgress'), color: "#ffedd5" },
                { id: generateId(), label: t('toDo'), color: "#f1f5f9" },
            ];
        }

        const newColumn: Column = {
            id: newColId,
            header: t('columnTitle', { number: columns.length + 1 }),
            type,
            options: initialOptions,
        };

        const newColumns = [...columns, newColumn];
        const newRows = rows.map((row) => ({
            ...row,
            cells: {
                ...row.cells,
                [newColId]: { id: `cell-${row.id}-${newColId}`, value: type === "multi-select" ? [] : "" },
            },
        }));

        onUpdate(tableId, { columns: newColumns, rows: newRows });
    };

    const addRow = () => {
        const newRowId = `row-${generateId()}`;
        const newCells: Record<string, any> = {};

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

        onUpdate(tableId, { rows: [...rows, newRow] });
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
        onUpdate(tableId, { rows: newRows });
    };

    const updateColumn = (colId: string, updates: Partial<Column>) => {
        const newColumns = columns.map(c =>
            c.id === colId ? { ...c, ...updates } : c
        );
        onUpdate(tableId, { columns: newColumns });
    };

    const updateHeader = (colId: string, value: string) => {
        updateColumn(colId, { header: value });
    };

    const deleteColumn = (colId: string) => {
        const newColumns = columns.filter((col) => col.id !== colId);
        const newRows = rows.map((row) => {
            const newCells = { ...row.cells };
            delete newCells[colId];
            return { ...row, cells: newCells };
        });
        onUpdate(tableId, { columns: newColumns, rows: newRows });
    };

    const deleteRow = (rowId: string) => {
        const newRows = rows.filter((row) => row.id !== rowId);
        onUpdate(tableId, { rows: newRows });
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
        onUpdate(tableId, { rows: newRows });
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

        onUpdate(tableId, { columns: newColumns, rows: newRows });
    };

    const [resizingColId, setResizingColId] = useState<string | null>(null);
    const [resizingRowHeight, setResizingRowHeight] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [startWidth, setStartWidth] = useState(0);
    const [startHeight, setStartHeight] = useState(0);

    // --- Column Resizing ---
    const startResizeColumn = (e: React.MouseEvent, colId: string, currentWidth: number) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingColId(colId);
        setStartX(e.clientX);
        setStartWidth(currentWidth || 150); // Default width 150

        document.body.style.cursor = 'col-resize';

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const diffX = moveEvent.clientX - e.clientX;
            const newWidth = Math.max(50, (currentWidth || 150) + diffX);
            updateColumn(colId, { width: newWidth });
        };

        const handleMouseUp = () => {
            document.body.style.cursor = 'default';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setResizingColId(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // --- Row Height Resizing (Global) ---
    const startResizeRowHeight = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingRowHeight(true);
        setStartY(e.clientY);
        const currentHeight = tableData.rowHeight || 40;
        setStartHeight(currentHeight);

        document.body.style.cursor = 'row-resize';

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const diffY = moveEvent.clientY - e.clientY;
            const newHeight = Math.max(30, currentHeight + diffY);
            onUpdate(tableId, { rowHeight: newHeight }); // Update global row height
        };

        const handleMouseUp = () => {
            document.body.style.cursor = 'default';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setResizingRowHeight(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);

    // --- Render ---

    return (
        <div className="flex flex-col h-full gap-2 border rounded-lg p-2 bg-white/50 dark:bg-zinc-900/50 min-w-[300px]">
            {/* Table Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button onClick={addRow} variant="outline" size="sm" className="gap-2 h-7 text-xs">
                        <Plus className="w-3 h-3" /> {t('row')}
                    </Button>

                    <Popover open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 h-7 text-xs">
                                <Plus className="w-3 h-3" /> {t('column')}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2" align="start">
                            <div className="grid gap-2">
                                <div className="font-medium text-xs text-muted-foreground px-2">{t('columnType')}</div>
                                <Button
                                    variant="ghost"
                                    className="justify-start gap-2 h-8 text-sm"
                                    onClick={() => { addColumn("text"); setIsAddColumnOpen(false); }}
                                >
                                    <Type className="w-3 h-3" /> {t('typeText')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="justify-start gap-2 h-8 text-sm"
                                    onClick={() => { addColumn("select"); setIsAddColumnOpen(false); }}
                                >
                                    <List className="w-3 h-3" /> {t('typeDropdown')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="justify-start gap-2 h-8 text-sm"
                                    onClick={() => { addColumn("multi-select"); setIsAddColumnOpen(false); }}
                                >
                                    <CheckSquare className="w-3 h-3" /> {t('typeMultiSelect')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="justify-start gap-2 h-8 text-sm"
                                    onClick={() => { addColumn("file"); setIsAddColumnOpen(false); }}
                                >
                                    <Paperclip className="w-3 h-3" /> {t('typeFile')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="justify-start gap-2 h-8 text-sm"
                                    onClick={() => { addColumn("date"); setIsAddColumnOpen(false); }}
                                >
                                    <Calendar className="w-3 h-3" /> {t('typeDate')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="justify-start gap-2 h-8 text-sm"
                                    onClick={() => { addColumn("price"); setIsAddColumnOpen(false); }}
                                >
                                    <DollarSign className="w-3 h-3" /> {t('typePrice')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="justify-start gap-2 h-8 text-sm"
                                    onClick={() => { addColumn("image"); setIsAddColumnOpen(false); }}
                                >
                                    <ImageIcon className="w-3 h-3" /> {t('typeImage')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="justify-start gap-2 h-8 text-sm"
                                    onClick={() => { addColumn("icon"); setIsAddColumnOpen(false); }}
                                >
                                    <Sparkles className="w-3 h-3" /> {t('typeIcon')}
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {onDelete && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                        onClick={() => onDelete(tableId)}
                        title={t('deleteTable')}
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                )}
            </div>

            <div className="flex-1 border rounded-md overflow-hidden shadow-sm bg-white dark:bg-zinc-950 flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm text-left relative table-fixed">
                        <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-900 border-b sticky top-0 z-20 shadow-sm">
                            <tr>
                                <th className="px-2 py-2 w-10 text-center text-zinc-400 font-medium bg-zinc-50 dark:bg-zinc-900 border-b border-r">
                                    #
                                </th>
                                {columns.map((col) => (
                                    <th
                                        key={col.id}
                                        className="py-2 border-r border-b last:border-r-0 group relative bg-zinc-50 dark:bg-zinc-900"
                                        style={{ width: col.width || 150 }}
                                    >
                                        <div className="flex items-center justify-between gap-1 px-2">
                                            <input
                                                className="bg-transparent border-none focus:ring-0 p-0 w-full font-semibold text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 text-xs truncate"
                                                value={col.header}
                                                onChange={(e) => updateHeader(col.id, e.target.value)}
                                            />
                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5"
                                                        >
                                                            <Palette className="w-3 h-3 text-zinc-400" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-40 p-2" align="start">
                                                        <div className="grid grid-cols-5 gap-1">
                                                            {COLORS.map((color) => (
                                                                <button
                                                                    key={color}
                                                                    className="w-5 h-5 rounded-full border border-zinc-200 cursor-pointer hover:scale-110 transition-transform"
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
                                                    className="h-5 w-5"
                                                    onClick={() => deleteColumn(col.id)}
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-400" />
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Resize Handle */}
                                        <div
                                            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-500/50 z-30"
                                            onMouseDown={(e) => startResizeColumn(e, col.id, col.width || 150)}
                                        />
                                    </th>
                                ))}
                                <th className="w-10 bg-zinc-50 dark:bg-zinc-900 border-b"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr
                                    key={row.id}
                                    className="bg-white dark:bg-zinc-950 border-b hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                                    style={{ height: tableData.rowHeight || 40 }}
                                >
                                    <td className="px-2 py-0 text-center text-zinc-400 font-mono text-xs border-r bg-zinc-50/30 sticky left-0 z-10 relative group/row-idx">
                                        {index + 1}
                                        {/* Row Resize Handle (on any row updates global) */}
                                        <div
                                            className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-indigo-500/50 z-30 opacity-0 group-hover/row-idx:opacity-100"
                                            onMouseDown={startResizeRowHeight}
                                        />
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
                                                <TableCell
                                                    cell={cell}
                                                    column={col}
                                                    rowId={row.id}
                                                    onUpdate={(val) => updateCell(row.id, col.id, val)}
                                                    onColorChange={(color) => setCellColor(row.id, col.id, color)}
                                                    onColumnUpdate={updateColumn}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="px-1 text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-zinc-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => deleteRow(row.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {rows.length === 0 && (
                        <div className="p-8 text-center text-zinc-500 text-xs">
                            {t('noRows')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
