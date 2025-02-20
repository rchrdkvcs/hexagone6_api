import PlayersService from '#players/service/players_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class PlayersController {
  async render({ response }: HttpContext) {
    const players = await new PlayersService().Players()

    if (!players) {
      return response.status(500).json({ message: 'Something went wrong' })
    } else {
      return response.status(200).json({ players })
    }
  }

  async show({ params, response }: HttpContext) {
    const players = await new PlayersService().Players()
    const player = players.find((p) => p.id === params.id)

    if (!player) {
      response.status(404).json({ message: 'Player not found !' })
    } else {
      response.status(200).json({ player })
    }
  }
}
