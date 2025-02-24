import MessageService from '#discord/service/message_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class BanphaseMessageController {
  async execute({ request, response }: HttpContext) {
    const { team1, url1, channel1, role1, team2, url2, channel2, role2 } = request.all()

    if (!team1 || !url1 || !channel1 || !role1 || !team2 || !url2 || !channel2 || !role2) {
      return response.status(400).send('Missing parameters')
    }

    try {
      await new MessageService().send(
        channel1,
        role1,
        `${team1} vs ${team2}`,
        `**La phase de ban commence !**

        Merci de vous diriger au bureau des admins avec votre téléphone pour procéder au map ban.

        **Ban phase starts !**

        Please head to the admin office with your phone to proceed with the map ban.
        `,
        url1
      )

      await new MessageService().send(
        channel2,
        role2,
        `${team2} vs ${team1}`,
        `**La phase de ban commence !**

        Merci de vous diriger au bureau des admins avec votre téléphone pour procéder au map ban.

        **Ban phase starts !**

        Please head to the admin office with your phone to proceed with the map ban.
        `,
        url2
      )

      return response.status(200).json({
        message: 'Messages sent',
        team1: { name: team1, url: url1, channel: channel1, role: role1 },
        team2: { name: team2, url: url2, channel: channel2, role: role2 },
      })
    } catch (error) {
      return response.status(500).json({ message: 'Error while sending messages' })
    }
  }
}
