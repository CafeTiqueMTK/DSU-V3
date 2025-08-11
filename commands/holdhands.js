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
    .setName('holdhands')
    .setDescription('Hold hands with another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to hold hands with')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.user;
    const target = interaction.options.getUser('user');
    const marriageData = loadMarriageData();

    // Vérifications
    if (target.id === user.id) {
      return interaction.reply({
        content: '❌ You cannot hold your own hands!',
        ephemeral: true
      });
    }

    if (target.bot) {
      return interaction.reply({
        content: '❌ You cannot hold hands with a bot!',
        ephemeral: true
      });
    }

    // Vérifier si les deux sont mariés ensemble
    const marriage = Object.values(marriageData.marriages).find(m => 
      (m.user1 === user.id && m.user2 === target.id) || 
      (m.user1 === target.id && m.user2 === user.id)
    );

    // Messages de tenue de main
    const holdHandsMessages = [
      `${user} gently takes ${target}'s hand in theirs! 🤝`,
      `${user} and ${target} hold hands lovingly! 💕`,
      `${user} intertwines their fingers with ${target}'s! 💖`,
      `${user} and ${target} walk hand in hand together! 🚶‍♀️🤝🚶‍♂️`,
      `${user} holds ${target}'s hand with tender care! 🥰`,
      `${user} and ${target} share a sweet hand-holding moment! 💑`,
      `${user} clasps ${target}'s hand in a loving gesture! 💝`,
      `${user} and ${target} hold hands like true soulmates! 💕`
    ];

    const randomMessage = holdHandsMessages[Math.floor(Math.random() * holdHandsMessages.length)];

    // Couleurs différentes selon le statut marital
    let color = 0x98fb98; // Vert clair par défaut
    let title = '🤝 Hold Hands';
    let footer = 'Sweet and romantic! 💕';

    if (marriage) {
      color = 0xff69b4; // Rose pour les mariés
      title = '💑 Married Hand Holding';
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
