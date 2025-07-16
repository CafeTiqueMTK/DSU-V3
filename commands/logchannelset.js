const { SlashCommandBuilder, escapeStrikethrough, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const settingsPath = './settings.json';

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('logchannelset')
    .setDescription('Set the log channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel where logs will be sent')
        .setRequired(true)),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const channel = interaction.options.getChannel('channel');

    // Always reload settings from disk to avoid cache issues
    let settings;
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    } catch {
      settings = {};
    }

    if (!settings[guildId]) settings[guildId] = {};
    if (!settings[guildId].logs) {
      settings[guildId].logs = {
        enabled: true, // <-- Force enabled to true for logging to work
        categories: {
          arrived: true,
          farewell: true,
          vocal: true,
          mod: true,
          automod: true
        }
      };
    } else {
      // Ensure enabled and categories exist
      if (typeof settings[guildId].logs.enabled !== 'boolean') settings[guildId].logs.enabled = true;
      if (!settings[guildId].logs.categories) {
        settings[guildId].logs.categories = {
          arrived: true,
          farewell: true,
          vocal: true,
          mod: true,
          automod: true
        };
      }
    }

    settings[guildId].logs.channel = channel.id;
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

    await interaction.reply(`📍 Log channel set to <#${channel.id}>. Logging is now enabled for all categories.`, {ephemeral: true});
  }
};
