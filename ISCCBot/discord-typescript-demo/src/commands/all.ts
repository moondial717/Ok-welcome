import { SlashCommandBuilder, EmbedBuilder} from 'discord.js'
import { SlashCommand } from '../types/command'
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize, Questions } from "./tag";

// Add (1)
export const AllQuestionsSlashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('all')
        .setDescription('Retrieve all user questions.')
        .addBooleanOption((option) =>
            option.setName('my-questions').setDescription('View my questions').setRequired(false)
        )
        .addUserOption((option) => 
            option.setName('user').setDescription('View other user').setRequired(false)
        ),
    async execute(interaction) {
        // Fetch all questions from the Questions table
        try {
          // Ensure the model is synced before attempting to fetch data
          await sequelize.sync();
          
          const myQuestionsOption = interaction.options.getBoolean('my-questions');
          const specifiedUser = interaction.options.getUser('user');
          
          let userQuestions;
          if (myQuestionsOption) {
            // View only my questions
            const { user } = interaction;
            const triggerUsername = user ? user.username : '';
    
            userQuestions = await Questions.findAll({
              where: {
                username: triggerUsername,
              },
            });
          } else if (specifiedUser) {
            // View questions for a specific user
            userQuestions = await Questions.findAll({
              where: {
                username: specifiedUser.username,
              },
            });
          } else {
            // View all questions (default behavior)
            userQuestions = await Questions.findAll();
          }

          // Create an Embed to display the questions
          const embed = new EmbedBuilder()
          .setColor('#9cd6b7')
          .setTitle(`User questions:`);

          const userQuestionsMap: { [username: string]: { index: number, questions: string[], tags: string[] } } = {};

          userQuestions.forEach((q: any) => {
            const username = q.get('username');
            const index = (userQuestionsMap[username]?.index || 0) + 1;
            const questionText = `${index}. ${q.get('question')}`;
            const tagText = q.get('name') ? ` (Tag: ${q.get('name')})` : ''; // Check if tagname exists
    
            if (!userQuestionsMap[username]) {
              userQuestionsMap[username] = { index, questions: [], tags: [] };
            }
    
            userQuestionsMap[username].questions.push(questionText);
            userQuestionsMap[username].tags.push(tagText);
          });
    
          Object.keys(userQuestionsMap).forEach((username) => {
            const { questions, tags } = userQuestionsMap[username];
            const questionText = questions.join('\n');
            const tagText = tags.filter(Boolean).join('\n');
            embed.addFields({
              name: `${username}:`,
              value: `${questionText}${tagText}`,
            });
          });

          // Send the embed as a reply
          await interaction.reply({ embeds: [embed] });
        } catch (error) {
          console.error('Error fetching questions:', error);
          await interaction.reply('An error occurred while retrieving questions.');
        }
    }
};
  