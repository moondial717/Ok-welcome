import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder} from 'discord.js'
import { SlashSubCommand } from '../types/command'
import { Sequelize, DataTypes } from 'sequelize'
import { Table } from 'embed-table';

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

export const Tags = sequelize.define('tags', {
    name: {
        type: DataTypes.STRING,
        unique: true,
    },
    question: DataTypes.TEXT,
    answer: DataTypes.TEXT,
    username: DataTypes.STRING,
    usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});

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
        switch (interaction.options.getSubcommand()) {
            case 'add': case 'a':
                name = interaction.options.getString('name')!;
                question = interaction.options.getString('question')!;
                answer = interaction.options.getString('answer')!;
                await addTag(interaction, name, question, answer);
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
    async (interaction: ChatInputCommandInteraction, name: string, question: string, answer: string) =>
    {
        try {
            // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
            const tag = await Tags.create({
                name: name,
                question: question,
                answer: answer,
                username: interaction.user.username,
            });
            await interaction.reply(`Tag ${tag.get('name')} added.`);
        }
        catch (e:any) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                await interaction.reply('That tag already exists.');
            }else{
                await interaction.reply('Something went wrong with adding a tag.');
            }
        }
    }

const fetchTag =
    async (interaction: ChatInputCommandInteraction, name: string) =>
    {
        // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
        const tag: any = await Tags.findOne({ where: { name: name } });
        if (tag) {
            // equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
            tag.increment('usage_count');
            await interaction.reply(`問題: ${tag.get('question').toString()}\n回答: ${tag.get('answer').toString()}`);
        }
        else {
            await interaction.reply(`Could not find tag: ${name}`);
        }
    }

const showTags =
    async (interaction: ChatInputCommandInteraction) =>
    {
        // equivalent to: SELECT name FROM tags;
        const tagList = await Tags.findAll({ attributes: ['name','usage_count'] ,order: [['usage_count','DESC']] });
        const table = new Table({
            titles : ['使用次數','標籤'],
            titleIndexes : [0,10],
            columnIndexes : [0,12],
            start: '`',
            end: '`',
            padEnd: 10
        });
        const tagname = tagList.map((t: any) => t.name);
        const tagusage = tagList.map((t: any) => t.usage_count);
        const number = interaction.options.getString('number')!;
        let num: number;
        if(number != null){
            num = parseInt(number);
            if(num > tagList.length){
                for(let i = 0; i < tagList.length; i++){
                    table.addRow([tagusage[i].toString(),tagname[i]]);
                }
            }
            for(let i = 0; i < num; i++){
                table.addRow([tagusage[i].toString(),tagname[i]]);
            }
        }else{
            num = tagList.length;
            for(let i = 0; i < tagList.length; i++){
                table.addRow([tagusage[i].toString(),tagname[i]]);
            }
        }
        const embed = new EmbedBuilder()
        .setFields(table.toField(),{name:`顯示前${num}筆標籤`,value:'\u200B'})
        .setTitle('標籤列表')
        .setColor('#9cd6b7')
        .setTimestamp();
        //const tagString = tagList.map((t: any) => `${t.name} : ${t.usage_count}`).join('\n') || 'No tags set.';
        await interaction.reply({embeds: [embed] });
    }

const removeTag =
    async (interaction: ChatInputCommandInteraction, name: string) =>
    {
        // equivalent to: DELETE from tags WHERE name = ?;
        const rowCount = await Tags.destroy({ where: { name: name } });
        if (!rowCount) await interaction.reply('That tag did not exist.');

        await interaction.reply('Tag deleted.');
    }

