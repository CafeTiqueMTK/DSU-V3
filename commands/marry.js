const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
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

// Fonction pour sauvegarder les données de mariage
function saveMarriageData(data) {
  const dataPath = path.join(__dirname, '..', 'marriage-data.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('marry')
    .setDescription('Propose marriage to another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to marry')
        .setRequired(true)),

  async execute(interaction) {
    const proposer = interaction.user;
    const target = interaction.options.getUser('user');
    const marriageData = loadMarriageData();

    // Vérifications
    if (target.id === proposer.id) {
      return interaction.reply({
        content: '❌ You cannot marry yourself!',
        ephemeral: true
      });
    }

    if (target.bot) {
      return interaction.reply({
        content: '❌ You cannot marry a bot!',
        ephemeral: true
      });
    }

    // Vérifier si l'un des deux est déjà marié
    const proposerMarried = Object.values(marriageData.marriages).find(m => 
      m.user1 === proposer.id || m.user2 === proposer.id
    );
    
    const targetMarried = Object.values(marriageData.marriages).find(m => 
      m.user1 === target.id || m.user2 === target.id
    );

    if (proposerMarried) {
      return interaction.reply({
        content: '❌ You are already married! You must divorce first.',
        ephemeral: true
      });
    }

    if (targetMarried) {
      return interaction.reply({
        content: `❌ ${target.username} is already married!`,
        ephemeral: true
      });
    }

    // Créer l'embed de proposition
    const embed = new EmbedBuilder()
      .setTitle('💍 Marriage Proposal')
      .setDescription(`${proposer} is proposing to ${target}!\n\nWill you accept this marriage proposal?`)
      .setColor(0xff69b4)
      .setThumbnail(proposer.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: 'Love is in the air! 💕' });

    // Créer les boutons
    const acceptButton = new ButtonBuilder()
      .setCustomId('accept_marriage')
      .setLabel('💖 Accept')
      .setStyle(ButtonStyle.Success);

    const declineButton = new ButtonBuilder()
      .setCustomId('decline_marriage')
      .setLabel('💔 Decline')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder()
      .addComponents(acceptButton, declineButton);

    const response = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    // Collecteur pour les boutons
    const collector = response.createMessageComponentCollector({
      time: 60000 // 1 minute
    });

    collector.on('collect', async i => {
      if (i.user.id !== target.id) {
        return i.reply({
          content: '❌ This proposal is not for you!',
          ephemeral: true
        });
      }

      if (i.customId === 'accept_marriage') {
        // Mariage accepté
        const marriageId = `${proposer.id}_${target.id}`;
        const marriage = {
          user1: proposer.id,
          user2: target.id,
          proposer: proposer.id,
          date: new Date().toISOString(),
          guild: interaction.guild.id
        };

        marriageData.marriages[marriageId] = marriage;
        marriageData.stats.total_marriages++;
        saveMarriageData(marriageData);

        const successEmbed = new EmbedBuilder()
          .setTitle('💒 Wedding Bells!')
          .setDescription(`🎉 Congratulations! ${proposer} and ${target} are now married! 💕\n\nMay your love last forever! 💖`)
          .setColor(0x00ff00)
          .setThumbnail(target.displayAvatarURL())
          .setTimestamp()
          .setFooter({ text: 'Happily ever after! 💑' });

        await i.update({
          embeds: [successEmbed],
          components: []
        });

        // Message de félicitations dans le canal
        await interaction.channel.send({
          content: `🎊 **WEDDING ANNOUNCEMENT!** 🎊\n${proposer} and ${target} are now officially married! 💒💕\n\nEveryone, please congratulate the happy couple! 🎉`
        });

      } else if (i.customId === 'decline_marriage') {
        // Mariage refusé
        const declineEmbed = new EmbedBuilder()
          .setTitle('💔 Proposal Declined')
          .setDescription(`${target} has declined ${proposer}'s marriage proposal.\n\nIt's okay, there are plenty of fish in the sea! 🐟`)
          .setColor(0xff0000)
          .setTimestamp()
          .setFooter({ text: 'Better luck next time! 💔' });

        await i.update({
          embeds: [declineEmbed],
          components: []
        });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('⏰ Proposal Expired')
          .setDescription(`${target} did not respond to ${proposer}'s marriage proposal in time.`)
          .setColor(0x808080)
          .setTimestamp();

        interaction.editReply({
          embeds: [timeoutEmbed],
          components: []
        });
      }
    });
  },
};
