import { HttpContext } from '@adonisjs/core/http'
import BanphaseService from '../service/banphase_service.js'
import GoogleSheetService from '#google/service/google_sheet_service'

type BanType = 'bo1' | 'bo3'
type UrlData = {
  t1: string | null
  t2: string | null
  view: string | null
  log: string | null
}

type SheetRangeConfig = {
  t1: string
  t2: string
  view: string
  log: string
}

type SheetConfig = {
  sheetName: string
  ranges: {
    bo1?: SheetRangeConfig
    bo3?: SheetRangeConfig
  }
}

export default class GenerateUrlsController {
  private googleSheetService = new GoogleSheetService()
  private banphaseService = new BanphaseService()
  private spreadsheetId = '1ixO4Fitj3AS3lijki854eevTEMYjfgTrnzqB_GHLSI4'

  // Configuration des plages
  private sheetsConfig: SheetConfig[] = [
    {
      sheetName: 'Phase Finales',
      ranges: {
        bo1: {
          t1: 'Phase Finales!E34:E35',
          t2: 'Phase Finales!F34:F35',
          view: 'Phase Finales!G34:G35',
          log: 'Phase Finales!H34:H35',
        },
      },
    },
    {
      sheetName: 'Phase Finales',
      ranges: {
        bo1: {
          t1: 'Phase Finales!E7:E18',
          t2: 'Phase Finales!F7:F18',
          view: 'Phase Finales!G7:G18',
          log: 'Phase Finales!H7:H18',
        },
        bo3: {
          t1: 'Phase Finales!E19:E32',
          t2: 'Phase Finales!F19:F32',
          view: 'Phase Finales!G19:G32',
          log: 'Phase Finales!H19:H32',
        },
      },
    },
    {
      sheetName: 'Phase Finales',
      ranges: {
        bo1: {
          t1: 'Phase Finales!AM26:AM27',
          t2: 'Phase Finales!AN26:AN27',
          view: 'Phase Finales!AO26:AO27',
          log: 'Phase Finales!AP26:AP27',
        },
      },
    },
    {
      sheetName: 'Phase Finales',
      ranges: {
        bo1: {
          t1: 'Phase Finales!AM7:AM18',
          t2: 'Phase Finales!AN7:AN18',
          view: 'Phase Finales!AO7:AO18',
          log: 'Phase Finales!AP7:AP18',
        },
        bo3: {
          t1: 'Phase Finales!AM19:AM24',
          t2: 'Phase Finales!AN19:AN24',
          view: 'Phase Finales!AO19:AO24',
          log: 'Phase Finales!AP19:AP24',
        },
      },
    },
    {
      sheetName: 'Phase Groupes',
      ranges: {
        bo1: {
          t1: 'Phase Groupes!F5:F38',
          t2: 'Phase Groupes!G5:G38',
          view: 'Phase Groupes!H5:H38',
          log: 'Phase Groupes!I5:I38',
        },
      },
    },
  ]

  async execute({ response }: HttpContext) {
    try {
      // 1. Générer les URLs pour chaque plage
      const rangeUrls = await this.generateUrlsForAllRanges()

      // 2. Mettre à jour chaque plage individuellement
      await this.updateAllRanges(rangeUrls)

      return response.json({ message: 'URLs updated successfully' })
    } catch (error) {
      console.error('Error updating URLs:', error)
      return response.status(500).json({ error: 'Something went wrong' })
    }
  }

  /**
   * Génère les URLs pour chaque plage individuellement
   */
  private async generateUrlsForAllRanges(): Promise<Map<SheetRangeConfig, UrlData[]>> {
    const rangeUrls = new Map<SheetRangeConfig, UrlData[]>()

    for (const sheetConfig of this.sheetsConfig) {
      for (const banType of ['bo1', 'bo3'] as const) {
        const rangeConfig = sheetConfig.ranges[banType]
        if (!rangeConfig) continue

        const urls = await this.generateUrlsForRange(rangeConfig, banType)
        rangeUrls.set(rangeConfig, urls)
      }
    }

    return rangeUrls
  }

  /**
   * Génère les URLs pour une plage spécifique
   */
  private async generateUrlsForRange(
    rangeConfig: SheetRangeConfig,
    banType: BanType
  ): Promise<UrlData[]> {
    const urls: UrlData[] = []
    const rowCount = this.getRowCountFromRange(rangeConfig.t1)

    for (let i = 0; i < rowCount; i++) {
      const baseUrl = `https://www.mapban.gg/fr/ban/r6s/competitive/${banType}?row=${i + 1}`
      const divData = await this.banphaseService.fetchDivData(baseUrl, ['t1', 't2', 'view', 'log'])

      urls.push({
        t1: divData.t1 ?? null,
        t2: divData.t2 ?? null,
        view: divData.view ?? null,
        log: divData.log ?? null,
      })
    }

    return urls
  }

  /**
   * Met à jour toutes les plages avec leurs URLs respectifs
   */
  private async updateAllRanges(rangeUrls: Map<SheetRangeConfig, UrlData[]>) {
    for (const [rangeConfig, urls] of rangeUrls) {
      await this.updateSingleRange(rangeConfig, urls)
    }
  }

  /**
   * Met à jour une seule plage
   */
  private async updateSingleRange(rangeConfig: SheetRangeConfig, urls: UrlData[]) {
    const { t1, t2, view, log } = rangeConfig

    const t1Values = urls.map((url) => [url.t1])
    const t2Values = urls.map((url) => [url.t2])
    const viewValues = urls.map((url) => [url.view])
    const logValues = urls.map((url) => [url.log])

    await this.googleSheetService.updateRange(this.spreadsheetId, t1, t1Values)
    await this.googleSheetService.updateRange(this.spreadsheetId, t2, t2Values)
    await this.googleSheetService.updateRange(this.spreadsheetId, view, viewValues)
    await this.googleSheetService.updateRange(this.spreadsheetId, log, logValues)
  }

  /**
   * Calcule le nombre de lignes d'une plage
   */
  private getRowCountFromRange(range: string): number {
    const rangePart = range.split('!')[1]
    const [start, end] = rangePart
      .split(':')
      .map((cell) => Number.parseInt(cell.match(/\d+/)?.[0] || '0'))
    return end - start + 1
  }
}
