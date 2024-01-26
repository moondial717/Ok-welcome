import { Storage } from '@google-cloud/storage';
import { PartialMessageReaction, MessageReaction } from 'discord.js'
const fetch = require('node-fetch');
const storage = new Storage({ keyFilename: './third-nature-412206-ffe52cd8ea28.json' });
const bucketName = 'third-nature-412206_cloudbuild';

export async function detecturlfile(reaction: MessageReaction | PartialMessageReaction) {
  const botMessage = await reaction.message.reply('處理中...');
  if (reaction.message.attachments.size > 0) {
    reaction.message.attachments.forEach(attachment => {
        // 檢查附件是否有 URL 和名稱
        if (attachment.url && attachment.name) {
            // 下載檔案並上傳到 Google Cloud Storage
            uploadFileToGCS(attachment.url, attachment.name, reaction);
        }
    });
  }
  else {
    const idMatch = reaction.message.content?.match(/\/d\/(.+?)\//);
    reaction.message.embeds.forEach(embed => {
      const fileName = embed.title;
      if (idMatch && idMatch[1] && fileName) {
        const fileId = idMatch[1];
        const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
        uploadFileToGCS(url, fileName, reaction);
      }
    })
  }
  botMessage.edit('處理完成');
}

export async function uploadFileToGCS(url: string, originalFilename: string, reaction: MessageReaction | PartialMessageReaction) {
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
    stream.on('error', e => {console.error(`Failed to upload ${filename}:`, e), reaction.message.react('❌')});
    stream.on('finish', () => {console.log(`Successfully uploaded ${filename}`), reaction.message.react('✅')});

    response.body.pipe(stream);
  } else {
    throw new Error(`Response body is null for URL: ${url}`);
  }
}

export async function checkFileExists(bucket: any, filename: string): Promise<boolean> {
  const [exists] = await bucket.file(filename).exists();
  return exists;
}