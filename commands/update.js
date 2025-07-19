const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('update')
    .setDescription('Manage GitHub commit notifications')
    .addSubcommand(subcommand =>
      subcommand
        .setName('enable')
        .setDescription('Enable GitHub commit notifications')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Disable GitHub commit notifications')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('setchannel')
        .setDescription('Set the channel for GitHub commit notifications')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('The channel to send commit notifications')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('setrole')
        .setDescription('Set the role to ping for updates')
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('The role to ping for updates')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Show update notification status')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('test')
        .setDescription('Test the update notification system')
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ 
        content: '❌ This command can only be used in a server.', 
        ephemeral: true 
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // Load update configuration
    const updatePath = path.join(__dirname, '..', 'data', 'updates.json');
    let updateConfig = {};
    
    if (fs.existsSync(updatePath)) {
      updateConfig = JSON.parse(fs.readFileSync(updatePath, 'utf-8'));
    }

    if (!updateConfig[guildId]) {
      updateConfig[guildId] = {
        enabled: false,
        channelId: null,
        roleId: null,
        lastCommit: null
      };
    }

    try {
      if (subcommand === 'enable') {
        if (!updateConfig[guildId].channelId) {
          return interaction.reply({
            content: '❌ Please set a channel first using `/update setchannel`',
            ephemeral: true
          });
        }

        updateConfig[guildId].enabled = true;
        fs.writeFileSync(updatePath, JSON.stringify(updateConfig, null, 2));

        const embed = new EmbedBuilder()
          .setTitle('✅ Update Notifications Enabled')
          .setDescription('GitHub commit notifications are now active!')
          .addFields(
            { name: 'Channel', value: `<#${updateConfig[guildId].channelId}>`, inline: true },
            { name: 'Role', value: updateConfig[guildId].roleId ? `<@&${updateConfig[guildId].roleId}>` : 'None set', inline: true }
          )
          .setColor(0x00ff99)
          .setFooter({ 
            text: `Requested by ${interaction.user.tag}`, 
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (subcommand === 'disable') {
        updateConfig[guildId].enabled = false;
        fs.writeFileSync(updatePath, JSON.stringify(updateConfig, null, 2));

        const embed = new EmbedBuilder()
          .setTitle('❌ Update Notifications Disabled')
          .setDescription('GitHub commit notifications are now inactive.')
          .setColor(0xff5555)
          .setFooter({ 
            text: `Requested by ${interaction.user.tag}`, 
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (subcommand === 'setchannel') {
        const channel = interaction.options.getChannel('channel');
        
        if (channel.type !== 0) {
          return interaction.reply({ 
            content: '❌ Please select a text channel.', 
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

        updateConfig[guildId].channelId = channel.id;
        fs.writeFileSync(updatePath, JSON.stringify(updateConfig, null, 2));

        const embed = new EmbedBuilder()
          .setTitle('✅ Update Channel Set')
          .setDescription(`Commit notifications will be sent to ${channel}`)
          .addFields(
            { name: 'Channel', value: `${channel.name} (<#${channel.id}>)`, inline: true },
            { name: 'Status', value: updateConfig[guildId].enabled ? '✅ Active' : '❌ Inactive', inline: true }
          )
          .setColor(0x00ff99)
          .setFooter({ 
            text: `Requested by ${interaction.user.tag}`, 
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (subcommand === 'setrole') {
        const role = interaction.options.getRole('role');
        
        updateConfig[guildId].roleId = role.id;
        fs.writeFileSync(updatePath, JSON.stringify(updateConfig, null, 2));

        const embed = new EmbedBuilder()
          .setTitle('✅ Update Role Set')
          .setDescription(`The role ${role} will be pinged for updates`)
          .addFields(
            { name: 'Role', value: `${role.name} (<@&${role.id}>)`, inline: true },
            { name: 'Status', value: updateConfig[guildId].enabled ? '✅ Active' : '❌ Inactive', inline: true }
          )
          .setColor(0x00ff99)
          .setFooter({ 
            text: `Requested by ${interaction.user.tag}`, 
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (subcommand === 'status') {
        const config = updateConfig[guildId];
        const channel = config.channelId ? `<#${config.channelId}>` : '❌ Not set';
        const role = config.roleId ? `<@&${config.roleId}>` : '❌ Not set';

        const embed = new EmbedBuilder()
          .setTitle('📊 Update Notification Status')
          .setDescription('Current configuration for GitHub commit notifications')
          .addFields(
            { name: 'Status', value: config.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Channel', value: channel, inline: true },
            { name: 'Role', value: role, inline: true },
            { name: 'Last Commit', value: config.lastCommit ? `<t:${Math.floor(new Date(config.lastCommit).getTime() / 1000)}:R>` : 'None', inline: false }
          )
          .setColor(config.enabled ? 0x00ff99 : 0xff5555)
          .setFooter({ 
            text: `Requested by ${interaction.user.tag}`, 
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (subcommand === 'test') {
        if (!updateConfig[guildId].enabled) {
          return interaction.reply({
            content: '❌ Update notifications are not enabled. Use `/update enable` first.',
            ephemeral: true
          });
        }

        await interaction.reply({
          content: '🔄 Testing update notification system...',
          ephemeral: true
        });

        try {
          // Import and use the update checker
          const UpdateChecker = require('../update-checker.js');
          const checker = new UpdateChecker(interaction.client);
          
          const result = await checker.manualCheck(guildId);
          
          if (result.success) {
            await interaction.editReply({
              content: '✅ Test completed! Check the configured channel for the notification.',
              ephemeral: true
            });
          } else {
            await interaction.editReply({
              content: `❌ Test failed: ${result.message}`,
              ephemeral: true
            });
          }
        } catch (error) {
          console.error('Error in test command:', error);
          await interaction.editReply({
            content: '❌ An error occurred during the test.',
            ephemeral: true
          });
        }
      }

    } catch (error) {
      console.error('Error in update command:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while updating the configuration.', 
        ephemeral: true 
      });
    }
  },
}; 