const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const settingsPath = './settings.json';

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('setmoderatorrole')
    .setDescription('Set the role that can use the /mod command')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Moderator role')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const role = interaction.options.getRole('role');

    // Load or initialize settings
    let settings;
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    } catch {
      settings = {};
    }
    if (!settings[guildId]) settings[guildId] = {};

    settings[guildId].moderatorRole = role.id;
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    await interaction.reply({ content: `The role <@&${role.id}> can now use the /mod command.`, ephemeral: true });
  }
};
