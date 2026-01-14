export type CellStyle = {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
};

export type Cell = {
    id: string;
    value: any; // Changed from string to any to support arrays (multi-select) or file objects
    style?: CellStyle;
};

export type ColumnType = "text" | "select" | "multi-select" | "image" | "icon" | "file" | "date" | "price";

export type SelectOption = {
    id: string;
    label: string;
    color: string;
};

export type Column = {
    id: string;
    header: string;
    type: ColumnType;
    options?: SelectOption[];
    width?: number;
    style?: CellStyle;
};

export type TableTemplate = {
    id: string;
    name: string;
    columns: Column[];
};

export type Row = {
    id: string;
    cells: Record<string, Cell>;
    style?: CellStyle;
};

export type TableData = {
    id: string;
    columns: Column[];
    rows: Row[];
    rowHeight?: number;
};

export type Sheet = {
    id: string;
    name: string;
    color?: string;
    tables: TableData[];
};
