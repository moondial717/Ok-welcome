import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import { SlashSubCommand } from '../types/command'

export const helpSlashCommand: SlashSubCommand = {
    data: new SlashCommandBuilder().setName('help').setDescription('Help command.')
    .addSubcommandGroup(
        subcommandGroup =>
        subcommandGroup.setName('tag').setDescription('Tag group')
        .addSubcommand(subcommand =>
            subcommand.setName('add').setDescription('How to add a tag.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('remove').setDescription('How to remove a tag.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('show').setDescription('How to show the list of tags.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('info').setDescription('How to show the detail of a tag.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('fetch').setDescription('How to acquire the question and answer of a tag.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('all').setDescription('Show the list of tag subcommands.')
        )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('ask').setDescription('How to ask a question.')
    )
    .addSubcommand(subcommand =>
        subcommand.setName('all').setDescription('How to retrieve users questions.')
    ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const subcommandGroup = interaction.options.getSubcommandGroup(false);
        const embed = new EmbedBuilder()
        .setColor('#9cd6b7')
        if(subcommandGroup === 'tag'){
            if(subcommand === 'add'){
                embed.setTitle('Help - Tag - Add');
                embed.setDescription(
                    `/tag add <name> <question> <answer> <type> <private>
                    /tag add 等同於 /tag a`
                );
                embed.addFields(
                    {name: 'name', value: '欲設定的標籤名稱 : 必要', inline: true}
                )
                embed.addFields(
                    {name: 'question', value: '欲設定的問題 : 必要', inline: true}
                )
                embed.addFields(
                    {name: 'answer', value: '欲設定的答案 : 必要', inline: true}
                )
                embed.addFields(
                    {name: 'type', value: '問題的類型 : 必要', inline: true}
                )
                embed.addFields(
                    {name: 'private', value:`標籤是否為私人 : 非必要
                    若為私人則其他使用者無法使用對此標籤使用以下指令
                    - /tag fetch
                    - /tag info
                    - /tag edit
                    - /tag remove
                    預設為公開`}
                )
            }
            else if(subcommand === 'remove'){
                embed.setTitle('Help - Tag - Remove');
                embed.setDescription('To remove a tag, use the command `/tag remove <tag name>`.');
            }
            else if(subcommand === 'show'){
                embed.setTitle('Help - Tag - Show');
                embed.setDescription('To show the list of tags, use the command `/tag show`.');
            }
            else if(subcommand === 'info'){
                embed.setTitle('Help - Tag - Info');
                embed.setDescription('To show the detail of a tag, use the command `/tag info <tag name>`.');
            }
            else if(subcommand === 'fetch'){
                embed.setTitle('Help - Tag - Fetch');
                embed.setDescription('To acquire the question and answer of a tag, use the command `/tag fetch <tag name>`.');
            }
            else if(subcommand === 'all'){
                embed.setTitle('Help - Tag - All');
                embed.setDescription('To show the list of tag subcommands, use the command `/help tag`.');
            }
        }
        else if(subcommand === 'ask'){
            embed.setTitle('Help - Ask');
            embed.setDescription('To ask a question, use the command `/ask <question>`.');
        }
        else if(subcommand === 'all'){
            embed.setTitle('Help - All');
            embed.setDescription('To retrieve users questions, use the command `/all`.');
        }
        interaction.reply({embeds: [embed]});
    }

}