import type { HttpContext } from '@adonisjs/core/http'
import TeamsService from '../service/teams_service.js'

export default class TeamsController {
  async render({ response }: HttpContext) {
    const teams = await new TeamsService().Teams()

    if (!teams) {
      return response.status(500).json({ message: 'Something went wrong' })
    } else {
      return response.status(200).json({ teams })
    }
  }

  async show({ params, response }: HttpContext) {
    const teams = await new TeamsService().Teams()
    const team = teams.find((t) => t.roleId === params.id)

    if (!team) {
      return response.status(404).json({ message: 'Team not found !' })
    } else {
      return response.status(200).json({ team })
    }
  }
}
