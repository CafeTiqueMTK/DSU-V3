// Fichier : commands/automod.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settingsPath = './settings.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('automod')
    .setDescription('Manage the automoderation system')
    .addSubcommand(sub => sub
      .setName('system')
      .setDescription('Enable or disable the automod system')
      .addStringOption(opt => opt
        .setName('status')
        .setDescription('enable or disable')
        .setRequired(true)
        .addChoices(
          { name: 'enable', value: 'enable' },
          { name: 'disable', value: 'disable' }
        ))
    )
    .addSubcommand(sub => sub
      .setName('status')
      .setDescription('Show the status of automod'))
    .addSubcommand(sub => sub
      .setName('setchannel')
      .setDescription('Set the channel where automod actions will be sent')
      .addChannelOption(opt =>
        opt.setName('channel')
          .setDescription('Channel to use for automod notifications')
          .setRequired(true)
      )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
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
    if (!settingsObj[guildId].automod) settingsObj[guildId].automod = { enabled: false, actionChannel: null };
    const automod = settingsObj[guildId].automod;

    const sub = interaction.options.getSubcommand();
    if (sub === 'system') {
      const status = interaction.options.getString('status');
      if (status === 'enable') {
        automod.enabled = true;
        await interaction.reply({ content: '✅ Automod enabled.', ephemeral: true });
      } else if (status === 'disable') {
        automod.enabled = false;
        await interaction.reply({ content: '❌ Automod disabled.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Invalid status value.', ephemeral: true });
        return;
      }
    } else if (sub === 'status') {
      await interaction.reply({
        content: `🔎 **Automod status**:\nEnabled: ${automod.enabled ? '✅' : '❌'}\nChannel: ${automod.actionChannel ? `<#${automod.actionChannel}>` : 'Not set'}`,
        ephemeral: true
      });
    } else if (sub === 'setchannel') {
      const channel = interaction.options.getChannel('channel');
      automod.actionChannel = channel.id;
      await interaction.reply({ content: `Automod action channel set to <#${channel.id}>.`, ephemeral: true });
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settingsObj, null, 2));
  }
};

