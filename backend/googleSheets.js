import { google } from 'googleapis';
import fs from 'fs';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1cAsaCLxS5opfAdQnvhrDsKUy9V1vHO-bdz86kGA_1PQ'; // Replace with your real sheet ID

export async function getTickets() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:D',
  });

  return res.data.values || [];
}

export async function logCheckin(ticketId, fullName, method = 'QR') {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const now = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet2!A:D',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[now, ticketId, fullName, method]],
    },
  });

  // Optionally update status in Sheet1
  const tickets = await getTickets();
  const rowIndex = tickets.findIndex(t => t[0] === ticketId);
  if (rowIndex !== -1) {
    const statusCell = `D${rowIndex + 2}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!${statusCell}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['CHECKED_IN']],
      },
    });
  }
}
