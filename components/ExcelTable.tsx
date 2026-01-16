"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, Layout, LayoutTemplate, Save, FilePlus, Trash2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableSheetTab } from "./SortableSheetTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
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
import { TableProvider } from "@/lib/TableContext";
import { GoogleDriveConfig } from "@/components/GoogleDrivePicker";

interface ExcelTableProps {
    googleDriveConfig?: GoogleDriveConfig;
}

export function ExcelTable({ googleDriveConfig }: ExcelTableProps) {
    const t = useTranslations('Table');
    const tCommon = useTranslations('Common');

    const createNewTable = (columns?: Column[], rows?: Row[]): TableData => {
        const newTableId = `table-${generateId()}`;

        let newRows = rows ? JSON.parse(JSON.stringify(rows)) : JSON.parse(JSON.stringify(INITIAL_ROWS));

        // Regenerate IDs for rows and cells to avoid duplication conflicts
        newRows = newRows.map((row: Row) => {
            const newRowId = `row-${generateId()}`;
            const newCells = { ...row.cells };

            Object.keys(newCells).forEach(key => {
                if (newCells[key] && newCells[key].id) {
                    newCells[key] = {
                        ...newCells[key],
                        id: `cell-${generateId()}`
                    };
                }
            });

            return {
                ...row,
                id: newRowId,
                cells: newCells
            };
        });

        return {
            id: newTableId,
            columns: columns ? JSON.parse(JSON.stringify(columns)) : JSON.parse(JSON.stringify(INITIAL_COLUMNS)), // Deep copy
            rows: newRows,
        };
    };


    // Initialize with Default Template
    const [savedTemplates, setSavedTemplates] = useState<TableTemplate[]>([
        {
            id: 'default-template',
            name: 'Default Template', // Internal name, will be translated on render
            columns: DEFAULT_TBL1_COLUMNS as Column[]
        }
    ]);
    const [templateName, setTemplateName] = useState("");

    const [sheets, setSheets] = useState<Sheet[]>([]);
    const [activeSheetId, setActiveSheetId] = useState<string>("");
    const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load Data from DB
    React.useEffect(() => {
        const load = async () => {
            try {
                // Dynamic import to avoid SSR issues if any, though standard import is fine for client components calling server actions
                const { fetchCompanyData } = await import("@/app/actions/sheets");
                const data = await fetchCompanyData();
                if (data && data.length > 0) {
                    setSheets(data);
                    setActiveSheetId(data[0].id);
                } else {
                    // Fallback to empty default if DB is empty
                    const defaultSheet = {
                        id: `sheet-${generateId()}`,
                        name: t('sheetName', { number: 1 }),
                        tables: [createNewTable()],
                    };
                    setSheets([defaultSheet]);
                    setActiveSheetId(defaultSheet.id);
                }
            } catch (err) {
                console.error("Failed to load", err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { saveCompanyData } = await import("@/app/actions/sheets");
            const result = await saveCompanyData(sheets);
            if (result.success) {
                toast.success(t('saveSuccess'));
            } else {
                toast.error(t('saveError'));
            }
        } catch (e) {
            console.error(e);
            toast.error(t('saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const activeSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0] || { id: 'loading', tables: [], name: 'Loading...' };

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
            name: t('sheetName', { number: sheets.length + 1 }),
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
        if (!confirm(tCommon('areYouSure'))) return;
        setSavedTemplates(savedTemplates.filter(t => t.id !== templateId));
    };

    const updateTable = (tableId: string, updates: Partial<TableData>) => {
        const newTables = activeSheet.tables.map(t =>
            t.id === tableId ? { ...t, ...updates } : t
        );
        updateActiveSheet({ tables: newTables });
    };

    const deleteTable = (tableId: string) => {
        if (!confirm(tCommon('areYouSure'))) return;
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

    const deleteSheet = (sheetId: string) => {
        if (sheets.length <= 1) {
            alert(t('deleteLastSheetError'));
            return;
        }

        if (!confirm(tCommon('areYouSure'))) return;

        const newSheets = sheets.filter(s => s.id !== sheetId);
        setSheets(newSheets);

        // If active sheet is deleted, activate the previous one or the first one
        if (activeSheetId === sheetId) {
            const index = sheets.findIndex(s => s.id === sheetId);
            const newActiveIndex = index > 0 ? index - 1 : 0;
            if (newSheets[newActiveIndex]) {
                setActiveSheetId(newSheets[newActiveIndex].id);
            }
        }
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

    if (isLoading) {
        return <div className="flex h-full items-center justify-center text-zinc-500">{t('loadingData')}</div>;
    }

    return (
        <TableProvider googleDriveConfig={googleDriveConfig}>
            <div className="flex flex-col h-full w-full gap-2 pb-14">
                <div className="flex items-center justify-between px-1 mt-[10px]">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Layout className="w-5 h-5" />
                        {t('workspace')}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground mr-2">
                            {t('tablesCount', { count: activeSheet.tables.length, limit: 3 })}
                        </span>

                        {/* Template Button */}
                        <Button
                            variant="default"
                            size="sm"
                            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? t('saving') : t('saveChanges')}
                        </Button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 text-zinc-600 dark:text-zinc-400">
                                    <LayoutTemplate className="w-4 h-4" /> {t('templates')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-3" align="end">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none text-sm">{t('saveCurrent')}</h4>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder={t('templateNamePlaceholder')}
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
                                        <h4 className="font-medium leading-none text-sm">{t('loadTemplate')}</h4>
                                        <div className="grid gap-1 max-h-[200px] overflow-y-auto">
                                            {savedTemplates.map(template => (
                                                <div key={template.id} className="flex items-center gap-1 group/template">
                                                    <Button
                                                        variant="ghost"
                                                        className="justify-start h-8 text-xs font-normal flex-1"
                                                        onClick={() => loadTemplate(template)}
                                                        disabled={activeSheet.tables.length >= 3}
                                                    >
                                                        <FilePlus className="w-3 h-3 mr-2" />
                                                        {template.id === 'default-template' ? t('defaultTemplate') : template.name}
                                                    </Button>
                                                    {template.id !== 'default-template' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover/template:opacity-100 transition-opacity"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteTemplate(template.id);
                                                            }}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {savedTemplates.length === 0 && <span className="text-xs text-muted-foreground p-1">{t('noTemplates')}</span>}
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
                            <Plus className="w-4 h-4" /> {t('addTable')}
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
                                    onDelete={deleteSheet}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                    <button
                        onClick={addSheet}
                        className="px-4 py-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 h-full flex items-center justify-center border-l bg-white/50 dark:bg-black/20"
                        title={t('addSheet')}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </TableProvider>
    );
}
