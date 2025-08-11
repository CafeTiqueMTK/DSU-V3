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
      }
    };
    fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kiss')
    .setDescription('Kiss another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to kiss')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.user;
    const target = interaction.options.getUser('user');
    const marriageData = loadMarriageData();

    // Vérifications
    if (target.id === user.id) {
      return interaction.reply({
        content: '❌ You cannot kiss yourself!',
        ephemeral: true
      });
    }

    if (target.bot) {
      return interaction.reply({
        content: '❌ You cannot kiss a bot!',
        ephemeral: true
      });
    }

    // Vérifier si les deux sont mariés ensemble
    const marriage = Object.values(marriageData.marriages).find(m => 
      (m.user1 === user.id && m.user2 === target.id) || 
      (m.user1 === target.id && m.user2 === user.id)
    );

    // Messages de baiser
    const kissMessages = [
      `${user} gives ${target} a sweet kiss on the cheek! 💋`,
      `${user} plants a gentle kiss on ${target}'s lips! 💕`,
      `${user} surprises ${target} with a passionate kiss! 😘`,
      `${user} gives ${target} a loving peck! 💖`,
      `${user} kisses ${target} tenderly! 💝`,
      `${user} shares a romantic kiss with ${target}! 💑`,
      `${user} gives ${target} a butterfly kiss! 🦋💋`,
      `${user} kisses ${target} like there\'s no tomorrow! 💕`
    ];

    const randomMessage = kissMessages[Math.floor(Math.random() * kissMessages.length)];

    // Couleurs différentes selon le statut marital
    let color = 0xff69b4; // Rose par défaut
    let title = '💋 Kiss';
    let footer = 'Love is in the air! 💕';

    if (marriage) {
      color = 0xff1493; // Rose foncé pour les mariés
      title = '💑 Married Kiss';
      footer = 'Happily married couple! 💒';
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(randomMessage)
      .setColor(color)
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: footer });

    return interaction.reply({ embeds: [embed] });
  },
};
