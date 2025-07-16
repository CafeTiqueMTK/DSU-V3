const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGuildSettings } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Show the coins leaderboard'),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const settings = getGuildSettings(guildId);
    if (!settings.streak || !settings.streak.users) {
      return interaction.reply({ content: 'No coin data found.', ephemeral: true });
    }
    const users = settings.streak.users;
    // Génère un tableau [{userId, coins}]
    const leaderboard = Object.entries(users)
      .map(([userId, data]) => ({ userId, coins: data.coins || 0 }))
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 10);
    if (leaderboard.length === 0) {
      return interaction.reply({ content: 'No coin data found.', ephemeral: true });
    }
    let desc = leaderboard.map((u, i) => `#${i+1} <@${u.userId}> — **${u.coins}** coins`).join('\n');
    const embed = new EmbedBuilder()
      .setTitle('🏆 Coins Leaderboard')
      .setDescription(desc)
      .setColor(0xffd700);
    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
