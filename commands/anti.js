const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settingsPath = './settings.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anti')
    .setDescription('Enable or disable an automod category')
    .addSubcommand(sub =>
      sub.setName('discordlink')
        .setDescription('Enable or disable the discordLink automod category')
        .addBooleanOption(opt =>
          opt.setName('state')
            .setDescription('true = enable, false = disable')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('ghostping')
        .setDescription('Enable or disable the ghostPing automod category')
        .addBooleanOption(opt =>
          opt.setName('state')
            .setDescription('true = enable, false = disable')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('mentionspam')
        .setDescription('Enable or disable the mentionSpam automod category')
        .addBooleanOption(opt =>
          opt.setName('state')
            .setDescription('true = enable, false = disable')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('spam')
        .setDescription('Enable or disable the spam automod category')
        .addBooleanOption(opt =>
          opt.setName('state')
            .setDescription('true = enable, false = disable')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
    }
    // Security: Only allow administrators to use config commands
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You must be an administrator to use this command.', ephemeral: true });
    }

    const guildId = interaction.guild.id;
    let settingsObj;
    try {
      settingsObj = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    } catch {
      settingsObj = {};
    }
    if (!settingsObj[guildId]) settingsObj[guildId] = {};
    if (!settingsObj[guildId].automod) settingsObj[guildId].automod = { enabled: false, categories: {} };
    if (!settingsObj[guildId].automod.categories) settingsObj[guildId].automod.categories = {};
    const automod = settingsObj[guildId].automod;

    const sub = interaction.options.getSubcommand();
    const state = interaction.options.getBoolean('state');
    let cat = null;
    if (sub === 'discordlink') cat = 'discordLink';
    if (sub === 'ghostping') cat = 'ghostPing';
    if (sub === 'mentionspam') cat = 'mentionSpam';
    if (sub === 'spam') cat = 'spam';
    if (!cat) {
      return interaction.reply({ content: '❌ Unknown category.', ephemeral: true });
    }
    if (!automod.categories[cat]) automod.categories[cat] = {};
    automod.categories[cat].enabled = state;
    fs.writeFileSync(settingsPath, JSON.stringify(settingsObj, null, 2));
    await interaction.reply(`🔧 Category **${cat}** has been ${state ? 'enabled' : 'disabled'}.`, { ephemeral: true });
  }
};
