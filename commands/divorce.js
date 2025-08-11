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

// Fonction pour sauvegarder les données de mariage
function saveMarriageData(data) {
  const dataPath = path.join(__dirname, '..', 'marriage-data.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('divorce')
    .setDescription('Divorce your current spouse'),

  async execute(interaction) {
    const user = interaction.user;
    const marriageData = loadMarriageData();

    // Trouver le mariage de l'utilisateur
    const marriage = Object.values(marriageData.marriages).find(m => 
      m.user1 === user.id || m.user2 === user.id
    );

    if (!marriage) {
      return interaction.reply({
        content: '❌ You are not married to anyone!',
        ephemeral: true
      });
    }

    // Trouver le partenaire
    const partnerId = marriage.user1 === user.id ? marriage.user2 : marriage.user1;
    const partner = await interaction.client.users.fetch(partnerId);

    // Créer l'embed de confirmation de divorce
    const embed = new EmbedBuilder()
      .setTitle('💔 Divorce Request')
      .setDescription(`${user} wants to divorce ${partner}.\n\nThis action cannot be undone! Are you sure?`)
      .setColor(0xff0000)
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: 'Think carefully about this decision... 💔' });

    // Créer les boutons
    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm_divorce')
      .setLabel('💔 Confirm Divorce')
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel_divorce')
      .setLabel('💕 Cancel')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
      .addComponents(confirmButton, cancelButton);

    const response = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    // Collecteur pour les boutons
    const collector = response.createMessageComponentCollector({
      time: 30000 // 30 secondes
    });

    collector.on('collect', async i => {
      if (i.user.id !== user.id) {
        return i.reply({
          content: '❌ This divorce request is not for you!',
          ephemeral: true
        });
      }

      if (i.customId === 'confirm_divorce') {
        // Divorce confirmé
        const marriageId = `${marriage.user1}_${marriage.user2}`;
        
        // Supprimer le mariage
        delete marriageData.marriages[marriageId];
        marriageData.stats.total_divorces++;

        // Ajouter aux divorces pour l'historique
        const divorceId = `divorce_${Date.now()}`;
        marriageData.divorces[divorceId] = {
          user1: marriage.user1,
          user2: marriage.user2,
          divorceDate: new Date().toISOString(),
          marriageDate: marriage.date,
          guild: marriage.guild
        };

        saveMarriageData(marriageData);

        const divorceEmbed = new EmbedBuilder()
          .setTitle('💔 Divorce Finalized')
          .setDescription(`The marriage between ${user} and ${partner} has been dissolved.\n\nYou are now both single again. 💔`)
          .setColor(0x808080)
          .setTimestamp()
          .setFooter({ text: 'Sometimes love just doesn\'t work out... 💔' });

        await i.update({
          embeds: [divorceEmbed],
          components: []
        });

        // Message d'annonce dans le canal configuré (si configuré)
        try {
          if (marriageData.config && marriageData.config.announcementChannel) {
            const announcementChannel = await interaction.client.channels.fetch(marriageData.config.announcementChannel);
            if (announcementChannel) {
              await announcementChannel.send({
                content: `💔 **DIVORCE ANNOUNCEMENT** 💔\n${user} and ${partner} have officially divorced.\n\nWe wish them both the best in their future endeavors. 💔`
              });
            }
          }
        } catch (error) {
          console.error('Error sending divorce announcement:', error);
        }

      } else if (i.customId === 'cancel_divorce') {
        // Divorce annulé
        const cancelEmbed = new EmbedBuilder()
          .setTitle('💕 Divorce Cancelled')
          .setDescription(`${user} has decided to stay married to ${partner}.\n\nLove prevails! 💕`)
          .setColor(0x00ff00)
          .setTimestamp()
          .setFooter({ text: 'Love conquers all! 💕' });

        await i.update({
          embeds: [cancelEmbed],
          components: []
        });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('⏰ Divorce Request Expired')
          .setDescription(`${user} did not confirm the divorce request in time.`)
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
