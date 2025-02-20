import MessageService from '#discord/service/message_service'
import TeamsService from '#teams/service/teams_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class BanphaseMessageController {
  async execute({ request, response }: HttpContext) {
    const { t1Link, t1Id, t2Link, t2Id } = request.all()

    if (!t1Link || !t1Id || !t2Link || !t2Id) {
      return response.status(400).send('Missing parameters')
    }

    const teams = await new TeamsService().Teams()
    const team1 = teams.find((team) => team.channelId === t1Id)
    const team2 = teams.find((team) => team.channelId === t2Id)

    if (!team1 || !team2) {
      return response.status(400).send('Invalid teams')
    }

    try {
      await new MessageService().send(
        team1.channelId,
        team1.roleId,
        `${team1.name} vs ${team2.name}`,
        `**La phase de ban commence !**

        Merci de vous diriger au bureau des admins avec votre téléphone pour procéder au map ban.

        **Ban phase starts !**

        Please head to the admin office with your phone to proceed with the map ban.
        `,
        t1Link
      )

      await new MessageService().send(
        team2.channelId,
        team2.roleId,
        `${team2.name} vs ${team1.name}`,
        `**La phase de ban commence !**

        Merci de vous diriger au bureau des admins avec votre téléphone pour procéder au map ban.

        **Ban phase starts !**

        Please head to the admin office with your phone to proceed with the map ban.
        `,
        t2Link
      )

      return response.status(200).send('Messages sent')
    } catch (error) {
      return response.status(500).send(error.message)
    }
  }
}
