import env from '#start/env'
import { google } from 'googleapis'

export default class GoogleSheetProvider {
  static async Sheet() {
    const privateKey = env
      .get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
      .replace(/\\n/g, '\n')
      .replace(/\\+/g, '')

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
        client_id: env.get('GOOGLE_SERVICE_ACCOUNT_ID'),
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    return sheets
  }
}
