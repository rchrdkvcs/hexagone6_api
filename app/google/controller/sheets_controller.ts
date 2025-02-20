import GoogleSheetProvider from '#google/provider/google_sheet_provider'
import PlayersService from '#players/service/players_service'
import TeamsService from '#teams/service/teams_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class SheetsController {
  async execute({ response }: HttpContext) {
    const sheet = await GoogleSheetProvider.Sheet()
    const teams = await new TeamsService().Teams()
    const teamsValues = teams.map((team) => [team.channelId, team.roleId, team.name])
    const players = await new PlayersService().Players()
    const playersValues = players.map((player) => [
      player.id,
      player.user,
      player.displayName,
      player.avatar,
      player.role,
      player.teamChannelId,
      player.teamRoleId,
    ])

    const spreadsheetId = '1ixO4Fitj3AS3lijki854eevTEMYjfgTrnzqB_GHLSI4'
    const teamsRange = 'Datas!B4:D'
    const playersRange = 'Datas!F4:L'

    try {
      // Clear and update the teams data
      await sheet.spreadsheets.values.clear({
        spreadsheetId,
        range: teamsRange,
      })

      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: teamsRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: teamsValues,
        },
      })

      // Clear and update the players data
      await sheet.spreadsheets.values.clear({
        spreadsheetId,
        range: playersRange,
      })

      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: playersRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: playersValues,
        },
      })

      // Update the last update date
      await sheet.spreadsheets.values.update({
        spreadsheetId,
        range: 'Datas!N3',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              new Date().toLocaleString('fr-FR', {
                timeZone: 'Europe/Paris',
                dateStyle: 'full',
                timeStyle: 'short',
              }),
            ],
          ],
        },
      })
    } catch (error) {
      console.log(error)
      return response.status(500).json({ error: 'Something went wrong' })
    }

    return response.status(200).json({ message: 'Spreadsheet successfully updated' })
  }
}
