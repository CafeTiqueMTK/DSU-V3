const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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
  return JSON.parse(data);
}

// Fonction pour sauvegarder les données de mariage
function saveMarriageData(data) {
  const dataPath = path.join(__dirname, '..', 'marriage-data.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('marrysys')
    .setDescription('Configure the marriage system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('setchannel')
        .setDescription('Set the marriage announcement channel')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel for marriage announcements')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Show the current marriage system configuration')),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const marriageData = loadMarriageData();

      // Initialiser la configuration si elle n'existe pas
      if (!marriageData.config) {
        marriageData.config = {
          announcementChannel: null
        };
      }

      if (subcommand === 'setchannel') {
        const channel = interaction.options.getChannel('channel');

        // Vérifier que c'est un canal textuel
        if (!channel.isTextBased()) {
          return await interaction.reply({
            content: '❌ Please select a text channel for announcements.',
            ephemeral: true
          });
        }

        // Vérifier les permissions du bot dans ce canal
        const permissions = channel.permissionsFor(interaction.client.user);
        if (!permissions.has('SendMessages')) {
          return await interaction.reply({
            content: '❌ I don\'t have permission to send messages in that channel.',
            ephemeral: true
          });
        }

        // Sauvegarder la configuration
        marriageData.config.announcementChannel = channel.id;
        saveMarriageData(marriageData);

        const embed = new EmbedBuilder()
          .setTitle('✅ Marriage System Configured')
          .setDescription(`Marriage announcements will now be sent to ${channel}`)
          .setColor(0x00ff00)
          .addFields(
            { name: '📢 Announcement Channel', value: `${channel}`, inline: true },
            { name: '🆔 Channel ID', value: channel.id, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Marriage system configuration updated! 💒' });

        return await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'status') {
        const channelId = marriageData.config.announcementChannel;
        let channelInfo = 'Not configured';
        let channelMention = 'None';

        if (channelId) {
          try {
            const channel = await interaction.client.channels.fetch(channelId);
            channelInfo = `${channel.name} (${channel.id})`;
            channelMention = `${channel}`;
          } catch (error) {
            channelInfo = `Unknown channel (${channelId})`;
            channelMention = 'Channel not found';
          }
        }

        const embed = new EmbedBuilder()
          .setTitle('⚙️ Marriage System Status')
          .setDescription('Current configuration of the marriage system')
          .setColor(0xff69b4)
          .addFields(
            { name: '📢 Announcement Channel', value: channelMention, inline: true },
            { name: '📋 Channel Details', value: channelInfo, inline: true },
            { name: '💑 Active Marriages', value: `${Object.keys(marriageData.marriages).length}`, inline: true },
            { name: '💒 Total Marriages', value: `${marriageData.stats.total_marriages}`, inline: true },
            { name: '💔 Total Divorces', value: `${marriageData.stats.total_divorces}`, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Marriage system status' });

        return await interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in marrysys command:', error);
      return await interaction.reply({
        content: '❌ An error occurred while configuring the marriage system.',
        ephemeral: true
      });
    }
  },
};
