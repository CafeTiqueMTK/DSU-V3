const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const automodActionsPath = path.join(__dirname, '../automod_actions.json');
const warnsPath = path.join(__dirname, '../warn.json');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('userinfo')
    .setDescription('Displays user info and moderation history')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to display')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    // Basic info
    let desc = `**Profile name:** ${user.globalName || user.username}\n`;
    desc += `**Username:** ${user.username}\n`;
    if (member) {
      desc += `**Joined server:** <t:${Math.floor(member.joinedTimestamp/1000)}:F>\n`;
      desc += `**Roles:** ${member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).join(', ') || 'None'}`;
    }

    // Automod actions
    let automodLogs = [];
    if (fs.existsSync(automodActionsPath)) {
      try {
        const actions = JSON.parse(fs.readFileSync(automodActionsPath, 'utf-8'));
        automodLogs = actions[interaction.guild.id]?.[user.id] || [];
      } catch {}
    }
    let automodStr = automodLogs.length
      ? automodLogs.map(a => `• [${new Date(a.date).toLocaleString()}] **${a.sanction}**: ${a.reason}`).join('\n')
      : 'No automod actions.';

    // Warnings
    let warns = [];
    if (fs.existsSync(warnsPath)) {
      try {
        const warnsData = JSON.parse(fs.readFileSync(warnsPath, 'utf-8'));
        warns = warnsData[interaction.guild.id]?.[user.id] || [];
      } catch {}
    }
    let warnsStr = warns.length
      ? warns.map(w => `• [${w.date}] **${w.moderator}**: ${w.reason}`).join('\n')
      : 'No warnings.';

    const embed = new EmbedBuilder()
      .setTitle(`User info: ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(desc)
      .addFields(
        { name: 'Automod actions', value: automodStr, inline: false },
        { name: 'Warnings', value: warnsStr, inline: false }
      )
      .setColor(0x00bfff)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
