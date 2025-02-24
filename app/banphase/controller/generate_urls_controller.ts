import GoogleSheetProvider from '#google/provider/google_sheet_provider'
import type { HttpContext } from '@adonisjs/core/http'
import BanphaseService from '../service/banphase_service.js'

// Définir un type pour les clés valides de l'objet `ranges`
type BanType = 'bo1' | 'bo3'

// Définir un type pour l'objet `url`
type UrlData = {
  t1: string | null
  t2: string | null
  view: string | null
  log: string | null
  banType: BanType
}

export default class GenerateUrlsController {
  async execute({ response }: HttpContext) {
    const sheet = await GoogleSheetProvider.Sheet()
    const spreadsheetId = '1ixO4Fitj3AS3lijki854eevTEMYjfgTrnzqB_GHLSI4'

    // Définir les plages en fonction du type de ban (BO1 ou BO3)
    const ranges = {
      bo1: {
        t1: 'Phase Finales!E7:E',
        t2: 'Phase Finales!F7:F',
        view: 'Phase Finales!G7:G',
        log: 'Phase Finales!H7:H',
      },
      bo3: {
        t1: 'Phase Finales!E19:E',
        t2: 'Phase Finales!F19:F',
        view: 'Phase Finales!G19:G',
        log: 'Phase Finales!H19:H',
      },
    }

    try {
      const banphaseService = new BanphaseService()

      // Récupérer les données de la colonne R pour déterminer le type de ban (BO1 ou BO3)
      const columnR = await sheet.spreadsheets.values.get({
        spreadsheetId,
        range: 'Phase Finales!R7:R',
      })

      const rowsWithData = columnR.data.values || []
      const length = rowsWithData.length

      // Générer les URLs en fonction de la valeur dans la colonne R
      const urls: UrlData[] = await Promise.all(
        Array.from({ length }, async (_, index) => {
          const isBo1 = rowsWithData[index][0] === 'X' // Vérifier si la colonne R contient 'X'
          const banType: BanType = isBo1 ? 'bo1' : 'bo3' // Déterminer le type de ban
          const baseUrl = `https://www.mapban.gg/fr/ban/r6s/competitive/${banType}?row=${index + 1}`

          // Récupérer les données des divs
          const divData = await banphaseService.fetchDivData(baseUrl, ['t1', 't2', 'view', 'log'])

          // Retourner un objet de type UrlData
          return {
            t1: divData.t1,
            t2: divData.t2,
            view: divData.view,
            log: divData.log,
            banType, // Ajouter le type de ban
          }
        })
      )

      // Séparer les URLs en deux groupes : BO1 et BO3
      const bo1Urls = urls.filter((url) => url.banType === 'bo1')
      const bo3Urls = urls.filter((url) => url.banType === 'bo3')

      // Préparer les données à insérer pour BO1
      const t1ValuesBo1 = bo1Urls.map((url) => [url.t1])
      const t2ValuesBo1 = bo1Urls.map((url) => [url.t2])
      const viewValuesBo1 = bo1Urls.map((url) => [url.view])
      const logValuesBo1 = bo1Urls.map((url) => [url.log])

      // Préparer les données à insérer pour BO3
      const t1ValuesBo3 = bo3Urls.map((url) => [url.t1])
      const t2ValuesBo3 = bo3Urls.map((url) => [url.t2])
      const viewValuesBo3 = bo3Urls.map((url) => [url.view])
      const logValuesBo3 = bo3Urls.map((url) => [url.log])

      // Effacer les anciennes données
      await sheet.spreadsheets.values.clear({ spreadsheetId, range: 'Phase Finales!E7:H33' })

      // Insérer les nouvelles données pour BO1
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: ranges.bo1.t1,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: t1ValuesBo1 },
      })
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: ranges.bo1.t2,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: t2ValuesBo1 },
      })
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: ranges.bo1.view,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: viewValuesBo1 },
      })
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: ranges.bo1.log,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: logValuesBo1 },
      })

      // Insérer les nouvelles données pour BO3
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: ranges.bo3.t1,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: t1ValuesBo3 },
      })
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: ranges.bo3.t2,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: t2ValuesBo3 },
      })
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: ranges.bo3.view,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: viewValuesBo3 },
      })
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: ranges.bo3.log,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: logValuesBo3 },
      })

      return response.json({ message: 'URLs updated successfully' })
    } catch (error) {
      console.error('Error updating URLs:', error)
      return response.status(500).json({ error: 'Something went wrong' })
    }
  }
}
