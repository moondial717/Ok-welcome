import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

import { SlashCommand } from '../types/command'
import { Questions } from './tag';

const express = require('express')
const app = express()
let { PythonShell } = require('python-shell')
app.get('/call/python', pythonProcessQuestion)


export const askSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder().setName('ask').setDescription('Ask a question.')
  .addStringOption(option =>
      option.setName('prompt').setDescription('prompt').setRequired(true)
  ),
  async execute(interaction) {
      // 先回應一個 "deferred" 訊息
      await interaction.deferReply();

      // 獲取 'prompt' 選項的值
      const prompt = interaction.options.getString('prompt')!;

      // 然後執行需要長時間的操作
      let result = await pythonProcessQuestion(prompt);

      // 擷取最後一行的來源文件
      const embed = await catchurl(result);

      // 最後更新先前的 "deferred" 訊息
      const message = await interaction.editReply({content: result, embeds: [embed]});
      await Promise.all([
        message.react('☑️'),
        message.react('🔧'),
        message.react('❌')
      ]);
    
      // 檢查提問問題是否已存在
      const existingQuestion = await Questions.findOne({
        where: {
          username: interaction.user.username,
          question: prompt,
        },
      });

      if (!existingQuestion) {
        // 不存在的情況下再新增
        await Questions.create({
          username: interaction.user.username,
          question: prompt,
          name: null,
        });
      }
  }
};


export async function catchurl(result: string) {
  const lines = result.split('\n');
  let lastline = lines[lines.length - 1];
  
  const filename  = lastline.replace(/來源文件: https:\/\/storage\.cloud\.google\.com\/careerhack-bucket\/(.*)/g, '$1');
  let embed: EmbedBuilder;
  
  if(!lastline.includes('來源文件: https://storage.cloud.google.com/careerhack-bucket/')){
    embed = new EmbedBuilder()
      .setColor('#9cd6b7')
      .setTitle(`來源文件`)
      .setDescription('無');
  }else{
    lastline = lastline.replace(/來源文件: (.*)/g, `[${filename}]($1)`);
    embed = new EmbedBuilder()
      .setColor('#9cd6b7')
      .setTitle(`來源文件`)
      .setDescription(lastline);
  }
  return embed;
}

export function pythonProcessQuestion(prompt: string) {
  return new Promise<string>((resolve, reject) => {
    let options = {
      pythonPath: 'D:/hackason/Ok-welcome/ISCCBot/env/Scripts/python.exe',
      args: [prompt] // 將參數傳遞到 Python 腳本
    };

    let shell = new PythonShell('D:/hackason/Ok-welcome/ISCCBot/discord-typescript-demo/test.py', options);
    let output = '';

    shell.on('message', function (message: string) {
      console.log(message);
      output += message + '\n';;
    });

    shell.end(function (err: any, code: any, signal: any) {
      if (err) reject(err);
      console.log('The exit code was: ' + code);
      console.log('The exit signal was: ' + signal);
      console.log('finished');

      resolve(output);
    });
  });
}
