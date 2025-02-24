export default class LogService {
  async fetchLogData(url: string) {
    try {
      const fetchResponse = await fetch(url)

      if (!fetchResponse.ok) {
        throw new Error(`Erreur HTTP: ${fetchResponse.status}`)
      }

      const htmlContent = await fetchResponse.text()
      const logDataRegex = /<p id="logdata"[^>]*>([\s\S]*?)<\/p>/i
      const logDataMatch = htmlContent.match(logDataRegex)

      if (!logDataMatch || !logDataMatch[1]) {
        return null
      }

      let logDataText = logDataMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/<br\s*\/?>/g, ' ')
        .trim()

      const eventRegex =
        /Team (\d+) \((.*?)\) (picks|bans) Map "(.*?)"!|Team (\d+) \((.*?)\) picked "(Attacker|Defender)" as Side to start on Map "(.*?)"!/g
      const matches = [...logDataText.matchAll(eventRegex)]

      if (matches.length === 0) {
        return []
      }

      const results = matches
        .filter((match) => match[8] !== undefined)
        .map((match) => {
          const teamName = match[6] || match[2]
          const side = match[7] || match[3]
          const mapName = match[8] || match[4]

          return {
            teamName,
            side,
            mapName,
          }
        })

      return results
    } catch (error) {
      console.error(`Erreur lors de la récupération des logs: ${error.message}`)
      return null
    }
  }
}
