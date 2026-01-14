export type ColorOption = {
    label: string;
    value: string;
    text: string;
};

export const COLORS = [
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

export const OPTION_COLORS: ColorOption[] = [
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

import { Column, Row } from "@/types/table";

export const INITIAL_COLUMNS: Column[] = [
    { id: "col-1", header: "Column A", type: "text" },
    { id: "col-2", header: "Column B", type: "text" },
    { id: "col-3", header: "Column C", type: "text" },
];

export const INITIAL_ROWS: Row[] = [
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
