const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settingsPath = path.join('/data', 'settings.json');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('muteconfig')
    .setDescription('Set the role that will be automatically assigned to muted members (admin only)')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Mute role to use by default')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const role = interaction.options.getRole('role');
    if (!role) {
      await interaction.reply({ content: 'Role not found.', ephemeral: true });
      return;
    }

    // Load or create settings
    let settings;
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    } catch {
      settings = {};
    }
    if (!settings[guildId]) settings[guildId] = {};
    if (!settings[guildId].automod) settings[guildId].automod = {};
    settings[guildId].automod.muteRoleId = role.id;

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    await interaction.reply({ content: `🔇 The role <@&${role.id}> will now be used to mute members.`, ephemeral: true });
  }
};
