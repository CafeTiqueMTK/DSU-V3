const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { getGuildData, saveGuildData } = require('../utils/guildManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('automod')
    .setDescription('Configure Automod settings')
    .addSubcommand(sub =>
      sub.setName('enable')
        .setDescription('Enable Automod')
    )
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable Automod')
    )
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Show Automod status')
    )
    .addSubcommand(sub =>
      sub.setName('actionchannel')
        .setDescription('Set the channel for Automod actions')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('The channel to send Automod actions')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub.setName('pingrole')
        .setDescription('Manage blocked roles for ping protection')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Action to perform')
            .addChoices(
              { name: 'Add Role', value: 'add' },
              { name: 'Remove Role', value: 'del' },
              { name: 'List Roles', value: 'list' }
            )
            .setRequired(true)
        )
        .addRoleOption(opt =>
          opt.setName('role')
            .setDescription('The role to add or remove (not needed for list)')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ 
        content: '❌ This command can only be used in a server.', 
        ephemeral: true 
      });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // Utiliser le gestionnaire de guild pour obtenir les données
    const settings = getGuildData(guildId, 'settings');

    // Initialize automod settings
    if (!settings[guildId].automod) {
      settings[guildId].automod = {
        enabled: false,
        actionChannel: null,
        categories: {
          badWords: { enabled: false },
          discordLink: { enabled: false },
          ghostPing: { enabled: false },
          spam: { enabled: false }
        },
        blockedRoles: []
      };
    }

    if (!settings[guildId].automod.blockedRoles) {
      settings[guildId].automod.blockedRoles = [];
    }

    if (!settings[guildId].antiKeywords) {
      settings[guildId].antiKeywords = { enabled: false, keywords: [] };
    }

    try {
      if (sub === 'enable') {
        settings[guildId].automod.enabled = true;
        saveGuildData(guildId, settings, 'settings');

        const embed = new EmbedBuilder()
          .setTitle('✅ Automod Enabled')
          .setDescription('Automod is now active and monitoring messages.')
          .setColor(0x00ff99)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'disable') {
        settings[guildId].automod.enabled = false;
        saveGuildData(guildId, settings, 'settings');

        const embed = new EmbedBuilder()
          .setTitle('❌ Automod Disabled')
          .setDescription('Automod is now inactive.')
          .setColor(0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'actionchannel') {
        const channel = interaction.options.getChannel('channel');
        
        if (channel.type !== ChannelType.GuildText) {
          return interaction.reply({ 
            content: '❌ Please select a text channel for Automod actions.', 
            ephemeral: true 
          });
        }

        const permissions = channel.permissionsFor(interaction.client.user);
        if (!permissions.has('SendMessages') || !permissions.has('ViewChannel')) {
          return interaction.reply({ 
            content: '❌ I need permission to send messages and view the selected channel.', 
            ephemeral: true 
          });
        }

        settings[guildId].automod.actionChannel = channel.id;
        saveGuildData(guildId, settings, 'settings');

        const embed = new EmbedBuilder()
          .setTitle('✅ Automod Action Channel Set')
          .setDescription(`Automod actions will now be sent to ${channel}`)
          .addFields(
            { name: 'Channel', value: `${channel.name} (<#${channel.id}>)`, inline: true },
            { name: 'Status', value: '✅ Active', inline: true }
          )
          .setColor(0x00ff99)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'status') {
        const automod = settings[guildId].automod;
        const actionChannel = automod.actionChannel ? `<#${automod.actionChannel}>` : '❌ Not set';

        // Get anti protection status
        const antiMassMention = settings[guildId].antiMassMention || { enabled: false };
        const antiSpam = settings[guildId].antiSpam || { enabled: false };
        const antiInvites = settings[guildId].antiInvites || { enabled: false };
        const antiLinks = settings[guildId].antiLinks || { enabled: false };
        const antiKeywords = settings[guildId].antiKeywords || { enabled: false, keywords: [] };
        const antiRoles = settings[guildId].antiRoles || { enabled: false };
        const antiBot = settings[guildId].antiBot || { enabled: false };
        const antiRaid = settings[guildId].antiRaid || { enabled: false, threshold: 5 };

        const embed = new EmbedBuilder()
          .setTitle('📋 Automod & Anti Protection Status')
          .setDescription('Current Automod and Anti protection configuration')
          .addFields(
            { name: '🤖 Automod Status', value: automod.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '📢 Action Channel', value: actionChannel, inline: true },
            { name: '🛡️ Blocked Roles', value: `${automod.blockedRoles.length} roles`, inline: true },
            { name: '📢 Anti Mass Mention', value: `${antiMassMention.enabled ? '✅ Enabled' : '❌ Disabled'}\nThreshold: 5+ mentions`, inline: true },
            { name: '🔄 Anti Spam', value: `${antiSpam.enabled ? '✅ Enabled' : '❌ Disabled'}\nThreshold: 5+ messages in 5s`, inline: true },
            { name: '🔗 Anti Invites', value: `${antiInvites.enabled ? '✅ Enabled' : '❌ Disabled'}\nDetection: Discord links`, inline: true },
            { name: '🌐 Anti Links', value: `${antiLinks.enabled ? '✅ Enabled' : '❌ Disabled'}\nDetection: External links`, inline: true },
            { name: '🔤 Anti Keywords', value: `${antiKeywords.enabled ? '✅ Enabled' : '❌ Disabled'}\nKeywords: ${antiKeywords.keywords.length}`, inline: true },
            { name: '🎭 Anti Role Mentions', value: `${antiRoles.enabled ? '✅ Enabled' : '❌ Disabled'}\nBlocked: ${automod.blockedRoles.length} roles`, inline: true },
            { name: '🤖 Anti Bot', value: `${antiBot.enabled ? '✅ Enabled' : '❌ Disabled'}\nAction: Kick unauthorized bots`, inline: true },
            { name: '🚨 Anti Raid', value: `${antiRaid.enabled ? '✅ Enabled' : '❌ Disabled'}\nThreshold: ${antiRaid.threshold} joins/10s`, inline: true }
          )
          .setColor(automod.enabled ? 0x00ff99 : 0xff5555)
          .setFooter({ text: 'DSU Automod & Anti Protection System' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'pingrole') {
        const action = interaction.options.getString('action');
        const role = interaction.options.getRole('role');

        if (action === 'add') {
          if (!role) {
            const errorEmbed = new EmbedBuilder()
              .setTitle('❌ Role Required')
              .setDescription('Please specify a role to add to the blocked list.')
              .setColor(0xff0000)
              .setTimestamp();
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          }

          // Check if role is already blocked
          if (settings[guildId].automod.blockedRoles.includes(role.id)) {
            const alreadyBlockedEmbed = new EmbedBuilder()
              .setTitle('⚠️ Role Already Blocked')
              .setDescription(`The role ${role} is already in the blocked list.`)
              .setColor(0xffa500)
              .setTimestamp();
            return interaction.reply({ embeds: [alreadyBlockedEmbed], ephemeral: true });
          }

          // Add role to blocked list
          settings[guildId].automod.blockedRoles.push(role.id);
          saveGuildData(guildId, settings, 'settings');

          const addSuccessEmbed = new EmbedBuilder()
            .setTitle('✅ Role Blocked')
            .setDescription(`The role ${role} has been added to the blocked list.`)
            .addFields(
              { name: 'Role', value: `${role}`, inline: true },
              { name: 'Role ID', value: role.id, inline: true },
              { name: 'Total Blocked', value: `${settings[guildId].automod.blockedRoles.length} roles`, inline: true }
            )
            .setColor(0x00ff00)
            .setTimestamp();

          await interaction.reply({ embeds: [addSuccessEmbed], ephemeral: true });

        } else if (action === 'del') {
          if (!role) {
            const errorEmbed = new EmbedBuilder()
              .setTitle('❌ Role Required')
              .setDescription('Please specify a role to remove from the blocked list.')
              .setColor(0xff0000)
              .setTimestamp();
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          }

          // Check if role is in blocked list
          const roleIndex = settings[guildId].automod.blockedRoles.indexOf(role.id);
          if (roleIndex === -1) {
            const notBlockedEmbed = new EmbedBuilder()
              .setTitle('⚠️ Role Not Blocked')
              .setDescription(`The role ${role} is not in the blocked list.`)
              .setColor(0xffa500)
              .setTimestamp();
            return interaction.reply({ embeds: [notBlockedEmbed], ephemeral: true });
          }

          // Remove role from blocked list
          settings[guildId].automod.blockedRoles.splice(roleIndex, 1);
          saveGuildData(guildId, settings, 'settings');

          const removeSuccessEmbed = new EmbedBuilder()
            .setTitle('✅ Role Unblocked')
            .setDescription(`The role ${role} has been removed from the blocked list.`)
            .addFields(
              { name: 'Role', value: `${role}`, inline: true },
              { name: 'Role ID', value: role.id, inline: true },
              { name: 'Total Blocked', value: `${settings[guildId].automod.blockedRoles.length} roles`, inline: true }
            )
            .setColor(0x00ff00)
            .setTimestamp();

          await interaction.reply({ embeds: [removeSuccessEmbed], ephemeral: true });

        } else if (action === 'list') {
          const blockedRoles = settings[guildId].automod.blockedRoles;
          
          if (blockedRoles.length === 0) {
            const emptyListEmbed = new EmbedBuilder()
              .setTitle('📋 Blocked Roles List')
              .setDescription('No roles are currently blocked.')
              .addFields(
                { name: 'Total Blocked', value: '0 roles', inline: true },
                { name: 'Status', value: 'No protection active', inline: true }
              )
              .setColor(0x808080)
              .setTimestamp();

            await interaction.reply({ embeds: [emptyListEmbed], ephemeral: true });
          } else {
            const roleList = blockedRoles.map(roleId => {
              const role = interaction.guild.roles.cache.get(roleId);
              return role ? `${role} (${roleId})` : `Unknown Role (${roleId})`;
            }).join('\n');
            
            const listEmbed = new EmbedBuilder()
              .setTitle('📋 Blocked Roles List')
              .setDescription('Roles that are blocked from being mentioned:')
              .addFields(
                { name: 'Blocked Roles', value: roleList, inline: false },
                { name: 'Total Blocked', value: `${blockedRoles.length} roles`, inline: true },
                { name: 'Status', value: 'Protection active', inline: true }
              )
              .setColor(0x00ff00)
              .setTimestamp();

            await interaction.reply({ embeds: [listEmbed], ephemeral: true });
          }
        }
      }
    } catch (error) {
      console.error('Error in automod command:', error);
      await interaction.reply({
        content: '❌ An error occurred while configuring Automod.',
        ephemeral: true
      });
    }
  }
}; 