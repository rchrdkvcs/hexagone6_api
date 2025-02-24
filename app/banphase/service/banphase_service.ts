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
}
