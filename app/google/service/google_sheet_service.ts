// app/google/service/google_sheet_service.ts
import GoogleSheetProvider from '#google/provider/google_sheet_provider'

export default class GoogleSheetService {
  private sheet: any

  constructor() {
    this.initializeSheet()
  }

  private async initializeSheet() {
    this.sheet = await GoogleSheetProvider.Sheet()
  }

  async getColumnData(spreadsheetId: string, range: string) {
    const response = await this.sheet.spreadsheets.values.get({
      spreadsheetId,
      range,
    })
    return response.data.values || []
  }

  async updateRange(spreadsheetId: string, range: string, values: any[][]) {
    await this.sheet.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    })
  }

  async clearRange(spreadsheetId: string, range: string) {
    await this.sheet.spreadsheets.values.clear({
      spreadsheetId,
      range,
    })
  }
}
