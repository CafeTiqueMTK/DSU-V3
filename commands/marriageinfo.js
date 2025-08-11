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
    .setName('marriageinfo')
    .setDescription('View marriage information')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check marriage info for (leave empty for yourself)')
        .setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const marriageData = loadMarriageData();

    // Trouver le mariage de l'utilisateur
    const marriage = Object.values(marriageData.marriages).find(m => 
      m.user1 === targetUser.id || m.user2 === targetUser.id
    );

    if (!marriage) {
      const embed = new EmbedBuilder()
        .setTitle('💔 Single Status')
        .setDescription(`${targetUser} is currently single and available! 💕`)
        .setColor(0x808080)
        .setThumbnail(targetUser.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: 'Looking for love! 💕' });

      return interaction.reply({ embeds: [embed] });
    }

    // Trouver le partenaire
    const partnerId = marriage.user1 === targetUser.id ? marriage.user2 : marriage.user1;
    const partner = await interaction.client.users.fetch(partnerId);

    // Calculer la durée du mariage
    const marriageDate = new Date(marriage.date);
    const now = new Date();
    const duration = now - marriageDate;
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    let durationText = '';
    if (days > 0) {
      durationText += `${days} day${days > 1 ? 's' : ''} `;
    }
    if (hours > 0) {
      durationText += `${hours} hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
      durationText += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    if (!durationText) {
      durationText = 'Just married! 💕';
    }

    const embed = new EmbedBuilder()
      .setTitle('💒 Marriage Information')
      .setDescription(`**Couple:** ${targetUser} 💕 ${partner}\n\n**Marriage Date:** ${marriageDate.toLocaleDateString()} at ${marriageDate.toLocaleTimeString()}\n**Duration:** ${durationText}\n\n**Status:** Happily Married 💑`)
      .setColor(0xff69b4)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: '👰‍♀️ Spouse 1', value: `${targetUser}`, inline: true },
        { name: '🤵‍♂️ Spouse 2', value: `${partner}`, inline: true },
        { name: '💍 Marriage ID', value: `${marriage.user1}_${marriage.user2}`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'May your love last forever! 💕' });

    return interaction.reply({ embeds: [embed] });
  },
};
