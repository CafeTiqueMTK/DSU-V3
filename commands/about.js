const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Displays information about the bot.'),
  
  async execute(interaction) {
    const system = `${os.type()} ${os.arch()} (${os.platform()})`;

    const embed = new EmbedBuilder()
      .setTitle('About DSU V3')
      .setDescription(`✨ **DSU V3** is a complete moderation bot, designed to efficiently manage Discord servers with power and flexibility.`)
      .addFields(
        { name: 'Creator', value: '👤 ThM', inline: true },
        { name: 'System', value: `💻 ${system}`, inline: true },
        { name: 'Language', value: '🛠️ Node.js (discord.js)', inline: true }
      )
      .setFooter({ text: 'Thank you for using DSU V3!' })
      .setColor(0x00AEFF)
      .setThumbnail(interaction.client.user.displayAvatarURL());

    await interaction.reply({ embeds: [embed] });
  }
};
// Note: This command provides basic information about the bot and its creator.
// Ensure to keep the information updated as the bot evolves or if there are changes in the creator or technology used.