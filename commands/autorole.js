const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getGuildData, saveGuildData } = require('../utils/guildManager');

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

    // Utiliser le gestionnaire de guild pour obtenir les données
    const settings = getGuildData(guildId, 'settings');

    if (sub === 'set') {
      const role = interaction.options.getRole('role');
      settings[guildId].autorole = {
        enabled: true,
        roleId: role.id
      };
      saveGuildData(guildId, settings, 'settings');
      const setRoleEmbed = new EmbedBuilder()
        .setTitle('✅ Autorole Set')
        .setDescription(`The role **${role.name}** will now be automatically assigned to new members.`)
        .addFields(
          { name: '🎭 Role', value: `${role.name} (<@&${role.id}>)`, inline: true },
          { name: '🎯 Status', value: '✅ Enabled', inline: true },
          { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true }
        )
        .setColor(0x00ff00)
        .setTimestamp();
      await interaction.reply({ embeds: [setRoleEmbed], ephemeral: true });
    }

    else if (sub === 'disable') {
      settings[guildId].autorole = { enabled: false, roleId: null };
      saveGuildData(guildId, settings, 'settings');
      const disableEmbed = new EmbedBuilder()
        .setTitle('❌ Autorole Disabled')
        .setDescription('Autorole is now disabled. New members will not receive automatic roles.')
        .addFields(
          { name: '🎯 Status', value: '❌ Disabled', inline: true },
          { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true }
        )
        .setColor(0xff0000)
        .setTimestamp();
      await interaction.reply({ embeds: [disableEmbed], ephemeral: true });
    }

    else if (sub === 'status') {
      const data = settings[guildId].autorole;
      const statusEmbed = new EmbedBuilder()
        .setTitle('📊 Autorole Status')
        .setColor(data.enabled ? 0x00ff00 : 0xff0000)
        .setTimestamp();
      
      if (data.enabled) {
        const role = interaction.guild.roles.cache.get(data.roleId);
        statusEmbed
          .setDescription('Autorole is currently enabled and active.')
          .addFields(
            { name: '🎯 Status', value: '✅ Enabled', inline: true },
            { name: '🎭 Role', value: role ? `${role.name} (<@&${role.id}>)` : 'Role not found', inline: true }
          );
      } else {
        statusEmbed
          .setDescription('Autorole is currently disabled.')
          .addFields(
            { name: '🎯 Status', value: '❌ Disabled', inline: true }
          );
      }
      
      await interaction.reply({ embeds: [statusEmbed], ephemeral: true });
    }
  }
};
