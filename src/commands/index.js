
import { createAudioPlayer, createAudioResource, joinVoiceChannel, getVoiceConnection } from '@discordjs/voice'

class Commands {

  static async ping(interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder().setDescription(`**Pong!**`)
      ]
    })
  }

  static async come(interaction) {
    if (!interaction.member.voice.channel) {
      const embed = new EmbedBuilder().setDescription(`**Come to channel!**`)
      return await interaction.reply({
        embeds: [embed]
      })
    }

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.member.voice.channel.guild.id,
      adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator
    })

    const player = createAudioPlayer()
    player.play(resource)
    connection.subscribe(player)
  
    const embed = new EmbedBuilder().setDescription(`**Im here**`)
    await interaction.reply({
      embeds: [embed]
    })
  }

  
  static async goaway(interaction) {
    getVoiceConnection(interaction.member.guild.id).disconnect()
  
    const embed = new EmbedBuilder().setDescription(`**Disconnected**`)
  
    await interaction.reply({
      embeds: [embed]
    })
  }

}

export default Commands
