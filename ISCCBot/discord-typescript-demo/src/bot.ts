import { Client, Collection, Events, PermissionsBitField } from 'discord.js'
import { Storage } from '@google-cloud/storage';
import fetch from 'node-fetch';
import { SlashCommand,SlashSubCommand } from './types/command'

import { Tags } from './commands/tag'

const storage = new Storage({ keyFilename: './third-nature-412206-ffe52cd8ea28.json' });
const bucketName = 'third-nature-412206_cloudbuild';

async function uploadFileToGCS(url: string, originalFilename: string) {
  const bucket = storage.bucket(bucketName);
  let filename = originalFilename;
  let fileExists = await checkFileExists(bucket, filename);

  // 如果文件已存在，增加唯一標識符
  let count = 1;
  while (fileExists) {
    const extensionIndex = originalFilename.lastIndexOf('.');
    const nameWithoutExtension = extensionIndex > 0 ? originalFilename.substring(0, extensionIndex) : originalFilename;
    const extension = extensionIndex > 0 ? originalFilename.substring(extensionIndex) : '';
    filename = `${nameWithoutExtension}_${count}${extension}`;
    fileExists = await checkFileExists(bucket, filename);
    count++;
  }

  const file = bucket.file(filename);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

  if (response.body) {
    const stream = file.createWriteStream();
    stream.on('error', e => console.error(`Failed to upload ${filename}:`, e));
    stream.on('finish', () => console.log(`Successfully uploaded ${filename}`));
    
    response.body.pipe(stream);
  } else {
    throw new Error(`Response body is null for URL: ${url}`);
  }
}

async function checkFileExists(bucket: any, filename: string): Promise<boolean> {
  const [exists] = await bucket.file(filename).exists();
  return exists;
}

export function setBotListener(client: Client, commandList: Array<SlashCommand|SlashSubCommand>) {
  const commands = new Collection<string, SlashCommand|SlashSubCommand>(commandList.map((c) => [c.data.name, c]))

  client.once(Events.ClientReady, () => {
    Tags.sync();
    console.log('Bot Ready!')
  })

  client.on(Events.MessageCreate, async message => {
    // 檢查消息是否包含附件
    if (message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
            // 檢查附件是否有 URL 和名稱
            if (attachment.url && attachment.name) {
                // 下載檔案並上傳到 Google Cloud Storage
                uploadFileToGCS(attachment.url, attachment.name);
            }
        });
    }
    else {
      const idMatch = message.content.match(/\/d\/(.+?)\//);
      if (idMatch && idMatch[1]) {
        const fileId = idMatch[1];
        const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
        uploadFileToGCS(url, fileId);
      }
    }
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
