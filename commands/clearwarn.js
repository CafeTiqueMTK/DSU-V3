const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('clearwarn')
    .setDescription('Delete all warnings for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User whose warnings you want to delete')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const guildId = interaction.guild.id;
    const warnsPath = path.join(__dirname, '../warns.json');

    if (!fs.existsSync(warnsPath)) {
      const noWarningsEmbed = new EmbedBuilder()
        .setTitle('❌ No Warnings Found')
        .setDescription('No warnings database found.')
        .setColor(0xff0000)
        .setTimestamp();
      return interaction.reply({ embeds: [noWarningsEmbed], ephemeral: true });
    }

    let warns = JSON.parse(fs.readFileSync(warnsPath, 'utf-8'));

    if (!warns[guildId] || !warns[guildId][user.id]) {
      const noUserWarningsEmbed = new EmbedBuilder()
        .setTitle('❌ No Warnings Found')
        .setDescription(`No warnings found for **${user.tag}**.`)
        .addFields(
          { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
          { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true }
        )
        .setColor(0xff0000)
        .setTimestamp();
      return interaction.reply({ embeds: [noUserWarningsEmbed], ephemeral: true });
    }

    const warningCount = warns[guildId][user.id].length;
    delete warns[guildId][user.id];

    fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));

    const clearSuccessEmbed = new EmbedBuilder()
      .setTitle('🧹 Warnings Cleared')
      .setDescription(`All warnings for **${user.tag}** have been successfully deleted.`)
      .addFields(
        { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
        { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true },
        { name: '📊 Warnings Removed', value: `${warningCount} warning(s)`, inline: true }
      )
      .setColor(0x00ff00)
      .setTimestamp();
    return interaction.reply({ embeds: [clearSuccessEmbed], ephemeral: true });
  }
};
