const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

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
    const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
    const guildId = interaction.guild.id;
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
      fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 2));
      await interaction.reply({ content: '✅ The welcome system is now enabled.', ephemeral: true });

    } else if (sub === 'disable') {
      conf.enabled = false;
      fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 2));
      await interaction.reply({ content: '❌ The welcome system is now disabled.', ephemeral: true });

    } else if (sub === 'setchannel') {
      const channel = interaction.options.getChannel('channel');
      if (!channel) {
        await interaction.reply({ content: '❌ Channel not found.', ephemeral: true });
        return;
      }
      conf.channel = channel.id;
      fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 2));
      await interaction.reply({ content: `✅ The welcome channel is now <#${channel.id}>.`, ephemeral: true });

    } else if (sub === 'test') {
      if (!conf.enabled || !conf.channel) return interaction.reply({ content: '⚠️ The welcome system is disabled or no channel has been set.', ephemeral: true });

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
      await interaction.reply({ content: '✅ Test welcome message sent.', ephemeral: true });
    }
  }
};
