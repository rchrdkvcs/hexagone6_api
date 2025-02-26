import DiscordClientProvider from '#discord/provider/discord_client_provider'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from 'discord.js'
import { error } from 'node:console'

export default class MessageService {
  public async send(
    channelId: string,
    roleId: string,
    msgTitle: string,
    msgContent: string,
    msgLink: string,
    linkLabel: string
  ) {
    const client = await DiscordClientProvider.Client()
    const channel = await client.channels.fetch(channelId)

    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error('Canal introuvable ou non textuel.')
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle(msgTitle)
        .setDescription(msgContent)
        .setColor('#0099ff')
        .setFooter({ text: 'Hexagone 6' })

      const link = new ButtonBuilder()
        .setLabel(linkLabel)
        .setStyle(ButtonStyle.Link)
        .setURL(msgLink)

      const row = new ActionRowBuilder().addComponents(link)

      // @ts-ignore
      await channel.send({ content: `<@&${roleId}>`, embeds: [embed], components: [row] })
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", error)
      throw new Error("Échec de l'envoi du message.")
    }
  }
}
