const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('warnaction')
    .setDescription('Set an automatic action based on the number of warnings')
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('Number of warnings required to apply the action')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform (warn, mute, kick, ban)')
        .setRequired(true)
        .addChoices(
          { name: 'warn', value: 'warn' },
          { name: 'mute', value: 'mute' },
          { name: 'kick', value: 'kick' },
          { name: 'ban', value: 'ban' }
        )
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Mute duration in minutes (only for mute)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const count = interaction.options.getInteger('count');
    const action = interaction.options.getString('action');
    const duration = interaction.options.getInteger('duration');
    const guildId = interaction.guild.id;

    const warnsPath = path.join(__dirname, '../warns.json');
    let warnsData = {};

    if (fs.existsSync(warnsPath)) {
      warnsData = JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
    }

    if (!warnsData[guildId]) warnsData[guildId] = {};
    if (!warnsData[guildId].actions) warnsData[guildId].actions = [];

    // Check if a rule with this count already exists
    const existingIndex = warnsData[guildId].actions.findIndex(a => a.count === count);
    if (existingIndex !== -1) {
      warnsData[guildId].actions[existingIndex].action = action;
      if (action === 'mute') {
        warnsData[guildId].actions[existingIndex].duration = duration || 10;
      } else {
        delete warnsData[guildId].actions[existingIndex].duration;
      }
    } else {
      const rule = { count, action };
      if (action === 'mute') rule.duration = duration || 10;
      warnsData[guildId].actions.push(rule);
    }

    fs.writeFileSync(warnsPath, JSON.stringify(warnsData, null, 2));

    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('Action registered')
      .setDescription(`✅ Action **${action}** set for **${count} warning(s)**.` + (action === 'mute' ? `\n\n⏳ Duration: **${duration || 10} min**` : ''));

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
