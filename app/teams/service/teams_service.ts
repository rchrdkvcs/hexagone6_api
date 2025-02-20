import env from '#start/env'
import DiscordClientProvider from '../../discord/provider/discord_client_provider.js'

export default class TeamsService {
  private nameParser(name: string | undefined) {
    if (!name) {
      return ''
    }

    let parsedName = name.replace(/-/g, ' ')
    parsedName = parsedName.replace(/\b\w/g, (char) => char.toUpperCase())

    return parsedName
  }

  public async Teams() {
    const client = await DiscordClientProvider.Client()
    const guild = await client.guilds.fetch(env.get('DISCORD_GUILD_ID'))
    const roles = await guild.roles.fetch()
    const channels = await guild.channels.fetch()

    // Filtrer les rôles pour ne garder que ceux des équipes
    const teams = Array.from(roles.values())
      .filter((role) => role.rawPosition > 4 && role.rawPosition < 27)
      .sort((a, b) => a.rawPosition - b.rawPosition)

    // Récupérer les membres
    const members = await guild.members.fetch()

    // Créer les données des équipes
    const teamsData = teams.reverse().map((team) => {
      const channel = channels.find((c) => c?.permissionOverwrites.cache.has(team.id))

      // Assurer que le canal est défini
      const channelId = channel?.id || ''

      return {
        channelId: channelId,
        roleId: team.id,
        name: this.nameParser(team.name),
        members: members
          .filter((member) => member.roles.cache.has(team.id))
          .map((member) => ({
            memberId: member.id,
            name: member.user.username,
            displayName: member.displayName,
            role: member.roles.cache.has(env.get('DISCORD_COACH_ROLE_ID')) ? 'Capitaine' : 'Joueur',
            avatar: member.user.displayAvatarURL(),
          })),
      }
    })

    return teamsData
  }
}
