import { REST, Routes } from 'discord.js'

import { SlashCommand,SlashCommand1 } from './types/command'
import { AppConfig } from './types/config'
import { DeployCommandsResponse } from './types/response'


export function deploySlashCommands(appConfig: AppConfig, commandList: Array<SlashCommand>|Array<SlashCommand1>) {
  const rest = new REST({ version: '10' }).setToken(appConfig.token);
  const putPayload = commandList.map((c) => c.data.toJSON());

  // 假設 appConfig.guildIds 是一個包含多個伺服器 ID 的陣列
  const promises = appConfig.guildIds.map(guildId => {
      return rest.put(Routes.applicationGuildCommands(appConfig.clientId, guildId), {
          body: putPayload
      });
  });

  return Promise.all(promises) as Promise<DeployCommandsResponse>;
}