const editTag =
    async (interaction: ChatInputCommandInteraction, name: string, question: string, answer: string, editname: string) =>
    {
        let affectedRows: any;
        // equivalent to: UPDATE tags SET description = ? WHERE name = ?;
        if(question == null && answer == null && editname == null){
            await interaction.reply('You need to provide question or answer to edit.');
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

        affectedRows = await Tags.update(updateData, { where: { name: name } });

        if (affectedRows[0] > 0) {
            await interaction.reply(`Tag ${name} was edited.`);
        }
        else {
            await interaction.reply(`Could not find a tag with name ${name}.`);
        }
    }

const infoTag =
    async (interaction: ChatInputCommandInteraction, name: string) =>
    {
        // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
        const tag: any = await Tags.findOne({ where: { name: name } });
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

        await interaction.reply({ embeds: [embed] });
        }
        else {
            await interaction.reply(`Could not find tag: ${name}`);
        }
    }

function createAddSubcommand() {
    return new SlashCommandSubcommandBuilder()
        .setDescription('新增問題標籤')
        .addStringOption(option =>
            option.setName('name').setDescription('The name of the tag').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('question').setDescription('The question of the tag').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('answer').setDescription('The answer of the question').setRequired(true)
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
        );
}

/*
export const tagSlashCommand: SlashSubCommand = {
    data: new SlashCommandBuilder().setName('tag').setDescription('取得已回復問題和回答')
    .addSubcommand(subcommand =>
        subcommand.setName('fetch').setDescription('取得問題')
        .addStringOption(option =>
            option.setName('name').setDescription('The name of the tag').setRequired(true)
        )
    ),
    async execute(interaction) {
        const tagName = interaction.options.getString('name')!;
        // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
        const tag: any = await Tags.findOne({ where: { name: tagName } });
        if (tag) {
            // equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
            tag.increment('usage_count');

            await interaction.reply(tag.get('description').toString());
        }
        else {
            await interaction.reply(`Could not find tag: ${tagName}`);
        }
    }
}

export const removeTagSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder().setName('removetag').setDescription('Remove a tag')
    .addStringOption(option =>
        option.setName('name').setDescription('The name of the tag').setRequired(true)
    ),
    async execute(interaction) {
        const tagName = interaction.options.getString('name')!;
        // equivalent to: DELETE from tags WHERE name = ?;
        const rowCount = await Tags.destroy({ where: { name: tagName } });
        if (!rowCount) await interaction.reply('That tag did not exist.');

        await interaction.reply('Tag deleted.');
    }
}

export const showTagsSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder().setName('showtags').setDescription('Show all tags'),
    async execute(interaction) {
        // equivalent to: SELECT name FROM tags;
        const tagList = await Tags.findAll({ attributes: ['name'] ,order: ['usage_count','DESC'] });
        const tagString = tagList.map((t: any) => t.name).join(', ') || 'No tags set.';
        await interaction.reply(`List of tags: ${tagString}`);
    }
}

export const editTagSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder().setName('edittag').setDescription('Edit a tag')
    .addStringOption(option =>
        option.setName('name').setDescription('The name of the tag').setRequired(true)
    )
    .addStringOption(option =>
        option.setName('description').setDescription('你想更改的描述').setRequired(true)
    ),
    async execute(interaction) {
        const tagName = interaction.options.getString('name')!;
        const tagDescription = interaction.options.getString('description')!;
        // equivalent to: UPDATE tags SET description = ? WHERE name = ?;
        const affectedRows = await Tags.update({ description: tagDescription }, { where: { name: tagName } });
        if (affectedRows[0] > 0) {
            await interaction.reply(`Tag ${tagName} was edited.`);
        }
        else {
            await interaction.reply(`Could not find a tag with name ${tagName}.`);
        }
    }
}

export const infoTagSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder().setName('taginfo').setDescription('get tag info')
    .addStringOption(option =>
        option.setName('name').setDescription('The name of the tag').setRequired(true)
    ),
    async execute(interaction) {
        const tagName = interaction.options.getString('name')!;
        // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
        const tag: any = await Tags.findOne({ where: { name: tagName } });
        if (tag) {
            await interaction.reply(`Tag name: ${tag.get('name')}\nTag description: ${tag.get('description')}\nTag usage: ${tag.get('usage_count')}`);
        }
        else {
            await interaction.reply(`Could not find tag: ${tagName}`);
        }
    }
}*/