const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGuildSettings, updateGuildSettings } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mycoins')
    .setDescription('View your coins'),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const settings = getGuildSettings(guildId);
    if (!settings.streak) {
      settings.streak = { enabled: false, users: {} };
      updateGuildSettings(guildId, settings);
    }
    if (!settings.streak.users) settings.streak.users = {};
    if (!settings.streak.users[userId]) {
      settings.streak.users[userId] = { days: 0, coins: 0, frozen: false };
      updateGuildSettings(guildId, settings);
    }
    const coins = settings.streak.users[userId].coins || 0;
    const frozen = settings.streak.users[userId].frozen || false;
    const embed = new EmbedBuilder()
      .setTitle('Your Coins')
      .setDescription(`💰 Coins: **${coins}**\n${frozen ? '⛔ Your account is frozen.' : '✅ Your account is active.'}`)
      .setColor(frozen ? 0xff5555 : 0xffd700);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
