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
    .setName('marriagestats')
    .setDescription('View marriage statistics'),

  async execute(interaction) {
    try {
      const marriageData = loadMarriageData();
      
      // Compter les mariages actifs
      const activeMarriages = Object.keys(marriageData.marriages).length;
      const totalMarriages = marriageData.stats.total_marriages;
      const totalDivorces = marriageData.stats.total_divorces;
      
      // Calculer le taux de réussite
      const successRate = totalMarriages > 0 ? ((totalMarriages - totalDivorces) / totalMarriages * 100).toFixed(1) : 0;
      
      const embed = new EmbedBuilder()
        .setTitle('💒 Marriage Statistics')
        .setDescription('Here are the current marriage statistics for this server!')
        .setColor(0xff69b4)
        .setThumbnail(interaction.guild.iconURL())
        .addFields(
          { name: '💑 Active Marriages', value: `${activeMarriages}`, inline: true },
          { name: '💒 Total Marriages', value: `${totalMarriages}`, inline: true },
          { name: '💔 Total Divorces', value: `${totalDivorces}`, inline: true },
          { name: '📊 Success Rate', value: `${successRate}%`, inline: true },
          { name: '🎯 Marriage Rate', value: totalMarriages > 0 ? `${((activeMarriages / totalMarriages) * 100).toFixed(1)}%` : '0%', inline: true },
          { name: '📈 Divorce Rate', value: totalMarriages > 0 ? `${((totalDivorces / totalMarriages) * 100).toFixed(1)}%` : '0%', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Love is beautiful! 💕' });

      return await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in marriagestats command:', error);
      return await interaction.reply({
        content: '❌ An error occurred while fetching marriage statistics.',
        ephemeral: true
      });
    }
  },
};
