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


## Step 5: Deployment on Ubuntu Server (Linux)
If you want to run this on a real server (e.g., DigitalOcean, AWS Ubuntu instance), follow these tailored steps:

### 1. Install Dependencies
You need `pg_dump` and `Node.js` installed on the server.
```bash
# Update package list
sudo apt update

# Install Postgres Client (contains pg_dump)
sudo apt install -y postgresql-client

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Prepare Project
1.  Clone your repo to the server (e.g., `/home/ubuntu/company-table`).
2.  Install packages:
    ```bash
    cd /home/ubuntu/company-table
    npm install
    ```
3.  **Upload Credentials**: You MUST upload your local `credentials.json` and `.env` files to the server. You can use `scp` or `FileZilla`.
    ```bash
    # Example using SCP from your local machine
    scp credentials.json ubuntu@your-server-ip:/home/ubuntu/company-table/
    scp .env ubuntu@your-server-ip:/home/ubuntu/company-table/
    ```

### 3. Generate Token (One-time)
Since the server has no browser, you might need to regenerate the token locally or try running the script on the server if you can tunnel ports.
**Easiest way:** Just reuse the `GOOLE_DRIVE_REFRESH_TOKEN` you generated on your Mac! It works everywhere. Just ensure it is in the `.env` file on the server.

### 4. Setup Cron Job
1.  Open crontab:
    ```bash
    crontab -e
    ```
2.  Add the line (check paths!):
    ```cron
    0 3 * * * cd /home/ubuntu/company-table && /usr/bin/npm run backup >> /home/ubuntu/backup.log 2>&1
    ```
    (You can find where npm is with `which npm`).
