"use client";

import React, { useState } from "react";
import { Plus, Layout, LayoutTemplate, Save, FilePlus, Trash2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableSheetTab } from "./SortableSheetTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { SingleTable } from "@/components/table/SingleTable";
import { generateId, cn } from "@/lib/utils";
import { Sheet, TableData, ColumnType, SelectOption, Column, Row, TableTemplate } from "@/types/table";
import {
    INITIAL_COLUMNS, INITIAL_ROWS, OPTION_COLORS,
    DEFAULT_TBL1_COLUMNS, DEFAULT_TBL1_ROWS,
    DEFAULT_TBL2_COLUMNS, DEFAULT_TBL2_ROWS
} from "@/lib/constants";

export function ExcelTable() {
    const createNewTable = (columns?: Column[], rows?: Row[]): TableData => ({
        id: `table-${generateId()}`,
        columns: columns ? JSON.parse(JSON.stringify(columns)) : JSON.parse(JSON.stringify(INITIAL_COLUMNS)), // Deep copy
        rows: rows ? JSON.parse(JSON.stringify(rows)) : JSON.parse(JSON.stringify(INITIAL_ROWS)),
    });

    // Initialize with Default Template
    const [savedTemplates, setSavedTemplates] = useState<TableTemplate[]>([
        {
            id: 'default-template',
            name: 'Default Template',
            columns: DEFAULT_TBL1_COLUMNS as Column[] // Just a placeholder for UI
        }
    ]);
    const [templateName, setTemplateName] = useState("");

    const [sheets, setSheets] = useState<Sheet[]>([
        {
            id: `sheet-${generateId()}`,
            name: "Sheet 1",
            tables: [createNewTable()],
        },
    ]);
    const [activeSheetId, setActiveSheetId] = useState<string>(sheets[0].id);
    const [editingSheetId, setEditingSheetId] = useState<string | null>(null);

    const activeSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

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
            tables: [createNewTable()],
        };
        setSheets([...sheets, newSheet]);
        setActiveSheetId(newId);
    };

    const addTableToSheet = (templateColumns?: Column[], templateRows?: Row[]) => {
        if (activeSheet.tables.length >= 3) return;
        const newTable = createNewTable(templateColumns, templateRows);
        updateActiveSheet({ tables: [...activeSheet.tables, newTable] });
    };

    const saveCurrentAsTemplate = () => {
        if (!templateName.trim()) return;
        // Save the first table's structure of the active sheet
        const sourceTable = activeSheet.tables[0];
        const newTemplate: TableTemplate = {
            id: generateId(),
            name: templateName,
            columns: JSON.parse(JSON.stringify(sourceTable.columns)), // Deep copy columns
        };
        setSavedTemplates([...savedTemplates, newTemplate]);
        setTemplateName("");
    };

    const loadTemplate = (template: TableTemplate) => {
        if (template.id === 'default-template') {
            // Special handling for Default Template: Add BOTH tables
            // First table
            const table1 = createNewTable(DEFAULT_TBL1_COLUMNS, DEFAULT_TBL1_ROWS);
            // Second table
            const table2 = createNewTable(DEFAULT_TBL2_COLUMNS, DEFAULT_TBL2_ROWS);

            // Check limits (we need space for potentially 2 tables)
            // Existing logic replaces tables or appends? It appends.
            // If we have 0 tables, fine. If we have 1, we can add 2 -> total 3 (limit).
            // If we have 2, we can only add 1.

            const currentCount = activeSheet.tables.length;
            const newTables = [...activeSheet.tables];

            if (currentCount < 3) {
                newTables.push(table1);
            }
            if (newTables.length < 3) {
                newTables.push(table2);
            }

            updateActiveSheet({ tables: newTables });

        } else {
            addTableToSheet(template.columns);
        }
    };

    const deleteTemplate = (templateId: string) => {
        if (templateId === 'default-template') return;
        setSavedTemplates(savedTemplates.filter(t => t.id !== templateId));
    };

    const updateTable = (tableId: string, updates: Partial<TableData>) => {
        const newTables = activeSheet.tables.map(t =>
            t.id === tableId ? { ...t, ...updates } : t
        );
        updateActiveSheet({ tables: newTables });
    };

    const deleteTable = (tableId: string) => {
        const newTables = activeSheet.tables.filter(t => t.id !== tableId);
        updateActiveSheet({ tables: newTables });
    };

    const updateSheetName = (sheetId: string, newName: string) => {
        setSheets((prev) =>
            prev.map((sheet) =>
                sheet.id === sheetId ? { ...sheet, name: newName } : sheet
            )
        );
        setEditingSheetId(null);
    };

    const updateSheetColor = (sheetId: string, color: string) => {
        setSheets((prev) =>
            prev.map((sheet) =>
                sheet.id === sheetId ? { ...sheet, color } : sheet
            )
        );
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setSheets((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className="flex flex-col h-full w-full gap-2 pb-14">
            <div className="flex items-center justify-between px-1 mt-[10px]">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Workspace
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-2">
                        {activeSheet.tables.length} / 3 Tables
                    </span>

                    {/* Template Button */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 text-zinc-600 dark:text-zinc-400">
                                <LayoutTemplate className="w-4 h-4" /> Templates
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-3" align="end">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none text-sm">Save Current</h4>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Template name..."
                                            className="h-8 text-xs"
                                            value={templateName}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                        />
                                        <Button size="sm" className="h-8 px-2" onClick={saveCurrentAsTemplate}>
                                            <Save className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2 border-t">
                                    <h4 className="font-medium leading-none text-sm">Load Template</h4>
                                    <div className="grid gap-1 max-h-[200px] overflow-y-auto">
                                        {savedTemplates.map(t => (
                                            <div key={t.id} className="flex items-center gap-1 group/template">
                                                <Button
                                                    variant="ghost"
                                                    className="justify-start h-8 text-xs font-normal flex-1"
                                                    onClick={() => loadTemplate(t)}
                                                    disabled={activeSheet.tables.length >= 3}
                                                >
                                                    <FilePlus className="w-3 h-3 mr-2" />
                                                    {t.name}
                                                </Button>
                                                {t.id !== 'default-template' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover/template:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteTemplate(t.id);
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        {savedTemplates.length === 0 && <span className="text-xs text-muted-foreground p-1">No saved templates</span>}
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button
                        onClick={() => addTableToSheet()}
                        variant="default"
                        size="sm"
                        className="gap-2"
                        disabled={activeSheet.tables.length >= 3}
                    >
                        <Plus className="w-4 h-4" /> Add Table
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col gap-4">
                    {activeSheet.tables.map((table) => (
                        <div
                            key={table.id}
                            className="flex-1 w-full min-h-0 border-b last:border-b-0 transition-all duration-300"
                        >
                            <SingleTable
                                tableData={table}
                                onUpdate={updateTable}
                                onDelete={activeSheet.tables.length > 1 ? deleteTable : undefined}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sheets Bar */}
            <div className="fixed bottom-0 left-0 right-0 border-t divide-x overflow-x-auto bg-zinc-50 dark:bg-zinc-900 z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] h-12 flex items-center">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sheets.map(s => s.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {sheets.map((sheet) => (
                            <SortableSheetTab
                                key={sheet.id}
                                sheet={sheet}
                                isActive={activeSheetId === sheet.id}
                                isEditing={editingSheetId === sheet.id}
                                onActivate={setActiveSheetId}
                                onEditStart={setEditingSheetId}
                                onRename={updateSheetName}
                                onColorChange={updateSheetColor}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
                <button
                    onClick={addSheet}
                    className="px-4 py-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 h-full flex items-center justify-center border-l bg-white/50 dark:bg-black/20"
                    title="Add Sheet"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
