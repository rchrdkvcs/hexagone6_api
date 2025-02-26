import type { HttpContext } from '@adonisjs/core/http'
import LogService, { LogEntry } from '../service/log_service.js'
import GoogleSheetService from '#google/service/google_sheet_service'

interface SheetMapColumns {
  log: string
  map1: string
  side1: string
  map2?: string
  side2?: string
  map3: string
  side3: string
}

interface SheetConfig {
  sheetName: string
  ranges: SheetMapColumns
}

export default class LogsSyncController {
  private googleSheetService = new GoogleSheetService()
  private logService = new LogService()
  private spreadsheetId = '1ixO4Fitj3AS3lijki854eevTEMYjfgTrnzqB_GHLSI4'

  private sheetsConfig: SheetConfig[] = [
    {
      sheetName: 'Phase Finales',
      ranges: {
        log: 'H7:H35',
        map1: 'S7:S35',
        side1: 'T7:T35',
        map2: 'W7:W35',
        side2: 'X7:X35',
        map3: 'AA7:AA35',
        side3: 'AB7:AB35',
      },
    },
    {
      sheetName: 'Phase Finales',
      ranges: {
        log: 'AP7:AP35',
        map1: 'BA7:BA35',
        side1: 'BB7:BB35',
        map2: 'BE7:BE35',
        side2: 'BF7:BF35',
        map3: 'BI7:BI35',
        side3: 'BJ7:BJ35',
      },
    },
    {
      sheetName: 'Phase Groupes',
      ranges: {
        log: 'I5:I38',
        map1: '',
        side1: '',
        map2: '',
        side2: '',
        map3: 'U5:U38',
        side3: 'V5:V38',
      },
    },
  ]

  async execute({ response }: HttpContext) {
    try {
      await this.processAllLogs()
      return response.json({ success: true, message: 'Logs synchronisés' })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      })
    }
  }

  private async processAllLogs() {
    for (const config of this.sheetsConfig) {
      const logUrls = await this.googleSheetService.getColumnData(
        this.spreadsheetId,
        `${config.sheetName}!${config.ranges.log}`
      )

      for (const [rowIndex, logUrl_] of logUrls.entries()) {
        const logUrl = logUrl_[0]
        if (!logUrl) continue

        try {
          const logEntries = await this.logService.fetchLogData(logUrl)
          await this.processLogEntry(config, rowIndex, logEntries)
        } catch (error) {
          console.error(`Erreur avec ${logUrl}:`, error)
        }
      }
    }
  }

  private async processLogEntry(config: SheetConfig, rowIndex: number, entries: LogEntry[]) {
    const mapData = this.extractMapData(entries)
    if (mapData.length === 0) return

    const isBo3 = this.isBestOfThree(mapData)
    const targetRow = this.getTargetRow(config.ranges.log, rowIndex)

    const updates = isBo3
      ? this.prepareBo3Updates(config, mapData)
      : this.prepareBo1Updates(config, mapData)

    for (const update of updates) {
      if (!update.value) continue

      const column = this.getColumnFromRange(update.range)
      if (!column) continue

      await this.googleSheetService.updateRange(
        this.spreadsheetId,
        `${config.sheetName}!${column}${targetRow}`,
        [[update.value]]
      )
    }
  }

  private isBestOfThree(mapData: MapData[]): boolean {
    return mapData.length >= 2 && mapData.some((data) => data.type === 'pick')
  }

  private extractMapData(entries: LogEntry[]): MapData[] {
    return entries
      .filter((entry) => entry.type === 'pick' || entry.type === 'decider')
      .map((entry) => ({
        map: entry.mapName,
        side: entry.side,
        type: entry.type,
      }))
      .filter((data) => data.map)
  }

  private prepareBo3Updates(config: SheetConfig, mapData: MapData[]) {
    return [
      { range: config.ranges.map1, value: mapData[0]?.map },
      { range: config.ranges.side1, value: mapData[0]?.side },
      { range: config.ranges.map2, value: mapData[1]?.map },
      { range: config.ranges.side2, value: mapData[1]?.side },
      { range: config.ranges.map3, value: mapData.at(-1)?.map },
      { range: config.ranges.side3, value: mapData.at(-1)?.side },
    ].filter((update) => update.value)
  }

  private prepareBo1Updates(config: SheetConfig, mapData: MapData[]) {
    return [
      { range: config.ranges.map3, value: mapData[0]?.map },
      { range: config.ranges.side3, value: mapData[0]?.side },
    ].filter((update) => update.value)
  }

  private getTargetRow(logRange: string, rowIndex: number): number {
    const startRow = Number.parseInt((logRange.match(/\d+/) || ['7'])[0])
    return startRow + rowIndex
  }

  private getColumnFromRange(range: string): string | null {
    const match = range.match(/^[A-Z]+/)
    return match ? match[0] : null
  }
}

interface MapData {
  map: string
  side?: string
  type: 'pick' | 'decider'
}
