const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responds with Pong and shows the latency'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: '🏓 Ping...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    
    const pingEmbed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setDescription(`Bot latency: **${latency}ms**`)
      .addFields(
        { name: '⚡ Response Time', value: `${latency}ms`, inline: true },
        { name: '🌐 Status', value: latency < 100 ? '🟢 Excellent' : latency < 200 ? '🟡 Good' : '🔴 Slow', inline: true }
      )
      .setColor(latency < 100 ? 0x00ff00 : latency < 200 ? 0xffa500 : 0xff0000)
      .setTimestamp();
    
    await interaction.editReply({ embeds: [pingEmbed] });
  }
};
// This command responds with "Pong" and displays the latency of the interaction.
// It uses the `SlashCommandBuilder` to define the command and its description.