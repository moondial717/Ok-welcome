import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder} from 'discord.js'
import { SlashSubCommand } from '../types/command'
import { Sequelize, DataTypes } from 'sequelize'
import { Table } from 'embed-table';
import { catchurl } from './ask';

export const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

export const Tags = sequelize.define('tags', {
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        unique: 'tagIndex',
    },
    type: DataTypes.STRING,
    private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    question: DataTypes.TEXT,
    answer: DataTypes.TEXT,
    username: DataTypes.STRING,
    usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['guildId', 'name'],
            name: 'tagIndex'
        }
    ]
});

export const Questions = sequelize.define('allquestions', {
    username: DataTypes.STRING,
    question: DataTypes.TEXT,
    name: DataTypes.STRING,
  });
  (async () => {
    try {
      // Sync the model to the database to ensure the "allquestions" table is created
      await sequelize.sync();
      console.log('Database synced successfully.');
    } catch (error) {
      console.error('Error syncing database:', error);
    }
  })();

export const TagSlashCommand: SlashSubCommand= {
    data: new SlashCommandBuilder().setName('tag').setDescription('使用問題標籤')
    .addSubcommand(createAddSubcommand().setName('add'))
    .addSubcommand(createFetchSubcommand().setName('fetch'))
    .addSubcommand(createShowSubcommand().setName('show'))
    .addSubcommand(createRemoveSubcommand().setName('remove'))
    .addSubcommand(createEditSubcommand().setName('edit'))
    .addSubcommand(createInfoSubcommand().setName('info'))
    .addSubcommand(createAddSubcommand().setName('a'))
    .addSubcommand(createFetchSubcommand().setName('f'))
    .addSubcommand(createShowSubcommand().setName('s'))
    .addSubcommand(createRemoveSubcommand().setName('r'))
    .addSubcommand(createEditSubcommand().setName('e'))
    .addSubcommand(createInfoSubcommand().setName('i'))
    ,async execute(interaction) {
        let name: string;
        let question: string;
        let answer: string;
        let editname: string;
        let private_: boolean = false;
        let type: string;
        switch (interaction.options.getSubcommand()) {
            case 'add': case 'a':
                name = interaction.options.getString('name')!;
                question = interaction.options.getString('question')!;
                answer = interaction.options.getString('answer')!;
                type = interaction.options.getString('type')!;
                if(interaction.options.getBoolean('private') != null){
                    private_ = interaction.options.getBoolean('private')!;
                }
                await addTag(interaction, name, type, question, answer, private_);
                break;
            case 'fetch': case 'f':
                name = interaction.options.getString('name')!;
                await fetchTag(interaction, name);
                break;
            case 'show': case 's':
                await showTags(interaction);
                break;
            case 'remove': case 'r':
                name = interaction.options.getString('name')!;
                await removeTag(interaction, name);
                break;
            case 'edit': case 'e':
                name = interaction.options.getString('name')!;
                question = interaction.options.getString('question')!;
                answer = interaction.options.getString('answer')!;
                editname = interaction.options.getString('editname')!;
                await editTag(interaction, name, question, answer, editname);
                break;
            case 'info': case 'i':
                name = interaction.options.getString('name')!;
                await infoTag(interaction, name);
                break;
            default:
                await interaction.reply('Unknown subcommand.');
                break;
        }
    }
}

const addTag =
    async (interaction: ChatInputCommandInteraction, name: string, type: string, question: string, answer: string, private_: boolean) =>
    {
        try {
            // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
            const tag = await Tags.create({
                name: name,
                type: type,
                question: question,
                answer: answer,
                username: interaction.user.username,
                private: private_,
                guildId: interaction.guildId
            });
            const existQ = await Questions.findOne({ where: { question: question }});
            if (existQ?.get('name') != null) {
                const existStr = existQ.get('name');
                await Questions.update({ name: `${existStr}, ${name}`}, { where: { question: question } });
            } else {
                await Questions.update({ name: tag.get('name')}, { where: { question: question } });
            }
            await interaction.reply({content:`Tag ${tag.get('name')} added.`, ephemeral: true });
        }
        catch (e:any) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                await interaction.reply({content:'That tag already exists.', ephemeral: true });
            }else{
                await interaction.reply({content: 'Something went wrong with adding a tag.', ephemeral: true});
            }
        }
    }

