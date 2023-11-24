
import config from './config/index.js'
import Commands from './src/commands/index.js'
import { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } from 'discord.js'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates
  ]
})

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'come',
    description: 'Connects to your voice channel!',
  },
  {
    name: 'goaway',
    description: 'Disconnects from your voice channel!'
  }
]

const rest = new REST({ version: '10' }).setToken(config.discordBotToken)

try {
  console.log('Started refreshing application (/) commands.')

  await rest.put(Routes.applicationCommands(config.discordClientId), {
    body: commands
  })

  console.log('Successfully reloaded application (/) commands.')
} catch (error) {
  console.error(error)
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  try {
    await Commands[interaction.commandName](interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply({
      embeds: [
        new EmbedBuilder().setDescription(`**${error}**`)
      ]
    })
  }
})

client.login(config.discordBotToken)
