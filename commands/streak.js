const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getGuildSettings, updateGuildSettings } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Manage the economy system')
    .addSubcommand(cmd =>
      cmd.setName('system')
        .setDescription('Enable or disable the economy system')
        .addStringOption(opt =>
          opt.setName('state')
            .setDescription('Enable or disable the economy system')
            .setRequired(true)
            .addChoices(
              { name: 'enable', value: 'enable' },
              { name: 'disable', value: 'disable' }
            )
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('status')
        .setDescription('Show the status of the economy system')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const settings = getGuildSettings(guildId);
    if (!settings.streak) {
      settings.streak = { enabled: false };
      updateGuildSettings(guildId, settings);
    }
    const sub = interaction.options.getSubcommand();
    if (sub === 'system') {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ You must be an administrator to use this command.', ephemeral: true });
      }
      const state = interaction.options.getString('state');
      settings.streak.enabled = state === 'enable';
      updateGuildSettings(guildId, settings);
      await interaction.reply({ content: `Economy system is now ${settings.streak.enabled ? 'enabled' : 'disabled'}.`, ephemeral: true });
    } else if (sub === 'status') {
      await interaction.reply({ content: `💰 **Economy system**: ${settings.streak.enabled ? '✅ Enabled' : '❌ Disabled'}`, ephemeral: true });
    }
  }
};
