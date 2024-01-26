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
        .addSubcommand(subcommand =>
            subcommand.setName('edit').setDescription('How to edit a tag.')
        )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('info').setDescription('Check more information on the website.')
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
        .setColor('#fca7be')
        if(subcommandGroup === 'tag'){
            if(subcommand === 'add'){
                embed.setTitle('Help - Tag - Add');
                embed.setDescription(
                    `功能: 新增一個標籤
                    /tag add <name> <question> <answer> <type> <private>
                    /tag add 等同於 /tag a`
                );
                embed.addFields(
                    {name: 'name', value: '欲設定的標籤名稱 : 必要', inline: true},
                    {name: 'question', value: '欲設定的問題 : 必要', inline: true},
                    {name: 'answer', value: '欲設定的答案 : 必要', inline: true},
                    {name: 'type', value: '問題的類型 : 必要', inline: true},
                    {name: 'private', value:`標籤是否為私人 : 非必要, 預設為公開\n若為私人則其他使用者無法使用對此標籤使用以下指令\n- /tag fetch\n- /tag info\n- /tag edit\n- /tag remove`}
                )
            }
            else if(subcommand === 'remove'){
                embed.setTitle('Help - Tag - Remove');
                embed.setDescription(
                    `功能: 移除一個標籤, 若標籤為私人則僅能由標籤建立者移除
                    /tag remove <name>
                    /tag remove 等同於 /tag r `
                );
                embed.addFields(
                    {name: 'name', value: '欲移除的標籤名稱 : 必要', inline: true},
                )
            }
            else if(subcommand === 'show'){
                embed.setTitle('Help - Tag - Show');
                embed.setDescription(
                    `功能: 顯示標籤列表
                    若未設定options則顯示所有標籤, 若設定options則顯示符合options的標籤, 依照使用次數排序
                    /tag show <username> <type> <number>
                    /tag show 等同於 /tag s `
                );
                embed.addFields(
                    {name: 'username', value: '欲篩選的使用者名稱 : 非必要', inline: true},
                    {name: 'type', value: '欲篩選的問題類型 : 非必要', inline: true},
                    {name: 'number', value: '僅顯示前N筆標籤 : 非必要', inline: true}
                )
            }
            else if(subcommand === 'info'){
                embed.setTitle('Help - Tag - Info');
                embed.setDescription(
                    `功能: 顯示標籤的詳細資訊, 若標籤為私人則僅能由標籤建立者查看
                    /tag info <name>
                    /tag info 等同於 /tag i `
                );
                embed.addFields(
                    {name: 'name', value: '欲顯示的標籤名稱 : 必要', inline: true}
                )
            }
            else if(subcommand === 'fetch'){
                embed.setTitle('Help - Tag - Fetch');
                embed.setDescription(
                    `功能: 顯示標籤的問題和回覆, 若標籤為私人則僅能由標籤建立者查看
                    /tag fetch <name>
                    /tag fetch 等同於 /tag f `
                );
                embed.addFields(
                    {name: 'name', value: '欲顯示的標籤名稱 : 必要', inline: true}
                )
            }
            else if(subcommand === 'edit'){
                embed.setTitle('Help - Tag - Edit');
                embed.setDescription(
                    `功能: 編輯標籤內容或名稱, 若標籤為私人則僅能由標籤建立者編輯
                    /tag edit <name> <question> <answer> <editname>
                    /tag edit 等同於 /tag e `
                );
                embed.addFields(
                    {name: 'name', value: '欲編輯的標籤名稱 : 必要', inline: true},
                    {name: 'question', value: '欲設定的問題 : 非必要', inline: true},
                    {name: 'answer', value: '欲設定的答案 : 非必要', inline: true},
                    {name: 'editname', value: '欲設定的標籤名稱 : 非必要', inline: true}
                )
            }
            else if(subcommand === 'all'){
                embed.setTitle('Help - Tag - All');
                embed.setDescription(
                    `顯示所有標籤相關的指令
                    /tag add : 新增一個標籤
                    /tag fetch : 顯示標籤的問題和回覆
                    /tag info : 顯示標籤的詳細資訊
                    /tag remove : 移除一個標籤
                    /tag show : 顯示標籤列表
                    /tag edit : 編輯一個標籤`
                );
            }
        }
        else if(subcommand === 'info'){
            embed.setTitle('Help - Info');
            embed.setDescription('你可以在網站上查看更多資訊:\nhttps://hackmd.io/aTB4xv92TiqJE58ca1xjpw');

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