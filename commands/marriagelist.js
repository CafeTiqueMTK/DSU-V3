const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Fonction pour charger les données de mariage
function loadMarriageData() {
  const dataPath = path.join(__dirname, '..', 'marriage-data.json');
  if (!fs.existsSync(dataPath)) {
    const defaultData = {
      marriages: {},
      divorces: {},
      stats: {
        total_marriages: 0,
        total_divorces: 0
      },
      config: {
        announcementChannel: null
      }
    };
    fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  const data = fs.readFileSync(dataPath, 'utf8');
  const parsedData = JSON.parse(data);
  
  // S'assurer que la configuration existe
  if (!parsedData.config) {
    parsedData.config = {
      announcementChannel: null
    };
  }
  
  return parsedData;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('marriagelist')
    .setDescription('List all active marriages'),

  async execute(interaction) {
    try {
      const marriageData = loadMarriageData();
      const marriages = Object.values(marriageData.marriages);
      
      if (marriages.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle('💔 No Active Marriages')
          .setDescription('There are currently no active marriages on this server.\n\nBe the first to find love! 💕')
          .setColor(0x808080)
          .setTimestamp()
          .setFooter({ text: 'Love is waiting for you! 💕' });

        return await interaction.reply({ embeds: [embed] });
      }

      // Créer la liste des mariages
      let marriageList = '';
      let coupleCount = 0;

      for (const marriage of marriages) {
        try {
          const user1 = await interaction.client.users.fetch(marriage.user1);
          const user2 = await interaction.client.users.fetch(marriage.user2);
          
          const marriageDate = new Date(marriage.date);
          const now = new Date();
          const duration = now - marriageDate;
          const days = Math.floor(duration / (1000 * 60 * 60 * 24));
          
          coupleCount++;
          marriageList += `**${coupleCount}.** ${user1} 💕 ${user2}\n`;
          marriageList += `   📅 Married: ${marriageDate.toLocaleDateString()}\n`;
          marriageList += `   ⏰ Duration: ${days} day${days !== 1 ? 's' : ''}\n\n`;
        } catch (error) {
          console.error(`Error fetching user for marriage ${marriage.user1}_${marriage.user2}:`, error);
          coupleCount++;
          marriageList += `**${coupleCount}.** Unknown User 💕 Unknown User\n`;
          marriageList += `   📅 Married: ${new Date(marriage.date).toLocaleDateString()}\n\n`;
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(`💒 Active Marriages (${coupleCount})`)
        .setDescription(marriageList)
        .setColor(0xff69b4)
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp()
        .setFooter({ text: 'May love last forever! 💕' });

      return await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in marriagelist command:', error);
      return await interaction.reply({
        content: '❌ An error occurred while fetching the marriage list.',
        ephemeral: true
      });
    }
  },
};
