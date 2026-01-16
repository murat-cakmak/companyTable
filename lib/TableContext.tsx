"use client";

import React, { createContext, useContext } from 'react';
import { GoogleDriveConfig } from '@/components/GoogleDrivePicker';

interface TableContextType {
    googleDriveConfig?: GoogleDriveConfig;
}

const TableContext = createContext<TableContextType>({});

export function useTableContext() {
    return useContext(TableContext);
}

export function TableProvider({
    children,
    googleDriveConfig
}: {
    children: React.ReactNode;
    googleDriveConfig?: GoogleDriveConfig;
}) {
    return (
        <TableContext.Provider value={{ googleDriveConfig }}>
            {children}
        </TableContext.Provider>
    );
}
