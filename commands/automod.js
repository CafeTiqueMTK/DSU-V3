const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getGuildData, saveGuildData } = require('../utils/guildManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('automod')
    .setDescription('Configure automod settings')
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

    try {
      if (sub === 'pingrole') {
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
        content: '❌ An error occurred while configuring automod settings.', 
        ephemeral: true 
      });
    }
  }
}; 