const fetchTag =
    async (interaction: ChatInputCommandInteraction, name: string) =>
    {
        if(!await checkPrivate(interaction, name)){
            await interaction.reply({content: `Could not find tag ${name} or it is private`, ephemeral: true});
            return;
        }
        // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
        const tag: any = await Tags.findOne({ where: { name: name, guildId: interaction.guildId } });
        
        if(tag.get('private') && tag.get('username') != interaction.user.username){
            await interaction.reply({content: `Could not find tag ${name} or it is private`, ephemeral: true});
            return;
        }

        if (tag) {
            // equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
            tag.increment('usage_count');
            const embed = await catchurl(tag.get('answer').toString());
            await interaction.reply({content: `問題: ${tag.get('question').toString()}\n回答: \n${tag.get('answer').toString()}`, embeds:[embed], ephemeral: true });
        }
        else {
            await interaction.reply({content:`Could not find tag: ${name}`, ephemeral: true});
        }
    }

const showTags =
    async (interaction: ChatInputCommandInteraction) =>
    {
        // equivalent to: SELECT name FROM tags;
        //If username is null, show all tags, else show tags of the user
        let tagList: any;
        let num: number;
        let username: string;
        let title: string;
        let type: string;


        if(interaction.options.getString('username') == null){
            title = '標籤列表';
            if(interaction.options.getString('type') != null){
                type = interaction.options.getString('type')!;
                tagList = await Tags.findAll({ attributes: ['name','usage_count','username'] ,order: [['usage_count','DESC']] ,where: { guildId: interaction.guildId ,type: type} });
            }else{
                tagList = await Tags.findAll({ attributes: ['name','usage_count','username'] ,order: [['usage_count','DESC']] ,where: { guildId: interaction.guildId }});
            }
        }else{
            username = interaction.options.getString('username')!;

            //If input is s, show tags of the user
            if(username == 's'){
                username = interaction.user.username;
            }

            title = `${username}的標籤列表`;

            if(interaction.options.getString('type') != null){
                type = interaction.options.getString('type')!;
                tagList = await Tags.findAll({ attributes: ['name','usage_count','username'] ,order: [['usage_count','DESC']], where: { guildId: interaction.guildId, username: username ,type: type} });
            }else{
                tagList = await Tags.findAll({ attributes: ['name','usage_count','username'] ,order: [['usage_count','DESC']], where: { guildId: interaction.guildId, username: username } });
            }
        }


        if(tagList.length == 0){
            await interaction.reply(':x: 無標籤或該使用者沒有建立標籤!');
            return;
        }

        const tagname = tagList.map((t: any) => t.name);
        const tagusage = tagList.map((t: any) => t.usage_count);
        const user = tagList.map((t: any) => t.username);
        const number = interaction.options.getString('number')!;

        const table = new Table({
            titles : ['使用次數','建立者','標籤'],
            titleIndexes : [0,10,68],
            columnIndexes : [0,11,44],
            start: '`',
            end: '`',
            padEnd: 30
        });


        //If number is null, show all tags
        if(number != null){
            num = parseInt(number);
            if(num > tagList.length){
                for(let i = 0; i < tagList.length; i++){
                    table.addRow([tagusage[i].toString(),tagname[i],user[i]]);
                }
            }
            for(let i = 0; i < num; i++){
                table.addRow([tagusage[i].toString(),user[i],tagname[i]]);
            }
        }else{
            num = tagList.length;
            for(let i = 0; i < tagList.length; i++){
                table.addRow([tagusage[i].toString(),user[i],tagname[i]]);
            }
        }

        const embed = new EmbedBuilder()
        .setFields(table.toField(),{name:`顯示前${num}筆標籤`,value:'\u200B'})
        .setTitle(title)
        .setColor('#9cd6b7')
        .setTimestamp();
        await interaction.reply({embeds: [embed] , ephemeral: true});
    }

const removeTag =
    async (interaction: ChatInputCommandInteraction, name: string) =>
    {
        if(!await checkPrivate(interaction, name)){
            await interaction.reply({content: `Could not find tag ${name} or it is private`, ephemeral: true});
            return;
        }

        // equivalent to: DELETE from tags WHERE name = ?;
        const rowCount = await Tags.destroy({ where: { guildId: interaction.guildId ,name: name } });
        if (!rowCount) await interaction.reply({content: 'That tag did not exist.', ephemeral: true});

        await interaction.reply({content: 'Tag deleted.', ephemeral: true});
    }

