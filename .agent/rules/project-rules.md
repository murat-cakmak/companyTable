---
trigger: always_on
---

Project Rules & Conventions
Technology Stack
Framework: Next.js 14+ (App Router)
Language: TypeScript
Styling: Tailwind CSS v4
UI Library: Shadcn/UI
Icons: Lucide React
Directory Structure
/app: App Router pages and layouts.
/components: React components.
/components/ui: Shadcn/UI primitive components.
/lib: Utility functions (e.g., utils.ts).
Core Components
ExcelTable: The main component handling the editable data table logic.
Located in: components/ExcelTable.tsx
Manages state for Sheets, Rows, and Columns.
Coding Conventions
Styling
Use Tailwind CSS utility classes for styling.
Use cn() utility from @/lib/utils for conditional class merging.
Dark Mode: Support dark mode using standard Tailwind dark: modifiers.
State Management
Use useState for local component state.
Sheets State: The root state is an array of Sheet objects.
Sheet type: { id, name, columns, rows }.
Immutability: Always create new array/object references when updating state (e.g., setRows([...rows, newRow])).
ID Generation
Use generateId() utility helper: Math.random().toString(36).substring(2, 9).
Do not use crypto.randomUUID() to ensure broad browser compatibility.
ID Formats:
Sheet: sheet-{id}
Row: row-{id}
Column: col-{id}
Cell: cell-{rowId}-{colId}
Feature Specifications
Layout
Full Width: The application should utilize the full width of the viewport.
Fixed Elements: Important controls (like the Sheets Bar) should be fixed to the viewport edge (bottom) for accessibility.
Data Table
Dynamic Structure: Rows and columns must be fully dynamic (add/remove).
Editing: Cells and headers must be directly editable (input fields).
Styling:
Cell and Column coloring must be supported.
Column styles must persist for new rows.
Sheets
Multiple Sheets: Support multiple independent data sheets.
Navigation: Bottom fixed tab bar.
Renaming: Double-click tab to rename.
