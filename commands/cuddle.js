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
    .setName('cuddle')
    .setDescription('Cuddle with another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to cuddle with')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.user;
    const target = interaction.options.getUser('user');
    const marriageData = loadMarriageData();

    // Vérifications
    if (target.id === user.id) {
      return interaction.reply({
        content: '❌ You cannot cuddle with yourself!',
        ephemeral: true
      });
    }

    if (target.bot) {
      return interaction.reply({
        content: '❌ You cannot cuddle with a bot!',
        ephemeral: true
      });
    }

    // Vérifier si les deux sont mariés ensemble
    const marriage = Object.values(marriageData.marriages).find(m => 
      (m.user1 === user.id && m.user2 === target.id) || 
      (m.user1 === target.id && m.user2 === user.id)
    );

    // Messages de câlin
    const cuddleMessages = [
      `${user} snuggles up close to ${target} for a cozy cuddle! 🥰`,
      `${user} and ${target} cuddle together in a warm embrace! 💕`,
      `${user} wraps their arms around ${target} for a sweet cuddle! 💖`,
      `${user} and ${target} cuddle up like two lovebirds! 🕊️💕`,
      `${user} gives ${target} the most comfortable cuddle ever! 🧸`,
      `${user} and ${target} cuddle together in perfect harmony! 💑`,
      `${user} snuggles ${target} in a loving cuddle session! 💝`,
      `${user} and ${target} cuddle like they're the only two in the world! 💕`
    ];

    const randomMessage = cuddleMessages[Math.floor(Math.random() * cuddleMessages.length)];

    // Couleurs différentes selon le statut marital
    let color = 0xffb6c1; // Rose clair par défaut
    let title = '🥰 Cuddle';
    let footer = 'So warm and cozy! 💕';

    if (marriage) {
      color = 0xff1493; // Rose foncé pour les mariés
      title = '💑 Married Cuddle';
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
