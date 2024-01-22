import { Client, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
import { cleanEnv, str } from 'envalid'

import { setBotListener } from './bot'
import { PingSlashCommand,testSlashCommand } from './commands/ping'
import { deploySlashCommands } from './deploy'
import { SlashCommand,SlashCommand1 } from './types/command'
import { AppConfig } from './types/config'
import test from 'node:test'

// Register commands
const commandList: Array<SlashCommand> = [PingSlashCommand]
const commandList1: Array<SlashCommand1> = [testSlashCommand]

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
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// Deploy commands to a Discord chat server
deploySlashCommands(appConfig, commandList)
  .then((response) => console.log(`Deploy ${response.length} commands: ${response.map((c) => c.name)} successfully!`))
  .catch((reason) => console.log(`Failed to deploy commands: ${reason}`))
deploySlashCommands(appConfig, commandList1)
  .then((response) => console.log(`Deploy ${response.length} commands: ${response.map((c) => c.name)} successfully!`))
  .catch((reason) => console.log(`Failed to deploy commands: ${reason}`))

// Add event listener from discord
setBotListener(client, commandList)
setBotListener(client, commandList1)

// Logs the client in, establishing a WebSocket connection to Discord.
client
  .login(appConfig.token)
  .then(() => console.log(`Login successfully!`))
  .catch((reason) => console.log(`Failed to login: ${reason}`))
