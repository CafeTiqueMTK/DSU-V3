const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const settingsPath = './settings.json';

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
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // Load settings
    let settings = {};
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }

    if (!settings[guildId]) settings[guildId] = {};
    if (!settings[guildId].automod) {
      settings[guildId].automod = {
        enabled: false,
        actionChannel: null
      };
    }

    try {
      if (sub === 'enable') {
        settings[guildId].automod.enabled = true;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle('✅ Automod Enabled')
          .setDescription('Automod is now active and monitoring messages.')
          .setColor(0x00ff99)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'disable') {
        settings[guildId].automod.enabled = false;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle('❌ Automod Disabled')
          .setDescription('Automod is now inactive.')
          .setColor(0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'actionchannel') {
        const channel = interaction.options.getChannel('channel');
        
        if (channel.type !== 0) {
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
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

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

        const embed = new EmbedBuilder()
          .setTitle('📋 Automod & Anti Protection Status')
          .setDescription('Current Automod and Anti protection configuration')
          .addFields(
            { name: '🤖 Automod Status', value: automod.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '📢 Action Channel', value: actionChannel, inline: true },
            { name: '\u200b', value: '\u200b', inline: true },
            { name: '📢 Anti Mass Mention', value: `${antiMassMention.enabled ? '✅ Enabled' : '❌ Disabled'}\nThreshold: 5+ mentions`, inline: true },
            { name: '🔄 Anti Spam', value: `${antiSpam.enabled ? '✅ Enabled' : '❌ Disabled'}\nCooldown: 2 seconds`, inline: true },
            { name: '🔗 Anti Invites', value: `${antiInvites.enabled ? '✅ Enabled' : '❌ Disabled'}\nDetection: Discord links`, inline: true }
          )
          .setColor(automod.enabled ? 0x00ff99 : 0xff5555)
          .setFooter({ text: 'DSU Automod & Anti Protection System' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
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