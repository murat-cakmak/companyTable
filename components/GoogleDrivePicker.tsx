"use client";

import React from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { toast } from 'sonner';

interface GoogleDrivePickerProps {
    onSelect: (files: Array<{ name: string; url: string; embedUrl: string; iconUrl: string; id: string }>) => void;
    children: React.ReactNode;
}

export function GoogleDrivePicker({ onSelect, children }: GoogleDrivePickerProps) {
    const [openPicker, authResponse] = useDrivePicker();

    const handleOpenPicker = () => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        const appId = process.env.NEXT_PUBLIC_GOOGLE_APP_ID;

        if (!clientId || !apiKey || !appId) {
            toast.error("Google Drive configuration is missing.");
            console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_GOOGLE_API_KEY, or NEXT_PUBLIC_GOOGLE_APP_ID");
            return;
        }

        openPicker({
            clientId: clientId,
            developerKey: apiKey,
            viewId: "DOCS",
            // customViews: customViewsArray, // options
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: true,
            appId: appId,
            // scopes: ['https://www.googleapis.com/auth/drive.file'], // Strict scope
            callbackFunction: (data) => {
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
                } else if (data.action === 'cancel') {
                    // User cancelled
                }
            },
        });
    };

    return (
        <div onClick={handleOpenPicker} className="cursor-pointer">
            {children}
        </div>
    );
}