const editTag =
    async (interaction: ChatInputCommandInteraction, name: string, question: string, answer: string, editname: string) =>
    {
        if(!await checkPrivate(interaction, name)){
            await interaction.reply({content: `Could not find tag ${name} or it is private`, ephemeral: true});
            return;
        }

        let affectedRows: any;
        // equivalent to: UPDATE tags SET description = ? WHERE name = ?;
        if(question == null && answer == null && editname == null){
            await interaction.reply({content: 'You need to provide question or answer to edit.', ephemeral: true});
            return;
        }

        let updateData: any = {
            question: question,
            answer: answer,
            name: editname
        };

        // Remove null properties
        for (let prop in updateData) {
            if (updateData[prop] === null) {
                delete updateData[prop];
            }
        }

        affectedRows = await Tags.update(updateData, { where: { guildId: interaction.guildId ,name: name } });

        if (affectedRows[0] > 0) {
            await interaction.reply({content:`Tag ${name} was edited.`, ephemeral: true});
        }
        else {
            await interaction.reply({content:`Could not find a tag with name ${name}.`, ephemeral: true});
        }
    }

const infoTag =
    async (interaction: ChatInputCommandInteraction, name: string) =>
    {
        if(!await checkPrivate(interaction, name)){
            await interaction.reply({content: `Could not find tag ${name} or it is private`, ephemeral: true});
            return;
        }

        // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
        const tag: any = await Tags.findOne({ where: { guildId: interaction.guildId ,name: name } });
        if (tag) {
            const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`標籤: ${tag.get('name').toString()}`)
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()!})
            .addFields(
                { name: '問題', value: `-${tag.get('question').toString()}-` }
            )
            .addFields(
                { name: '回答', value: tag.get('answer').toString() }
            )
            .addFields({ name:'\u200B', value:'\u200B' }) // This adds an empty line
            .addFields(
                { name: '建立者', value: tag.get('username').toString() , inline: true},
                { name: '使用次數', value: tag.get('usage_count').toString() , inline: true},
                { name: '建立時間', value: tag.get('createdAt').toString() },
                { name: '最後更新時間', value: tag.get('updatedAt').toString() },
            ).setTitle('標籤資訊');

        await interaction.reply({ embeds: [embed] , ephemeral: true});
        }
        else {
            await interaction.reply({content: `Could not find tag: ${name}`, ephemeral: true});
        }
    }

async function checkPrivate(interaction: ChatInputCommandInteraction, name: string){
    const private_: any = await Tags.findOne({attributes:['private','username'], where: { guildId: interaction.guildId ,name: name } });
    if(private_ == null){
        return false;
    }
    if(private_.get('private') && private_.get('username') != interaction.user.username){
        return false;
    }
    return true;
}

function createAddSubcommand() {
    return new SlashCommandSubcommandBuilder()
        .setDescription('新增問題標籤')
        .addStringOption(option =>
            option.setName('name').setDescription('The name of the tag').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type').setDescription('The type of the question(sop,maunal,spec or NA)').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('question').setDescription('The question of the tag').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('answer').setDescription('The answer of the question').setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('private').setDescription('The tag is private or not(default:0)').setRequired(false)
        );
}

function createFetchSubcommand() {
    return new SlashCommandSubcommandBuilder()
        .setDescription('取得問題')
        .addStringOption(option =>
            option.setName('name').setDescription('The name of the tag').setRequired(true)
        );
}

function createShowSubcommand() {
    return new SlashCommandSubcommandBuilder()
        .setDescription('顯示問題列表')
        .addStringOption(option =>
            option.setName('number').setDescription('欲顯示幾筆').setRequired(false)
        )
        .addStringOption(option =>
            option.setName('username').setDescription('The user you want to check, type s for yourself').setRequired(false)
        )
        .addStringOption(option =>
            option.setName('type').setDescription('The type of question').setRequired(false)
        );
}

function createRemoveSubcommand() {
    return new SlashCommandSubcommandBuilder()
        .setDescription('移除問題標籤')
        .addStringOption(option =>
            option.setName('name').setDescription('The name of the tag').setRequired(true)
        );
}

function createEditSubcommand() {
    return new SlashCommandSubcommandBuilder()
        .setDescription('編輯問題標籤')
        .addStringOption(option =>
            option.setName('name').setDescription('The name of the tag').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('question').setDescription('The question you want change to').setRequired(false)
        )
        .addStringOption(option =>
            option.setName('answer').setDescription('The answer you want change to').setRequired(false)
        )
        .addStringOption(option =>
            option.setName('editname').setDescription('The tag name you want change to').setRequired(false)
        );
}

function createInfoSubcommand() {
    return new SlashCommandSubcommandBuilder()
        .setDescription('取得問題標籤資訊')
        .addStringOption(option =>
            option.setName('name').setDescription('The name of the tag').setRequired(true)
        )
}
