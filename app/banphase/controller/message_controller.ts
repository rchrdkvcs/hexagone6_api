import MessageService from '#discord/service/message_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class BanphaseMessageController {
  async execute({ request, response }: HttpContext) {
    const { team1, url1, channel1, role1, team2, url2, channel2, role2, urlLog } = request.all()
    const staffChannelId = '1196931570863452253'
    const staffRoleId = '1194673114798379108'

    if (
      !team1 ||
      !url1 ||
      !channel1 ||
      !role1 ||
      !team2 ||
      !url2 ||
      !channel2 ||
      !role2 ||
      !urlLog
    ) {
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
        url1,
        'Lien / Link'
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
        url2,
        'Lien / Link'
      )

      await new MessageService().send(
        staffChannelId,
        staffRoleId,
        `${team1} vs ${team2}`,
        `**La phase de ban commence !**

        Les équipes ${team1} et ${team2} ont été notifiées.

        Lien mapban équipe : [${team1}](${url1})
        Lien mapban équipe : [${team2}](${url2})
        `,
        urlLog,
        'Fichier de log'
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
