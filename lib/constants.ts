import { Column, Row } from "@/types/table";

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

// --- Option Helpers ---
const opt = (id: string, label: string, color: string) => ({ id, label, color });

// Options Definitions
const OPTS_APPLY = [
    opt("opt-app-done", "BAŞVURU YAPILDI", "#166534"),
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
    opt("opt-own-ozgur", "HASAN", "#bfdbfe"),
    opt("opt-own-hasan", "ÖZGÜR", "#bfdbfe"),
];

const OPTS_REVISE = [
    opt("opt-rev-exist", "REVİZE VAR", "#fca5a5"),
    opt("opt-rev-arch", "REVİZE MİMARDA", "#fde047"),
    opt("opt-rev-pros", "REVİZE SAVCIDA", "#fde047"),
    opt("opt-rev-given", "REVİZE İÇERİ VERİLDİ", "#bbf7d0"),
    opt("opt-rev-approved", "REVİZE ONAYLANDI", "#16a34a"),
];

const OPTS_APPLICANT = [
    opt("opt-app-ozgur", "HASAN", "#f3f4f6"),
    opt("opt-app-hasan", "ÖZGÜR", "#f3f4f6"),
    opt("opt-app-none", "-", "#f3f4f6"),
];

// --- Table 2 Options ---
const OPTS_T2_STATUS = [
    opt("opt-t2-st-none", "AVAN ŞARTI YOK", "#166534"),
    opt("opt-t2-st-emel", "EMEL ÇİZDİ", "#166534"),
    opt("opt-t2-st-altug", "ALTUĞ ÇİZDİ", "#166534"),
    opt("opt-t2-st-cakmak", "ÇAKMAK ÇİZİYOR", "#fde047"),
    opt("opt-t2-st-done", "YAPILDI", "#166534"),
];

const OPTS_T2_OZALIT = [
    opt("opt-t2-oz-none", "-", "#f3f4f6"),
    opt("opt-t2-oz-done", "TAM ÇIKTI ALINDI", "#166534"),
    opt("opt-t2-oz-not", "ÇIKTI ALINMADI", "#dc2626"),
];

const OPTS_T2_BELEDIYE = [
    opt("opt-t2-bel-none", "-", "#f3f4f6"),
    opt("opt-t2-bel-in", "İÇERİ VERİLDİ", "#166534"),
    opt("opt-t2-bel-out", "İÇERİ VERİLMEDİ", "#dc2626"),
];

const OPTS_T2_OWNER = [
    opt("opt-t2-own-none", "-", "#f3f4f6"),
    opt("opt-t2-own-miray", "MİRAY HANIM", "#fca5a5"),
    opt("opt-t2-own-not", "ATANMADI", "#dc2626"),
];

const OPTS_T2_REVISE = [
    opt("opt-t2-rev-none", "-", "#f3f4f6"),
];

const OPTS_T2_ONAY = [
    opt("opt-t2-onay-none", "-", "#f3f4f6"),
];


// --- Default Template Constants ---
export const DEFAULT_TBL1_COLUMNS: Column[] = [
    { id: "col-docs", header: "BAŞVURU / BELGELER", type: "text", width: 250 },
    { id: "col-date-1", header: "TARİH", type: "date", width: 120 },
    { id: "col-status-apply", header: "BAŞVURU YAPILDI", type: "select", options: OPTS_APPLY, width: 180 },
    { id: "col-date-2", header: "TARİH", type: "date", width: 120 },
    { id: "col-status-result", header: "SONUÇLANDI", type: "select", options: OPTS_RESULT, width: 180 },
    { id: "col-amount", header: "TUTAR", type: "price", width: 120 },
    { id: "col-payment", header: "ÖDENDİ", type: "select", options: OPTS_PAYMENT, width: 180 },
    { id: "col-file-owner", header: "DOSYA KİMDE", type: "select", options: OPTS_OWNER, width: 150 },
    { id: "col-revise", header: "REVİZE", type: "select", options: OPTS_REVISE, width: 180 },
    { id: "col-applicant", header: "KİM BAŞVURDU", type: "select", options: OPTS_APPLICANT, width: 150 },
];

const DOCS_1 = [
    "LİHKAB APLİKASYONU", "İMAR DURUMU", "KIRMIZI KOT", "YAPI APLİKASYONU",
    "ZEMİN ETÜDÜ", "TRAFO BELGESİ", "NUMARATAJ", "İSKİ BAŞVURUSU",
    "YENİ YAPI RUHSAT", "YİBF ATAMASI"
];

