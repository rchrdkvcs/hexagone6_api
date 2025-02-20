import env from '#start/env'
import { Client, GatewayIntentBits } from 'discord.js'

export default class DiscordClientProvider {
  static async Client() {
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    })

    await client.login(env.get('DISCORD_BOT_TOKEN'))

    return client
  }
}
