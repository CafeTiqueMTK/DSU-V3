const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('status')
    .setDescription('Show the bot status.'),

  async execute(interaction) {
    const uptime = process.uptime(); // in seconds
    const totalSeconds = Math.floor(uptime);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const embed = new EmbedBuilder()
      .setTitle('📊 Bot Status')
      .setColor('#00BFFF')
      .addFields(
        { name: '🔌 Ping', value: `${interaction.client.ws.ping} ms`, inline: true },
        { name: '📡 Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: '👥 Users', value: `${interaction.client.users.cache.size}`, inline: true },
        { name: '🛡️ Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
        { name: '📶 Status', value: `${interaction.client.presence?.status || 'Unknown'}`, inline: true },
        { name: '⚙️ Version', value: `Node.js ${process.version}\nDiscord.js v${require('discord.js').version}`, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `Bot running on ${os.hostname()}` });

    await interaction.reply({ embeds: [embed] });
  }
};
