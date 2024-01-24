import { CommandInteraction,SlashCommandBuilder } from 'discord.js'

import { SlashCommand } from '../types/command'

export const PingSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  async execute(interaction: CommandInteraction) {
    await interaction.reply('Pong!')
  }
}

export const urlSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder().setName('url').setDescription('Uploads URL of your file!')
  .addStringOption(option =>
    option.setName('prompt').setDescription('prompt').setRequired(true)
  ),
  async execute(interaction) {
    let url = interaction.options.getString('prompt')!;
    const idMatch = url.match(/\/d\/(.+?)\//);
    if (idMatch && idMatch[1]) {
      const fileId = idMatch[1];
      url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    await interaction.reply(url);
  }
}

const express = require('express')
const app = express()
let { PythonShell } = require('python-shell')
app.get('/call/python', pythonProcess)


export const testSlashCommand: SlashCommand = {
  data: new SlashCommandBuilder().setName('test').setDescription('Replies with test message!')
  .addStringOption(option =>
      option.setName('prompt').setDescription('prompt').setRequired(true)
  ),
  async execute(interaction) {
      // 先回應一個 "deferred" 訊息
      await interaction.deferReply();

      // 獲取 'prompt' 選項的值
      let prompt = interaction.options.getString('prompt')!;

      // 然後執行需要長時間的操作
      let result = await pythonProcess(prompt);

      // 最後更新先前的 "deferred" 訊息
      await interaction.editReply(result);
  }
};

function pythonProcess(prompt: string) {
  return new Promise<string>((resolve, reject) => {
    let options = {
      pythonPath: 'D:/ISCCBot/env/Scripts/python.exe',
      args: [prompt] // 將參數傳遞到 Python 腳本
    };

    let shell = new PythonShell('D:/ISCCBot/test.py', options);
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
