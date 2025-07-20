const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getGuildData, saveGuildData } = require('../utils/guildManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('anti')
    .setDescription('Configure anti protection systems')
        .addSubcommand(sub =>
      sub.setName('massmention')
        .setDescription('Configure anti mass mention protection')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable anti mass mention')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('spam')
        .setDescription('Configure anti spam protection')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable anti spam')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('invites')
        .setDescription('Configure anti invites protection')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable anti invites')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('links')
        .setDescription('Configure anti links protection')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable anti links')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('keywords')
        .setDescription('Configure anti keywords protection')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable anti keywords')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('roles')
        .setDescription('Configure anti role mention protection')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable anti role mention')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('bot')
        .setDescription('Configure anti bot protection')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable anti bot')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // Utiliser le gestionnaire de guild pour obtenir les données
    const settings = getGuildData(guildId, 'settings');

    // Initialize anti protection settings
    if (!settings[guildId].antiMassMention) {
      settings[guildId].antiMassMention = { enabled: false };
    }
    if (!settings[guildId].antiSpam) {
      settings[guildId].antiSpam = { enabled: false };
    }
    if (!settings[guildId].antiInvites) {
      settings[guildId].antiInvites = { enabled: false };
    }
    if (!settings[guildId].antiLinks) {
      settings[guildId].antiLinks = { enabled: false };
    }
    if (!settings[guildId].antiKeywords) {
      settings[guildId].antiKeywords = { enabled: false, keywords: [] };
    }
    if (!settings[guildId].antiRoles) {
      settings[guildId].antiRoles = { enabled: false };
    }
    if (!settings[guildId].antiBot) {
      settings[guildId].antiBot = { enabled: false };
    }

    try {
      if (sub === 'massmention') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].antiMassMention.enabled = enabled;
        saveGuildData(guildId, settings, 'settings');

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Anti Mass Mention Enabled' : '❌ Anti Mass Mention Disabled')
          .setDescription(`Anti mass mention protection is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Action', value: 'Message deletion + DM warning', inline: true },
            { name: 'Threshold', value: '5+ mentions', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'spam') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].antiSpam.enabled = enabled;
        saveGuildData(guildId, settings, 'settings');

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Anti Spam Enabled' : '❌ Anti Spam Disabled')
          .setDescription(`Anti spam protection is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Action', value: 'Message deletion + DM warning', inline: true },
            { name: 'Threshold', value: '5+ messages in 5 seconds', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'invites') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].antiInvites.enabled = enabled;
        saveGuildData(guildId, settings, 'settings');

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Anti Invites Enabled' : '❌ Anti Invites Disabled')
          .setDescription(`Anti invites protection is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Action', value: 'Message deletion + DM warning', inline: true },
            { name: 'Detection', value: 'Discord invite links', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'links') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].antiLinks.enabled = enabled;
        saveGuildData(guildId, settings, 'settings');

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Anti Links Enabled' : '❌ Anti Links Disabled')
          .setDescription(`Anti links protection is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Action', value: 'Message deletion + DM warning', inline: true },
            { name: 'Detection', value: 'All external links', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'keywords') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].antiKeywords.enabled = enabled;
        saveGuildData(guildId, settings, 'settings');

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Anti Keywords Enabled' : '❌ Anti Keywords Disabled')
          .setDescription(`Anti keywords protection is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Action', value: 'Message deletion + DM warning', inline: true },
            { name: 'Keywords', value: `${settings[guildId].antiKeywords.keywords.length} blacklisted`, inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'roles') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].antiRoles.enabled = enabled;
        saveGuildData(guildId, settings, 'settings');

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Anti Role Mention Enabled' : '❌ Anti Role Mention Disabled')
          .setDescription(`Anti role mention protection is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Action', value: 'Message deletion + DM warning', inline: true },
            { name: 'Detection', value: 'Blocked role mentions', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'bot') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].antiBot.enabled = enabled;
        saveGuildData(guildId, settings, 'settings');

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Anti Bot Enabled' : '❌ Anti Bot Disabled')
          .setDescription(`Anti bot protection is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Action', value: 'Bot kick + DM warning', inline: true },
            { name: 'Detection', value: 'External bots joining', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      }

    } catch (error) {
      console.error('Error in anti command:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while configuring anti protection systems.', 
        ephemeral: true 
      });
    }
  }
}; 