import { Client, GatewayIntentBits, Partials } from 'discord.js'
import dotenv from 'dotenv'
import { cleanEnv, str } from 'envalid'

import { setBotListener } from './bot'
import { PingSlashCommand,testSlashCommand } from './commands/ping'
import { AllQuestionsSlashCommand } from './commands/all'
import { TagSlashCommand} from './commands/tag'
import { deploySlashCommands } from './deploy'
import { SlashCommand,SlashSubCommand } from './types/command'
import { AppConfig } from './types/config'

// Register commands
const commandList: Array<SlashCommand> = [PingSlashCommand,testSlashCommand, AllQuestionsSlashCommand]
const subcommandList: Array<SlashSubCommand> = [TagSlashCommand]

// Combine commandList and subcommandList
const combinedList = [...commandList, ...subcommandList];
// Read .env file (if exist)
dotenv.config()

// Read environment variables
const env = cleanEnv(process.env, {
  TOKEN: str(),
  CLIENT_ID: str(),
  GUILD_ID: str()
})

// Construct the main config of this app
const appConfig: AppConfig = {
  token: env.TOKEN,
  clientId: env.CLIENT_ID,
  guildIds: env.GUILD_ID.split(',')
}

// DiscordJS API Client: https://discord.js.org/#/docs/discord.js/main/class/Client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction]
})

// Deploy commands to a Discord chat server
deploySlashCommands(appConfig, combinedList)
  .then((response) => console.log(`Deploy ${response.length} commands: ${response.map((c) => c.name)} successfully!`))
  .catch((reason) => console.log(`Failed to deploy commands: ${reason}`))

// Add event listener from discord
setBotListener(client, combinedList)

// Logs the client in, establishing a WebSocket connection to Discord.
client
  .login(appConfig.token)
  .then(() => console.log(`Login successfully!`))
  .catch((reason) => console.log(`Failed to login: ${reason}`))
