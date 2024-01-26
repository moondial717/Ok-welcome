import { Client, Collection, Events, PermissionsBitField } from 'discord.js'
import { SlashCommand,SlashSubCommand } from './types/command'
import { Tags, Questions } from './commands/tag'
import { detecturlfile } from './commands/uploadfile'
import { pythonProcessQuestion, catchurl } from './commands/ask'

export function setBotListener(client: Client, commandList: Array<SlashCommand|SlashSubCommand>) {
  const commands = new Collection<string, SlashCommand|SlashSubCommand>(commandList.map((c) => [c.data.name, c]))

  client.once(Events.ClientReady, () => {
    Tags.sync();
    console.log('Bot Ready!')
  })

  // new user
  client.on(Events.GuildMemberAdd, async (member) => {
    console.log('new person');
    const welcomeChannel = member.guild.systemChannel; // 或者你可以使用其他频道
    if (welcomeChannel) {
      try {
        await welcomeChannel.send(`歡迎 ${member.user.username} 加入本伺服器！請查閱基本指引。`);
      } catch (error) {
        console.error('Error sending welcome message:', error);
      }
    }
  })

  // depart
  client.on(Events.GuildMemberRemove, async (member) => {
    try {
      console.log('remove');
      console.log(member.user.username);
      // Delete user's data from the Questions table when they leave the guild
      await Questions.destroy({
        where: {
          username: member.user.username,
        },
      });
      console.log(`Deleted data for user ${member.user.username} on guild ${member.guild.id}`);
    } catch (error) {
      console.error('Error deleting user data:', error);
    }
  });

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

    if (user.bot) return;

    if(reaction.emoji.name === '❌'){
      if (reaction.message.content) {
        const content = reaction.message.content.split('\n');
        const getquestion = content[0];
        const colonIndex = getquestion.indexOf(":") + 1;
        const question = getquestion.slice(colonIndex).trim();
      
        await Questions.destroy({
          where: {
            username: user.username,
            question: question,
          },
        });
      }

      reaction.message.delete();
      return;
    }

    if (!reaction.message?.author || !reaction.message?.guild) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    if(reaction.emoji.name === '📌' && member.permissions.has(PermissionsBitField.Flags.Administrator)){
      detecturlfile(reaction);
    }
    

    if (!reaction.message?.content) return;

    if(reaction.emoji.name === '🔧'){
      let lines = reaction.message.content.split('\n');
      let firstLine = lines[0];
      if (!firstLine.startsWith('你的問題是:')) return;
      
      reaction.message.edit('處理中...');
      let question = firstLine.slice(7, firstLine.length);
      let result = await pythonProcessQuestion(question);
      const embed = await catchurl(result);
      reaction.users.remove(user.id);
      reaction.message.edit({content: result, embeds: [embed]});
    }

    if (reaction.emoji.name === '☑️') {
      if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        let lines = reaction.message.content.split('\n');
        let firstLine = lines[0];

        if (!firstLine.startsWith('你的問題是:')) return;

        let question = firstLine.slice(7, firstLine.length);
        let remainingLines = lines.slice(1).join('\n');
        let channel = reaction.message.guild.channels.cache.find(channel => channel.name === '指令')!;
        if(channel.isTextBased()){
          channel.send(`<@${user.id}> 若想為此問題建立標籤，請輸入指令:`);
          channel.send(`/tag add name: type: question:${question} answer:${remainingLines}`);
        }
      }
    }
  })
}
