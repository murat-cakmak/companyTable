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

// --- Option Helpers ---
const opt = (id: string, label: string, color: string) => ({ id, label, color });

// Options Definitions
const OPTS_APPLY = [
    opt("opt-app-done", "BAŞVURU YAPILDI", "#166534"), // Dark Green (using hex close to image) - wait, image has green bg, white text usually or dark green bg. 
    // The user's Select component uses `backgroundColor` for the badge.
    // Image shows Dark Green background with White text? Or Light Green bg?
    // "BAŞVURU YAPILDI" looks like Dark Green background.
    // I will use some standard colors from OPTION_COLORS or custom hex.
    // Let's use Hex codes that look like the image.
    opt("opt-app-assigned", "ATANDI", "#166534"),
    opt("opt-app-none", "BAŞLAMADI", "#ef4444"),
];

const OPTS_RESULT = [
    opt("opt-res-done", "TAMAMLANDI", "#166534"),
    opt("opt-res-none", "BAŞLAMADI", "#ef4444"),
    opt("opt-res-continue", "DEVAM EDİYOR", "#f59e0b"),
];

const OPTS_PAYMENT = [
    opt("opt-pay-none", "-", "#f3f4f6"),
    opt("opt-pay-done", "YATIRILDI-İÇERİ GİRİLDİ", "#166534"),
    opt("opt-pay-not", "YATIRILMADI", "#ef4444"),
];

const OPTS_OWNER = [
    opt("opt-own-feramiz", "FERAMİZ", "#bfdbfe"),
    opt("opt-own-arda", "ARDA", "#bfdbfe"),
    opt("opt-own-ozgur", "ÖZGÜR", "#bfdbfe"),
    opt("opt-own-hasan", "HASAN", "#bfdbfe"),
];

const OPTS_REVISE = [
    opt("opt-rev-exist", "REVİZE VAR", "#fca5a5"),
    opt("opt-rev-arch", "REVİZE MİMARDA", "#fde047"),
    opt("opt-rev-pros", "REVİZE SAVCIDA", "#fde047"),
    opt("opt-rev-given", "REVİZE İÇERİ VERİLDİ", "#bbf7d0"),
    opt("opt-rev-approved", "REVİZE ONAYLANDI", "#16a34a"),
];

const OPTS_APPLICANT = [
    opt("opt-app-ozgur", "ÖZGÜR", "#f3f4f6"),
    opt("opt-app-hasan", "HASAN", "#f3f4f6"),
    opt("opt-app-none", "-", "#f3f4f6"),
];

export const INITIAL_COLUMNS: Column[] = [
    { id: "col-docs", header: "BAŞVURU / BELGELER", type: "text", width: 250 },
    { id: "col-date-1", header: "TARİH", type: "text", width: 120 },
    { id: "col-status-apply", header: "BAŞVURU YAPILDI", type: "select", options: OPTS_APPLY, width: 180 },
    { id: "col-date-2", header: "TARİH", type: "text", width: 120 },
    { id: "col-status-result", header: "SONUÇLANDI", type: "select", options: OPTS_RESULT, width: 180 },
    { id: "col-amount", header: "TUTAR", type: "text", width: 120 },
    { id: "col-payment", header: "ÖDENDİ", type: "select", options: OPTS_PAYMENT, width: 180 },
    { id: "col-file-owner", header: "DOSYA KİMDE", type: "select", options: OPTS_OWNER, width: 150 },
    { id: "col-revise", header: "REVİZE", type: "select", options: OPTS_REVISE, width: 180 },
    { id: "col-applicant", header: "KİM BAŞVURDU", type: "select", options: OPTS_APPLICANT, width: 150 },
];

const DOCS = [
    "LİHKAB APLİKASYONU", "İMAR DURUMU", "KIRMIZI KOT", "YAPI APLİKASYONU",
    "ZEMİN ETÜDÜ", "TRAFO BELGESİ", "NUMARATAJ", "İSKİ BAŞVURUSU",
    "YENİ YAPI RUHSAT", "YİBF ATAMASI"
];

export const INITIAL_ROWS: Row[] = DOCS.map((doc, i) => ({
    id: `row-${i + 1}`,
    cells: {
        "col-docs": { id: `cell-${i + 1}-docs`, value: doc },
        "col-date-1": { id: `cell-${i + 1}-d1`, value: "" },
        "col-status-apply": { id: `cell-${i + 1}-sa`, value: "" }, // Default empty
        "col-date-2": { id: `cell-${i + 1}-d2`, value: "" },
        "col-status-result": { id: `cell-${i + 1}-sr`, value: "" },
        "col-amount": { id: `cell-${i + 1}-amt`, value: "" },
        "col-payment": { id: `cell-${i + 1}-pay`, value: "opt-pay-none" }, // Default -
        "col-file-owner": { id: `cell-${i + 1}-own`, value: "" },
        "col-revise": { id: `cell-${i + 1}-rev`, value: "" },
        "col-applicant": { id: `cell-${i + 1}-app`, value: "opt-app-none" },
    }
}));
