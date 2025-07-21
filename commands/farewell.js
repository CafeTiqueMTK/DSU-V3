const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settingsPath = path.join('/data', 'settings.json');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('farewell')
    .setDescription('Configure the farewell system')
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Show the status of the farewell system'))
    .addSubcommand(sub =>
      sub.setName('enable')
        .setDescription('Enable the farewell system'))
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Disable the farewell system'))
    .addSubcommand(sub =>
      sub.setName('setchannel')
        .setDescription('Set the farewell channel')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('The channel where farewell messages will be sent')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('test')
        .setDescription('Send a test farewell message')),

  async execute(interaction) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    const guildId = interaction.guild.id;
    if (!settings[guildId]) settings[guildId] = {};
    if (!settings[guildId].farewell) {
      settings[guildId].farewell = {
        enabled: false,
        channel: null
      };
    }

    const conf = settings[guildId].farewell;
    const sub = interaction.options.getSubcommand();

    if (sub === 'status') {
      await interaction.reply({
        embeds: [{
          title: '👋 Farewell System Status',
          fields: [
            { name: 'Status', value: conf.enabled ? '✅ Enabled' : '❌ Disabled' },
            { name: 'Channel', value: conf.channel ? `<#${conf.channel}>` : 'Not set' }
          ],
          color: 0xff5555
        }],
        ephemeral: true
      });

    } else if (sub === 'enable') {
      conf.enabled = true;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      await interaction.reply('✅ Farewell system enabled.', { ephemeral: true });

    } else if (sub === 'disable') {
      conf.enabled = false;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      await interaction.reply('❌ Farewell system disabled.', { ephemeral: true });

    } else if (sub === 'setchannel') {
      const channel = interaction.options.getChannel('channel');
      if (!channel || !channel.id) {
        await interaction.reply({ content: '❌ Channel not found or invalid.', ephemeral: true });
        return;
      }
      conf.channel = channel.id;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      await interaction.reply({ content: `📢 Farewell channel set to <#${channel.id}>.`, ephemeral: true });

    } else if (sub === 'test') {
      if (!conf.channel || typeof conf.channel !== 'string') return interaction.reply({ content: '❌ No farewell channel set.', ephemeral: true });
      const channel = interaction.guild.channels.cache.get(conf.channel);
      if (!channel) return interaction.reply({ content: '❌ Channel not found.', ephemeral: true });
      await channel.send({ content: `👋 Goodbye from **${interaction.guild.name}**!` });
      await interaction.reply({ content: '✅ Test farewell message sent.', ephemeral: true });
    }
  }
};
// This code defines a Discord bot command for managing farewell messages when members leave the server.
// It allows server administrators to enable/disable the farewell system, set a channel for farewell messages, and test the farewell message functionality.