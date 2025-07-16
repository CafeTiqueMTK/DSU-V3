const { SlashCommandBuilder } = require('discord.js');
const { getGuildSettings, updateGuildSettings } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Claim your daily coins'),
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
      settings.streak.users[userId] = { coins: 0, lastClaim: 0 };
    }
    const now = Date.now();
    const lastClaim = settings.streak.users[userId].lastClaim || 0;
    const oneDay = 24 * 60 * 60 * 1000;
    if (now - lastClaim < oneDay) {
      const next = new Date(lastClaim + oneDay);
      return interaction.reply({ content: `⏳ You already claimed your daily coins. Next claim: <t:${Math.floor(next.getTime()/1000)}:R>`, ephemeral: true });
    }
    settings.streak.users[userId].coins = (settings.streak.users[userId].coins || 0) + 100;
    settings.streak.users[userId].lastClaim = now;
    updateGuildSettings(guildId, settings);
    await interaction.reply({ content: '✅ You claimed your daily coins! (+100 coins)', ephemeral: true });
  }
};
