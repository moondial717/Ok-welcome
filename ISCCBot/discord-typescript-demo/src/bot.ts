import { Client, Collection, Events, PermissionsBitField } from 'discord.js'

import { SlashCommand,SlashSubCommand } from './types/command'

import { Tags } from './commands/tag'

export function setBotListener(client: Client, commandList: Array<SlashCommand|SlashSubCommand>) {
  const commands = new Collection<string, SlashCommand|SlashSubCommand>(commandList.map((c) => [c.data.name, c]))

  client.once(Events.ClientReady, () => {
    Tags.sync();
    console.log('Bot Ready!')
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const command = commands.get(interaction.commandName)

    if (!command) return

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true
      })
    }
  })

  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Something went wrong when fetching the message: ', error);
        return;
      }
    }
    if (reaction.message.author === null || reaction.message.guild === null || reaction.message.content === null) return; // Add this line to check if reaction.message.author is null
    if (reaction.emoji.name === '☑️') {
      const member = await reaction.message.guild.members.fetch(user.id);
      if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        let lines = reaction.message.content.split('\n');
        let firstLine = lines[0];
        let question = firstLine.slice(7, firstLine.length);
        let remainingLines = lines.slice(1).join('\n');
        let channel = reaction.message.guild.channels.cache.find(channel => channel.name === '指令')!;
        if(channel.isTextBased()){
          channel.send(`<@${user.id}> 若想為此問題建立標籤，請輸入指令:`);
          channel.send(`/tag add name: question:${question} answer:${remainingLines}`);
        }
      }
    }
  })
}
