import { PrismaClient, Role, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

// CONSTANTS from lib/constants.ts translated for Seeding
const OPTS_APPLY = [
    { id: "opt-app-done", label: "BAŞVURU YAPILDI", color: "#166534" },
    { id: "opt-app-assigned", label: "ATANDI", color: "#166534" },
    { id: "opt-app-none", label: "BAŞLAMADI", color: "#ef4444" },
];

const OPTS_RESULT = [
    { id: "opt-res-done", label: "TAMAMLANDI", color: "#166534" },
    { id: "opt-res-none", label: "BAŞLAMADI", color: "#ef4444" },
    { id: "opt-res-continue", label: "DEVAM EDİYOR", color: "#f59e0b" },
];

const OPTS_PAYMENT = [
    { id: "opt-pay-none", label: "-", color: "#f3f4f6" },
    { id: "opt-pay-done", label: "YATIRILDI-İÇERİ GİRİLDİ", color: "#166534" },
    { id: "opt-pay-not", label: "YATIRILMADI", color: "#ef4444" },
];

const OPTS_OWNER = [
    { id: "opt-own-feramiz", label: "FERAMİZ", color: "#bfdbfe" },
    { id: "opt-own-arda", label: "ARDA", color: "#bfdbfe" },
    { id: "opt-own-ozgur", label: "HASAN", color: "#bfdbfe" },
    { id: "opt-own-hasan", label: "ÖZGÜR", color: "#bfdbfe" },
];

const OPTS_REVISE = [
    { id: "opt-rev-exist", label: "REVİZE VAR", color: "#fca5a5" },
    { id: "opt-rev-arch", label: "REVİZE MİMARDA", color: "#fde047" },
    { id: "opt-rev-pros", label: "REVİZE SAVCIDA", color: "#fde047" },
    { id: "opt-rev-given", label: "REVİZE İÇERİ VERİLDİ", color: "#bbf7d0" },
    { id: "opt-rev-approved", label: "REVİZE ONAYLANDI", color: "#16a34a" },
];

const OPTS_APPLICANT = [
    { id: "opt-app-ozgur", label: "HASAN", color: "#f3f4f6" },
    { id: "opt-app-hasan", label: "ÖZGÜR", color: "#f3f4f6" },
    { id: "opt-app-none", label: "-", color: "#f3f4f6" },
];

const OPTS_T2_STATUS = [
    { id: "opt-t2-st-none", label: "AVAN ŞARTI YOK", color: "#166534" },
    { id: "opt-t2-st-emel", label: "EMEL ÇİZDİ", color: "#166534" },
    { id: "opt-t2-st-altug", label: "ALTUĞ ÇİZDİ", color: "#166534" },
    { id: "opt-t2-st-cakmak", label: "ÇAKMAK ÇİZİYOR", color: "#fde047" },
    { id: "opt-t2-st-done", label: "YAPILDI", color: "#166534" },
];

const OPTS_T2_OZALIT = [
    { id: "opt-t2-oz-none", label: "-", color: "#f3f4f6" },
    { id: "opt-t2-oz-done", label: "TAM ÇIKTI ALINDI", color: "#166534" },
    { id: "opt-t2-oz-not", label: "ÇIKTI ALINMADI", color: "#dc2626" },
];

const OPTS_T2_BELEDIYE = [
    { id: "opt-t2-bel-none", label: "-", color: "#f3f4f6" },
    { id: "opt-t2-bel-in", label: "İÇERİ VERİLDİ", color: "#166534" },
    { id: "opt-t2-bel-out", label: "İÇERİ VERİLMEDİ", color: "#dc2626" },
];

const OPTS_T2_OWNER = [
    { id: "opt-t2-own-none", label: "-", color: "#f3f4f6" },
    { id: "opt-t2-own-miray", label: "MİRAY HANIM", color: "#fca5a5" },
    { id: "opt-t2-own-not", label: "ATANMADI", color: "#dc2626" },
];

const OPTS_T2_REVISE = [{ id: "opt-t2-rev-none", label: "-", color: "#f3f4f6" }];
const OPTS_T2_ONAY = [{ id: "opt-t2-onay-none", label: "-", color: "#f3f4f6" }];


async function main() {
    console.log('🌱 Starting seed...');

    const SEED_COMPANY_ID = 'faf7f014-d462-41bc-a6c2-c578651dd195';
    const SEED_ADMIN_ID = '133aa445-9827-47db-aa67-e3f889db05f8';

    // 1. Create or Update Seed Company (Tenant)
    const company = await prisma.company.upsert({
        where: { id: SEED_COMPANY_ID },
        update: {},
        create: {
            id: SEED_COMPANY_ID,
            name: 'Demo Insaat Ltd.',
            plan: 'PRO',
            settings: { theme: 'dark' },
        },
    });
    console.log(`Synced company: ${company.name} (${company.id})`);

    // 2. Create or Update Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'mrtstab@gmail.com' },
        update: {
            companyId: company.id,
            role: Role.SUPER_ADMIN,
        },
        create: {
            id: SEED_ADMIN_ID,
            email: 'mrtstab@gmail.com',
            name: 'Murat Çakmak',
            role: Role.SUPER_ADMIN,
            companyId: company.id,
            passwordHash: '$2b$10$jUB7vPQVL0gjGyctZneZmeizsNuynLcZYgYu5McBzSL81vQ.NM4ry',
        },
    });
    console.log(`Synced admin user: ${admin.email}`);

    // 3. Clean up existing data for this company to avoid duplicates on re-seed
    await prisma.sheet.deleteMany({ where: { companyId: company.id } });
    console.log('🧹 Cleaned up existing sheets/tables for demo company');

    // 4. Create Default Sheet 1: Company Documents
    const sheet1 = await prisma.sheet.create({
        data: {
            name: 'Sirket Evraklari',
            order: 0,
            color: '#4f46e5', // Indigo
            companyId: company.id,
        },
    });

    const table1 = await prisma.table.create({
        data: {
            name: 'Basvuru Takibi',
            sheetId: sheet1.id,
            // Store actual column definitions as JSON
            columns: [
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
            ],
        },
    });

    // Seed Data Rows for Table 1
    const DOCS_1 = ["LİHKAB APLİKASYONU", "İMAR DURUMU", "KIRMIZI KOT", "YAPI APLİKASYONU", "ZEMİN ETÜDÜ", "TRAFO BELGESİ", "NUMARATAJ", "İSKİ BAŞVURUSU", "YENİ YAPI RUHSAT", "YİBF ATAMASI"];

    for (const [i, doc] of DOCS_1.entries()) {
        await prisma.row.create({
            data: {
                tableId: table1.id,
                data: {
                    "col-docs": { id: `cell-t1-${i}-docs`, value: doc },
                    "col-date-1": { id: `cell-t1-${i}-d1`, value: "" },
                    "col-status-apply": { id: `cell-t1-${i}-sa`, value: "opt-app-done" },
                    "col-date-2": { id: `cell-t1-${i}-d2`, value: "" },
                    "col-status-result": { id: `cell-t1-${i}-sr`, value: "opt-res-done" },
                    "col-amount": { id: `cell-t1-${i}-amt`, value: "" },
                    "col-payment": { id: `cell-t1-${i}-pay`, value: "opt-pay-none" },
                    "col-file-owner": { id: `cell-t1-${i}-own`, value: "" },
                    "col-revise": { id: `cell-t1-${i}-rev`, value: "" },
                    "col-applicant": { id: `cell-t1-${i}-app`, value: "opt-app-ozgur" },
                },
                createdById: admin.id
            }
        });
    }


    // 5. Create Default Sheet 2: Project Tracking
    const sheet2 = await prisma.sheet.create({
        data: {
            name: 'Proje Takibi',
            order: 1,
            color: '#f97316', // Orange
            companyId: company.id,
        },
    });

    const table2 = await prisma.table.create({
        data: {
            name: 'Proje Durumlari',
            sheetId: sheet2.id,
            columns: [
                { id: "col-t2-proj", header: "PROJE TÜRÜ", type: "text", width: 200 },
                { id: "col-t2-date", header: "TARİH", type: "date", width: 120 },
                { id: "col-t2-status", header: "DURUM", type: "select", options: OPTS_T2_STATUS, width: 200 },
                { id: "col-t2-ozalit", header: "OZALİT-DOSYA", type: "select", options: OPTS_T2_OZALIT, width: 180 },
                { id: "col-t2-belediye", header: "BELEDİYE", type: "select", options: OPTS_T2_BELEDIYE, width: 180 },
                { id: "col-t2-kimde", header: "DOSYA KİMDE", type: "select", options: OPTS_T2_OWNER, width: 180 },
                { id: "col-t2-revize", header: "REVİZE", type: "select", options: OPTS_T2_REVISE, width: 150 },
                { id: "col-t2-onay", header: "ONAY", type: "select", options: OPTS_T2_ONAY, width: 150 },
            ],
        },
    });

    const DOCS_2 = ["AVAN PROJE", "MİMARİ PROJE", "ELEKTRİK PROJESİ", "MEKANİK PROJE", "STATİK PROJE", "AKUSTİK RAPORU", "ISI-YALITIM RAPORU"];

    for (const [i, doc] of DOCS_2.entries()) {
        await prisma.row.create({
            data: {
                tableId: table2.id,
                data: {
                    "col-t2-proj": { id: `cell-t2-${i}-proj`, value: doc },
                    "col-t2-date": { id: `cell-t2-${i}-date`, value: "" },
                    "col-t2-status": { id: `cell-t2-${i}-stat`, value: "opt-t2-st-none" },
                    "col-t2-ozalit": { id: `cell-t2-${i}-oz`, value: "opt-t2-oz-none" },
                    "col-t2-belediye": { id: `cell-t2-${i}-bel`, value: "opt-t2-bel-none" },
                    "col-t2-kimde": { id: `cell-t2-${i}-kim`, value: "opt-t2-own-none" },
                    "col-t2-revize": { id: `cell-t2-${i}-rev`, value: "opt-t2-rev-none" },
                    "col-t2-onay": { id: `cell-t2-${i}-onay`, value: "opt-t2-onay-none" },
                },
                createdById: admin.id
            }
        });
    }

    console.log('✅ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
