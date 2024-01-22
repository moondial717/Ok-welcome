import { CommandInteraction,ChatInputCommandInteraction,SlashCommandBuilder } from 'discord.js'

export interface SlashCommand {
  data: SlashCommandBuilder
  execute: (interaction: CommandInteraction) => Promise<void>
}
export interface SlashCommand1 {
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}
