const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('viewwarn')
    .setDescription('View a user\'s warnings')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User whose warnings you want to see')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const guildId = interaction.guild.id;
    const warnsPath = path.join(__dirname, '../warns.json');

    if (!fs.existsSync(warnsPath)) {
      return interaction.reply({ content: '❌ No warnings recorded.', ephemeral: true });
    }

    const warns = JSON.parse(fs.readFileSync(warnsPath, 'utf-8'));

    const userWarns = warns[guildId]?.[user.id];

    if (!userWarns || userWarns.length === 0) {
      return interaction.reply({ content: `✅ ${user.tag} has no warnings.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`📄 Warnings for ${user.tag}`)
      .setColor(0xffcc00)
      .setFooter({ text: `Total: ${userWarns.length} warning(s)` });

    userWarns.forEach((warn, index) => {
      embed.addFields({
        name: `⚠️ Warning #${index + 1}`,
        value: `**Moderator:** ${warn.moderator}\n**Reason:** ${warn.reason}\n**Date:** ${warn.date}`,
      });
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
