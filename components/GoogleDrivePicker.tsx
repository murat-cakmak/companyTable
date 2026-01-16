"use client";

import React from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { toast } from 'sonner';

export interface GoogleDriveConfig {
    clientId: string;
    apiKey: string;
    appId: string;
}

interface GoogleDrivePickerProps {
    onSelect: (files: Array<{ name: string; url: string; embedUrl: string; iconUrl: string; id: string }>) => void;
    children: React.ReactNode;
    config?: GoogleDriveConfig;
}

export function GoogleDrivePicker({ onSelect, children, config }: GoogleDrivePickerProps) {
    const [openPicker, authResponse] = useDrivePicker();

    const handleOpenPicker = () => {
        const clientId = config?.clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        const appId = config?.appId || process.env.NEXT_PUBLIC_GOOGLE_APP_ID;

        if (!clientId || !apiKey || !appId) {
            toast.error("Google Drive configuration is missing. Please configure it in Settings.");
            console.error("Missing Google Config");
            return;
        }

        const pickerConfig: any = {
            clientId: clientId,
            developerKey: apiKey,
            viewId: "DOCS",
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: true,
            appId: appId,
            setIncludeFolders: true,
            setSelectFolderEnabled: true,
            // Requesting 'drive.file' scope is critical for Uploads to work
            scopes: ['https://www.googleapis.com/auth/drive.file'],
            callbackFunction: (data: any) => {
                if (data.action === 'picked') {
                    const files = data.docs.map((doc: any) => ({
                        id: doc.id,
                        name: doc.name,
                        url: doc.url,
                        embedUrl: doc.embedUrl,
                        iconUrl: doc.iconUrl,
                        type: 'drive-file'
                    }));
                    onSelect(files);
                    toast.success(`${files.length} file(s) selected from Drive`);
                }
            },
        };

        openPicker(pickerConfig);
    };

    return (
        <div onClick={handleOpenPicker} className="cursor-pointer">
            {children}
        </div>
    );
}
