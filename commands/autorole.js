const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settingsPath = path.join(__dirname, '..', 'settings.json');

function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Configure automatic role assignment for new members.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set the role to assign automatically')
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Role to assign')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable autorole'))
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Show the status of autorole')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    let settings = {};
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }

    if (!settings[guildId]) settings[guildId] = {};
    if (!settings[guildId].autorole) settings[guildId].autorole = { enabled: false, roleId: null };

    if (sub === 'set') {
      const role = interaction.options.getRole('role');
      settings[guildId].autorole = {
        enabled: true,
        roleId: role.id
      };
      saveSettings(settings);
      await interaction.reply(`✅ The role ${role.name} will now be automatically assigned to new members.`, { ephemeral: true });
    }

    else if (sub === 'disable') {
      settings[guildId].autorole = { enabled: false, roleId: null };
      saveSettings(settings);
      await interaction.reply('❌ Autorole is now disabled.', { ephemeral: true });
    }

    else if (sub === 'status') {
      const data = settings[guildId].autorole;
      if (data.enabled) {
        const role = interaction.guild.roles.cache.get(data.roleId);
        await interaction.reply(`📌 Autorole is enabled: **${role?.name || 'Role not found'}**.`,   { ephemeral: true });
      } else {
        await interaction.reply('🚫 Autorole is currently disabled.',  { ephemeral: true});
      }
    }
  }
};
