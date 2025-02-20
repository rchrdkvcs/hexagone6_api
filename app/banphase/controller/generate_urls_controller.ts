import GoogleSheetProvider from '#google/provider/google_sheet_provider'
import type { HttpContext } from '@adonisjs/core/http'
import BanphaseService from '../service/banphase_service.js'

export default class GenerateUrlsController {
  async execute({ response }: HttpContext) {
    const sheet = await GoogleSheetProvider.Sheet()

    const spreadsheetId = '1ixO4Fitj3AS3lijki854eevTEMYjfgTrnzqB_GHLSI4'
    const t1Range = 'Map Bans!B3:B'
    const t2Range = 'Map Bans!I3:I'
    const viewRange = 'Map Bans!J3:J'
    const logRange = 'Map Bans!K3:K'

    // Récupérer les données de la colonne D
    const column = await sheet.spreadsheets.values.get({
      spreadsheetId,
      range: 'Map Bans!D3:D',
    })

    // Vérifier si des données existent dans la colonne D
    const rowsWithData = column.data.values || []
    const length = rowsWithData.length

    try {
      const mapbanService = new BanphaseService()

      // Générer des URLs uniques pour chaque ligne
      const urls = await Promise.all(
        Array.from({ length }, async (_, index) => {
          // Vous pouvez adapter cette logique pour générer une URL unique
          const uniqueUrl = await mapbanService.fetchDivData(
            `https://www.mapban.gg/fr/ban/r6s/competitive/bo3?row=${index + 1}`, // Exemple d'URL unique
            ['t1', 't2', 'view', 'log']
          )
          return uniqueUrl
        })
      )

      // Préparer les données à insérer
      const t1Values = urls.map((url) => [url.t1])
      const t2Values = urls.map((url) => [url.t2])
      const viewValues = urls.map((url) => [url.view])
      const logValues = urls.map((url) => [url.log])

      // Effacer les anciennes données
      await sheet.spreadsheets.values.clear({
        spreadsheetId,
        range: t1Range,
      })
      await sheet.spreadsheets.values.clear({
        spreadsheetId,
        range: t2Range,
      })
      await sheet.spreadsheets.values.clear({
        spreadsheetId,
        range: viewRange,
      })
      await sheet.spreadsheets.values.clear({
        spreadsheetId,
        range: logRange,
      })

      // Insérer les nouvelles données
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: t1Range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: t1Values,
        },
      })
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: t2Range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: t2Values,
        },
      })
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: viewRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: viewValues,
        },
      })
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: logRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: logValues,
        },
      })
    } catch (error) {
      console.error('Error updating URLs:', error)
      return response.status(500).json({ error: 'Something went wrong' })
    }

    return response.json({ message: 'URLs updated successfully' })
  }
}
