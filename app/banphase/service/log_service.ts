export interface LogEntry {
  mapName: string
  type: 'pick' | 'decider'
  side?: 'Attacker' | 'Defender'
}

export default class LogService {
  async fetchLogData(url: string): Promise<LogEntry[]> {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`)
    return this.parseLogs(await response.text())
  }

  private parseLogs(html: string): LogEntry[] {
    const logDataMatch = html.match(/<p id="logdata"[^>]*>([\s\S]*?)<\/p>/i)
    if (!logDataMatch) return []

    const logText = logDataMatch[1]
    const entries: LogEntry[] = []
    let lastMap: string | null = null

    const regex =
      /(Team \d+ \(.*?\) <b>(picks|bans)<\/b> Map "(.*?)"!|Map "(.*?)" will be <b>decider<\/b>!|picked <b>"(Attacker|Defender)"<\/b> as Side to start on Map "(.*?)"!)/gi

    let match
    while ((match = regex.exec(logText)) !== null) {
      const [, , actionType, actionMap, deciderMap, side, sideMap] = match

      if (actionType === 'picks' && actionMap) {
        lastMap = actionMap.trim()
        entries.push({
          mapName: lastMap,
          type: 'pick',
        })
      } else if (deciderMap) {
        entries.push({
          mapName: deciderMap.trim(),
          type: 'decider',
        })
      } else if (side && sideMap) {
        const targetMap = sideMap.trim()
        const entry = entries.find((e) => e.mapName === targetMap)
        if (entry) {
          entry.side = side as 'Attacker' | 'Defender'
        }
      }
    }

    return this.filterUniqueMaps(entries)
  }

  private filterUniqueMaps(entries: LogEntry[]): LogEntry[] {
    const seen = new Set<string>()
    return entries
      .reverse()
      .filter((entry) => {
        const isNew = !seen.has(entry.mapName)
        if (isNew) seen.add(entry.mapName)
        return isNew
      })
      .reverse()
  }
}
