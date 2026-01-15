import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Path to your downloaded OAuth client ID JSON file
// Rename your downloaded 'client_secret_....json' to 'credentials.json' and place it in root.
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getAccessToken() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        console.error('❌ Error: credentials.json not found.');
        console.error('Please download your OAuth 2.0 Client ID JSON from Google Cloud Console,');
        console.error('rename it to "credentials.json", and place it in the project root.');
        process.exit(1);
    }

    const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    const keys = JSON.parse(content);

    // Handle different JSON structures (web vs installed)
    const key = keys.installed || keys.web;
    if (!key) {
        console.error('❌ Error: Invalid credentials.json format.');
        process.exit(1);
    }

    const oAuth2Client = new google.auth.OAuth2(
        key.client_id,
        key.client_secret,
        key.redirect_uris[0] || 'http://localhost'
    );

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline', // Crucial for getting a refresh token
        scope: SCOPES,
        prompt: 'consent' // Force consent to ensure refresh token is returned
    });

    console.log('Authorize this app by visiting this url:');
    console.log('\n', authUrl, '\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', async (code) => {
        rl.close();
        const cleanCode = code.trim(); // Important: remove accidentally pasted newlines/spaces

        if (!cleanCode) {
            console.error('❌ Error: No code provided.');
            return;
        }

        try {
            const { tokens } = await oAuth2Client.getToken(cleanCode);
            console.log('\n✅ Success! Here is your Refresh Token:');
            console.log('\nGOOLE_DRIVE_REFRESH_TOKEN=' + tokens.refresh_token);
            console.log('\nAdd the line above to your .env file.');
        } catch (err) {
            console.error('Error retrieving access token:', err);
        }
    });
}

getAccessToken();
