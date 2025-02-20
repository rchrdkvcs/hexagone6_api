import DiscordClientProvider from '#discord/provider/discord_client_provider'
import env from '#start/env'
import TeamsService from '#teams/service/teams_service'

export default class PlayersService {
  public async Players() {
    const client = await DiscordClientProvider.Client()
    const guild = await client.guilds.fetch(env.get('DISCORD_GUILD_ID'))
    const members = await guild.members.fetch()

    // Récupérer les données des équipes
    const teamsService = new TeamsService()
    const teamsData = await teamsService.Teams()

    // Filtrer les joueurs
    const players = members.filter((member) => {
      return member.roles.cache.has(env.get('DISCORD_PLAYER_ROLE_ID'))
    })

    // Associer chaque joueur à son équipe
    const playersData = players.map((player) => {
      // Trouver l'équipe du joueur
      const playerTeam = teamsData.find((team) => player.roles.cache.has(team.roleId))

      return {
        id: player.id,
        user: player.user.username,
        displayName: player.displayName,
        avatar: player.user.displayAvatarURL(),
        role: player.roles.cache.has(env.get('DISCORD_COACH_ROLE_ID')) ? 'Capitaine' : 'Joueur',
        teamChannelId: playerTeam?.channelId || '', // Ajouter teamChannelId
        teamRoleId: playerTeam?.roleId || '', // Ajouter teamRoleId
      }
    })

    return playersData
  }
}
