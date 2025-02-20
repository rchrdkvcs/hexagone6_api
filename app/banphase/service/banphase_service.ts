export default class BanphaseService {
  /**
   * Récupère les données des divs spécifiées par leurs IDs
   */
  async fetchDivData(url: string, keys: string[]) {
    try {
      const fetchResponse = await fetch(url)

      if (!fetchResponse.ok) {
        throw new Error(`Erreur HTTP: ${fetchResponse.status}`)
      }

      const htmlContent = await fetchResponse.text()

      const results: { [key: string]: string | null } = {}

      keys.forEach((key) => {
        const regex = new RegExp(`<div[^>]*id="${key}"[^>]*>(.*?)<\/div>`, 'i')
        const match = htmlContent.match(regex)
        results[key] = match ? match[1].trim() : null
      })

      return results
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des données des divs: ${error.message}`)
    }
  }

  /**
   * Récupère et parse les logs de la page
   */
  async fetchLogData(url: string) {
    try {
      const fetchResponse = await fetch(url)

      if (!fetchResponse.ok) {
        throw new Error(`Erreur HTTP: ${fetchResponse.status}`)
      }

      const htmlContent = await fetchResponse.text()

      // Extraire le texte de la balise <p id="logdata">
      const logDataRegex = /<p id="logdata"[^>]*>([\s\S]*?)<\/p>/i
      const logDataMatch = htmlContent.match(logDataRegex)

      if (!logDataMatch || !logDataMatch[1]) {
        throw new Error('Balise <p id="logdata"> non trouvée')
      }

      // Nettoyer le texte
      let logDataText = logDataMatch[1]
        .replace(/<[^>]+>/g, '') // Supprime toutes les balises HTML
        .replace(/&nbsp;/g, ' ') // Remplace &nbsp; par un espace
        .replace(/<br\s*\/?>/g, ' ') // Remplace <br> par un espace
        .trim()

      // Regex pour extraire les informations pertinentes
      const eventRegex =
        /Team (\d+) \((.*?)\) (picks|bans) Map "(.*?)"!|Team (\d+) \((.*?)\) picked "(Attacker|Defender)" as Side to start on Map "(.*?)"!/g
      const matches = [...logDataText.matchAll(eventRegex)]

      if (matches.length === 0) {
        throw new Error('Aucun événement trouvé dans le logdata')
      }

      // Structurer les données
      const results = matches
        .filter((match) => match[8] !== undefined) // Filtrer pour ne garder que les événements avec une map
        .map((match, index) => {
          const mapOrder = index + 1 === 3 ? 'D' : index + 1 // 'D' pour le décider
          const teamName = match[6] || match[2] // Nom de l'équipe
          const side = match[7] || match[3] // Attacker, Defender, picks ou bans
          const mapName = match[8] || match[4] // Nom de la map

          return {
            mapOrder,
            teamName,
            side,
            mapName,
          }
        })

      return results.slice(-3) // Retourne uniquement les 3 derniers logs
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des logs: ${error.message}`)
    }
  }
}
