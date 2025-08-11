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
    .setName('hug')
    .setDescription('Hug another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to hug')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.user;
    const target = interaction.options.getUser('user');
    const marriageData = loadMarriageData();

    // Vérifications
    if (target.id === user.id) {
      return interaction.reply({
        content: '❌ You cannot hug yourself!',
        ephemeral: true
      });
    }

    if (target.bot) {
      return interaction.reply({
        content: '❌ You cannot hug a bot!',
        ephemeral: true
      });
    }

    // Vérifier si les deux sont mariés ensemble
    const marriage = Object.values(marriageData.marriages).find(m => 
      (m.user1 === user.id && m.user2 === target.id) || 
      (m.user1 === target.id && m.user2 === user.id)
    );

    // Messages de câlin
    const hugMessages = [
      `${user} gives ${target} a warm and comforting hug! 🤗`,
      `${user} wraps ${target} in a loving embrace! 💕`,
      `${user} hugs ${target} tightly with all their love! 💖`,
      `${user} gives ${target} a gentle and caring hug! 🥰`,
      `${user} embraces ${target} in a sweet hug! 💝`,
      `${user} hugs ${target} like they never want to let go! 💑`,
      `${user} gives ${target} a cozy and affectionate hug! 🧸💕`,
      `${user} wraps their arms around ${target} lovingly! 💕`
    ];

    const randomMessage = hugMessages[Math.floor(Math.random() * hugMessages.length)];

    // Couleurs différentes selon le statut marital
    let color = 0x87ceeb; // Bleu ciel par défaut
    let title = '🤗 Hug';
    let footer = 'Warm and fuzzy feelings! 💕';

    if (marriage) {
      color = 0xff69b4; // Rose pour les mariés
      title = '💑 Married Hug';
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