export const DEFAULT_TBL1_ROWS: Row[] = DOCS_1.map((doc, i) => ({
    id: `row-t1-${i + 1}`,
    cells: {
        "col-docs": { id: `cell-t1-${i + 1}-docs`, value: doc },
        "col-date-1": { id: `cell-t1-${i + 1}-d1`, value: "" },
        "col-status-apply": { id: `cell-t1-${i + 1}-sa`, value: "opt-app-done" },
        "col-date-2": { id: `cell-t1-${i + 1}-d2`, value: "" },
        "col-status-result": { id: `cell-t1-${i + 1}-sr`, value: "opt-res-done" },
        "col-amount": { id: `cell-t1-${i + 1}-amt`, value: "" },
        "col-payment": { id: `cell-t1-${i + 1}-pay`, value: "opt-pay-none" },
        "col-file-owner": { id: `cell-t1-${i + 1}-own`, value: "" },
        "col-revise": { id: `cell-t1-${i + 1}-rev`, value: "" },
        "col-applicant": { id: `cell-t1-${i + 1}-app`, value: "opt-app-ozgur" },
    }
}));


export const DEFAULT_TBL2_COLUMNS: Column[] = [
    { id: "col-t2-proj", header: "PROJE TÜRÜ", type: "text", width: 200 },
    { id: "col-t2-date", header: "TARİH", type: "date", width: 120 },
    { id: "col-t2-status", header: "DURUM", type: "select", options: OPTS_T2_STATUS, width: 200 },
    { id: "col-t2-ozalit", header: "OZALİT-DOSYA", type: "select", options: OPTS_T2_OZALIT, width: 180 },
    { id: "col-t2-belediye", header: "BELEDİYE", type: "select", options: OPTS_T2_BELEDIYE, width: 180 },
    { id: "col-t2-kimde", header: "DOSYA KİMDE", type: "select", options: OPTS_T2_OWNER, width: 180 },
    { id: "col-t2-revize", header: "REVİZE", type: "select", options: OPTS_T2_REVISE, width: 150 },
    { id: "col-t2-onay", header: "ONAY", type: "select", options: OPTS_T2_ONAY, width: 150 },
];

const DOCS_2 = [
    "AVAN PROJE", "MİMARİ PROJE", "ELEKTRİK PROJESİ", "MEKANİK PROJE",
    "STATİK PROJE", "AKUSTİK RAPORU", "ISI-YALITIM RAPORU"
];

export const DEFAULT_TBL2_ROWS: Row[] = DOCS_2.map((doc, i) => ({
    id: `row-t2-${i + 1}`,
    cells: {
        "col-t2-proj": { id: `cell-t2-${i + 1}-proj`, value: doc },
        "col-t2-date": { id: `cell-t2-${i + 1}-date`, value: "" },
        "col-t2-status": { id: `cell-t2-${i + 1}-stat`, value: "opt-t2-st-none" },
        "col-t2-ozalit": { id: `cell-t2-${i + 1}-oz`, value: "opt-t2-oz-none" },
        "col-t2-belediye": { id: `cell-t2-${i + 1}-bel`, value: "opt-t2-bel-none" },
        "col-t2-kimde": { id: `cell-t2-${i + 1}-kim`, value: "opt-t2-own-none" },
        "col-t2-revize": { id: `cell-t2-${i + 1}-rev`, value: "opt-t2-rev-none" },
        "col-t2-onay": { id: `cell-t2-${i + 1}-onay`, value: "opt-t2-onay-none" },
    }
}));


// --- Simple Initial State ---
export const INITIAL_COLUMNS: Column[] = [
    { id: "col-1", header: "Column A", type: "text" },
    { id: "col-2", header: "Column B", type: "text" },
    { id: "col-3", header: "Column C", type: "text" },
];

export const INITIAL_ROWS: Row[] = [
    {
        id: "row-1",
        cells: {
            "col-1": { id: "cell-1-1", value: "" },
            "col-2": { id: "cell-1-2", value: "" },
            "col-3": { id: "cell-1-3", value: "" },
        },
    },
    {
        id: "row-2",
        cells: {
            "col-1": { id: "cell-2-1", value: "" },
            "col-2": { id: "cell-2-2", value: "" },
            "col-3": { id: "cell-2-3", value: "" },
        },
    },
];
