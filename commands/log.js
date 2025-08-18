const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getGuildData, saveGuildData } = require('../utils/guildManager');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('log')
    .setDescription('Manage the log system')
    .addSubcommand(cmd =>
      cmd.setName('enable').setDescription('Enable the log system'))
    .addSubcommand(cmd =>
      cmd.setName('disable').setDescription('Disable the log system'))
    .addSubcommand(cmd =>
      cmd.setName('status').setDescription('Show the status of logs'))
    .addSubcommand(cmd =>
      cmd.setName('reset').setDescription('Reset all log configuration'))
    .addSubcommand(cmd =>
      cmd.setName('setchannel')
        .setDescription('Set the log channel')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel where logs will be sent')
            .setRequired(true)))
    .setDMPermission(false),

  async execute(interaction) {
    // Security: Only allow administrators to use config commands (extra check)
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You must be an administrator to use this command.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // Use guildManager to get and manage settings
    const settings = getGuildData(guildId, 'settings');

    if (!settings[guildId]) settings[guildId] = {};
    if (!settings[guildId].logs) {
      settings[guildId].logs = {
        enabled: false,
        categories: {
          arrived: false,
          farewell: false,
          vocal: false,
          mod: false,
          automod: false,
          commands: false,
          soundboard: false,
          tickets: false,
          channels: false,
          economy: false,
          bulkdelete: false,
          messages: false,
          gemini: false
        }
      };
    }

    const logs = settings[guildId].logs;

    const { EmbedBuilder } = require('discord.js');
    switch (sub) {
      case 'enable': {
        logs.enabled = true;
        // Ensure all categories exist and are enabled
        const allCategories = [
          'arrived', 'farewell', 'vocal', 'mod', 'automod', 
          'commands', 'soundboard', 'tickets', 'channels', 
          'economy', 'bulkdelete', 'messages', 'gemini'
        ];
        allCategories.forEach(cat => {
          if (!logs.categories[cat]) logs.categories[cat] = true;
          else logs.categories[cat] = true;
        });
        const embed = new EmbedBuilder()
          .setTitle('✅ Logs Enabled')
          .setDescription('Logs and all categories are now enabled.')
          .setColor(0x00bfff);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }
      case 'disable': {
        logs.enabled = false;
        const embed = new EmbedBuilder()
          .setTitle('❌ Logs Disabled')
          .setDescription('Logs have been disabled.')
          .setColor(0xff5555);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }
      case 'status': {
        const embed = new EmbedBuilder()
          .setTitle('📋 Log Status')
          .setDescription(`**Logs enabled:** ${logs.enabled ? '✅ Yes' : '❌ No'}`)
          .addFields(
            Object.entries(logs.categories).map(([key, val]) => ({
              name: key,
              value: val ? '✅ Enabled' : '❌ Disabled',
              inline: true
            }))
          )
          .setColor(0x00bfff);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }
      case 'reset': {
        settings[guildId].logs = {
          enabled: false,
          channel: null,
          categories: {
            arrived: false,
            farewell: false,
            vocal: false,
            mod: false,
            automod: false,
            commands: false,
            soundboard: false,
            tickets: false,
            channels: false,
            economy: false,
            bulkdelete: false,
            messages: false,
            gemini: false
          }
        };
        const embed = new EmbedBuilder()
          .setTitle('♻️ Log Configuration Reset')
          .setDescription('Log configuration has been reset.')
          .setColor(0xffcc00);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }
      case 'setchannel': {
        const channel = interaction.options.getChannel('channel');
        logs.enabled = true;
        logs.channel = channel.id;
        // Ensure all categories exist and are enabled
        const allCategories = [
          'arrived', 'farewell', 'vocal', 'mod', 'automod', 
          'commands', 'soundboard', 'tickets', 'channels', 
          'economy', 'bulkdelete', 'messages', 'gemini'
        ];
        allCategories.forEach(cat => {
          if (!logs.categories[cat]) logs.categories[cat] = true;
          else logs.categories[cat] = true;
        });
        const embed = new EmbedBuilder()
          .setTitle('📍 Log Channel Set')
          .setDescription(`Log channel set to <#${channel.id}>. Logging is now enabled for all categories.`)
          .setColor(0x00bfff);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }
    }

    // Save the updated settings using guildManager
    saveGuildData(guildId, settings, 'settings');
  }
};
