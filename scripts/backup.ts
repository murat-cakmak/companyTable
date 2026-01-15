import { google } from 'googleapis';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config();

const execPromise = util.promisify(exec);

// --- Configuration ---
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_BACKUPS = 7; // Keep last 7 backups in Drive (optional logic, script currently just uploads)

// Ensure env vars
if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
    console.error("❌ Missing GOOGLE_DRIVE_FOLDER_ID in .env");
    process.exit(1);
}
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const REFRESH_TOKEN = process.env.GOOLE_DRIVE_REFRESH_TOKEN;
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

if (!REFRESH_TOKEN) {
    console.error("❌ Missing GOOLE_DRIVE_REFRESH_TOKEN in .env");
    process.exit(1);
}
if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error("❌ Missing credentials.json in project root");
    process.exit(1);
}

// --- Google Drive Auth (OAuth2) ---
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
const key = credentials.installed || credentials.web;

const auth = new google.auth.OAuth2(
    key.client_id,
    key.client_secret,
    key.redirect_uris[0]
);

auth.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth });

async function createBackup() {
    try {
        // 1. Create backup dir if not exists
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR);
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `backup-${timestamp}.sql`;
        const filePath = path.join(BACKUP_DIR, fileName);

        console.log(`📦 Creating Postgres dump: ${fileName}...`);

        // 2. Resolve pg_dump path
        let pgDumpPath = 'pg_dump'; // Default system path

        // Check env var
        if (process.env.PG_DUMP_PATH) {
            pgDumpPath = process.env.PG_DUMP_PATH;
        } else {
            // Try common Mac paths if not in env
            const commonPaths = [
                '/Applications/Postgres.app/Contents/Versions/latest/bin/pg_dump',
                '/opt/homebrew/bin/pg_dump',
                '/usr/local/bin/pg_dump',
                '/opt/homebrew/opt/libpq/bin/pg_dump', // Homebrew keg-only (Apple Silicon)
                '/usr/local/opt/libpq/bin/pg_dump',    // Homebrew keg-only (Intel)
                '/usr/bin/pg_dump'
            ];

            for (const p of commonPaths) {
                if (fs.existsSync(p)) {
                    pgDumpPath = p;
                    console.log(`🔎 Found pg_dump at: ${pgDumpPath}`);
                    break;
                }
            }
        }

        console.log(`Using pg_dump path: ${pgDumpPath}`);

        // Sanitize DATABASE_URL (remove ?schema=public etc. which pg_dump might dislike)
        const dbUrl = new URL(process.env.DATABASE_URL!);
        dbUrl.search = ''; // Remove query params like ?schema=public
        const cleanDbUrl = dbUrl.toString();

        // Run pg_dump
        await execPromise(`"${pgDumpPath}" "${cleanDbUrl}" -f "${filePath}"`);

        // 3. (Optional) Gzip it to save space
        // const zippedPath = filePath + '.gz';
        // await execPromise(`gzip "${filePath}"`);
        // We will upload the raw SQL for simplicity, or we can enable gzip if 'gzip' is available.

        console.log("✅ Dump created. Uploading to Google Drive...");

        // 4. Upload to Drive
        const fileMetadata = {
            name: fileName,
            parents: [FOLDER_ID!],
        };

        const media = {
            mimeType: 'application/x-sql',
            body: fs.createReadStream(filePath),
        };

        const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
        });

        console.log(`🚀 Upload successful! File ID: ${file.data.id}`);

        // 5. Cleanup local file
        fs.unlinkSync(filePath);
        console.log("🧹 Local cleanup done.");

    } catch (error) {
        console.error("💥 Backup failed:", error);
        process.exit(1);
    }
}

createBackup();
