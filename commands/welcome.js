const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settingsPath = path.join(__dirname, '..', 'settings.json');

function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('welcome')
    .setDescription('Configure the welcome system')
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Show the status of the welcome system'))
    .addSubcommand(sub =>
      sub.setName('enable')
        .setDescription('Enable the welcome system'))
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable the welcome system'))
    .addSubcommand(sub =>
      sub.setName('setchannel')
        .setDescription('Set the welcome channel')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('The channel to send welcome messages in')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('test')
        .setDescription('Send a test welcome message')),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    let settings = {};
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }

    if (!settings[guildId]) settings[guildId] = {};
    if (!settings[guildId].welcome) {
      settings[guildId].welcome = {
        enabled: false,
        channel: null
      };
    }

    const conf = settings[guildId].welcome;
    const sub = interaction.options.getSubcommand();

    if (sub === 'status') {
      await interaction.reply({
        embeds: [{
          title: '🎉 Welcome System Status',
          fields: [
            { name: 'Status', value: conf.enabled ? '✅ Enabled' : '❌ Disabled' },
            { name: 'Channel', value: conf.channel ? `<#${conf.channel}>` : 'Not set' }
          ],
          color: 0x00bfff
        }],
        ephemeral: true
      });

    } else if (sub === 'enable') {
      conf.enabled = true;
      saveSettings(settings);
      const enableEmbed = new EmbedBuilder()
        .setTitle('✅ Welcome System Enabled')
        .setDescription('The welcome system is now active and will send welcome messages to new members.')
        .addFields(
          { name: '🎯 Status', value: '✅ Enabled', inline: true },
          { name: '📝 Channel', value: conf.channel ? `<#${conf.channel}>` : 'Not set', inline: true }
        )
        .setColor(0x00ff00)
        .setTimestamp();
      await interaction.reply({ embeds: [enableEmbed], ephemeral: true });

    } else if (sub === 'disable') {
      conf.enabled = false;
      saveSettings(settings);
      const disableEmbed = new EmbedBuilder()
        .setTitle('❌ Welcome System Disabled')
        .setDescription('The welcome system is now inactive and will not send welcome messages.')
        .addFields(
          { name: '🎯 Status', value: '❌ Disabled', inline: true },
          { name: '📝 Channel', value: conf.channel ? `<#${conf.channel}>` : 'Not set', inline: true }
        )
        .setColor(0xff0000)
        .setTimestamp();
      await interaction.reply({ embeds: [disableEmbed], ephemeral: true });

    } else if (sub === 'setchannel') {
      const channel = interaction.options.getChannel('channel');
      if (!channel) {
        const channelNotFoundEmbed = new EmbedBuilder()
          .setTitle('❌ Channel Not Found')
          .setDescription('The specified channel was not found.')
          .setColor(0xff0000)
          .setTimestamp();
        await interaction.reply({ embeds: [channelNotFoundEmbed], ephemeral: true });
        return;
      }
      conf.channel = channel.id;
      saveSettings(settings);
      const setChannelEmbed = new EmbedBuilder()
        .setTitle('✅ Welcome Channel Set')
        .setDescription(`The welcome channel has been successfully configured.`)
        .addFields(
          { name: '📝 Channel', value: `<#${channel.id}>`, inline: true },
          { name: '🎯 Status', value: conf.enabled ? '✅ Enabled' : '❌ Disabled', inline: true }
        )
        .setColor(0x00ff00)
        .setTimestamp();
      await interaction.reply({ embeds: [setChannelEmbed], ephemeral: true });

    } else if (sub === 'test') {
      if (!conf.enabled || !conf.channel) {
        const testErrorEmbed = new EmbedBuilder()
          .setTitle('⚠️ Welcome System Not Ready')
          .setDescription('The welcome system is disabled or no channel has been set.')
          .addFields(
            { name: '🎯 Status', value: conf.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '📝 Channel', value: conf.channel ? `<#${conf.channel}>` : 'Not set', inline: true }
          )
          .setColor(0xffa500)
          .setTimestamp();
        return interaction.reply({ embeds: [testErrorEmbed], ephemeral: true });
      }

      const member = interaction.member;
      const channel = interaction.guild.channels.cache.get(conf.channel);
      if (channel) {
        channel.send({
          embeds: [{
            title: `👋 Welcome ${member.user.username}!`,
            description: `We are happy to welcome you to **${interaction.guild.name}**! 🎉`,
            color: 0x00ff99,
            footer: { text: `User ID: ${member.id}` },
            timestamp: new Date(),
            image: { url: member.user.displayAvatarURL({ dynamic: true }) }
          }]
        });
      }
      const testSuccessEmbed = new EmbedBuilder()
        .setTitle('✅ Test Message Sent')
        .setDescription('A test welcome message has been sent to the configured channel.')
        .addFields(
          { name: '📝 Channel', value: `<#${conf.channel}>`, inline: true },
          { name: '👤 Test User', value: `${member.user.tag}`, inline: true }
        )
        .setColor(0x00ff00)
        .setTimestamp();
      await interaction.reply({ embeds: [testSuccessEmbed], ephemeral: true });
    }
  }
};
