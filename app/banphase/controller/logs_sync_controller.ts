import type { HttpContext } from '@adonisjs/core/http'
import BanphaseService from '../service/banphase_service.js'

export default class LogsSyncController {
  async execute({ response }: HttpContext) {
    const banphaseService = new BanphaseService()

    try {
      const data = await banphaseService.fetchLogData(
        'https://www.mapban.gg/fr/ban/log/j4izbbgsvqjRkyIk'
      )

      response.status(200).json({ data })
    } catch (error) {
      return response.status(500).json({ message: error.message })
    }
  }
}
