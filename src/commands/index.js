
import { EmbedBuilder } from 'discord.js'
import { createAudioPlayer, createAudioResource, joinVoiceChannel, getVoiceConnection, StreamType, NoSubscriberBehavior, AudioPlayerStatus } from '@discordjs/voice'
import RealTimeAPI from '../brains/RealTimeAPI.js'
import StreamDiscordDecoder from '../brains/StreamDiscordDecoder.js'
import StreamDiscordEncoder from '../brains/StreamDiscordEncoder.js'
import PlayStreamToSpeaker from '../../dev_streams/PlayStreamToSpeaker.js'


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
      adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator,
      selfDeaf: false,
    })

    const inputAudioStream = connection.receiver.subscribe(interaction.member.id)
    const opusDecoder = new StreamDiscordDecoder(inputAudioStream)
    const decodedAudioStream = opusDecoder.outputAudioStream

    // PlayStreamToSpeaker(opusDecoder.outputAudioStream2, { channels: 1, sampleRate: 24000 });


    const streamRealTimeAPI = new RealTimeAPI(decodedAudioStream);
    const streamRealTimeOutput = streamRealTimeAPI.getNewFinalStream();


    const audioEncoder = new StreamDiscordEncoder(streamRealTimeOutput)
    const encodedAudioStream = audioEncoder.outputAudioStream

    // PlayStreamToSpeaker(audioEncoder.outputAudioStream2, { channels: 2, sampleRate: 48000 });

    const tempStream = audioEncoder.getNewTempStream();

    const resource = createAudioResource(tempStream, {
      inputType: StreamType.Raw,
    })

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Continue,
      },
    })

    player.on('error', error => {
      console.error('Error:', error.message, 'with track');
    });

    player.on(AudioPlayerStatus.Idle, () => {
      console.log('Idle');
      const tempStream = audioEncoder.getNewTempStream();
      const resource = createAudioResource(tempStream, {
        inputType: StreamType.Raw,
      })
      
      player.play(resource);
    });

    player.play(resource)
    connection.subscribe(player)

    console.log('Launched');
  
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
