# Google Drive Backup Setup Guide

To enable automated backups to Google Drive, you need to set up a Google Cloud Service Account and share a folder with it.

## Step 1: Create OAuth Credentials (Desktop App)
Since this is a script running on your computer, we use "OAuth Desktop" flow.

1.  Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2.  Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
3.  **Application type**: Select **Desktop app**.
4.  **Name**: `Backup Script` (or anything).
5.  Click **CREATE**.
6.  A popup will appear. Click **DOWNLOAD JSON**.
7.  Rename the downloaded file to **`credentials.json`**.
8.  Move it to your project root folder: `/Users/muratcakmak/Desktop/Project/companyTable/credentials.json`.

## Step 2: Create a Backup Folder
1.  Go to your [Google Drive](https://drive.google.com/).
2.  Create a new folder (e.g., "CompanyTable Backups").
3.  **Share** this folder with the **Service Account Email** (the one ending in `@...iam.gserviceaccount.com`) as an **Editor**.
4.  Open the folder and look at the URL. It will look like: `https://drive.google.com/drive/folders/12345abcde_XXXXX`.
5.  Copy the ID part (e.g., `12345abcde_XXXXX`).

## Step 3: Configure Environment
Add the Folder ID to your `.env` file (create one if it doesn't exist):

```env
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
DATABASE_URL=your_postgres_connection_string
```


## Step 4: Automate with Cron (Daily Backup)
To run this script automatically every night at 3 AM:

1.  Open your crontab:
    ```bash
    crontab -e
    ```
2.  Add the following line (adjusting paths to match your system):
    ```cron
    0 3 * * * cd /Users/muratcakmak/Desktop/Project/companyTable && /usr/local/bin/npm run backup >> /tmp/backup.log 2>&1
    ```
    *   `0 3 * * *`: Runs at 03:00 AM every day.
    *   `cd ...`: Navigates to your project folder.
    *   `npm run backup`: Executes the script.
    *   `>> /tmp/backup.log`: Saves logs for debugging.

> [!TIP]
> You may need to use the full path to `npm` if cron doesn't find it. Run `which npm` in your terminal to find it.

