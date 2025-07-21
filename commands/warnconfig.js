const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settingsPath = path.join('/data', 'settings.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnconfig')
    .setDescription('Configure automatic actions based on warning count')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('setaction')
        .setDescription('Set an automatic action for a specific warning count')
        .addIntegerOption(opt =>
          opt.setName('warn_count')
            .setDescription('Number of warnings to trigger the action')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Action to take')
            .setRequired(true)
            .addChoices(
              { name: 'Kick', value: 'kick' },
              { name: 'Ban', value: 'ban' },
              { name: 'Mute (10 minutes)', value: 'mute_10' },
              { name: 'Mute (30 minutes)', value: 'mute_30' },
              { name: 'Mute (1 hour)', value: 'mute_60' },
              { name: 'Mute (1 day)', value: 'mute_1440' },
              { name: 'Remove all warnings', value: 'clear_warns' }
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('removeaction')
        .setDescription('Remove an automatic action')
        .addIntegerOption(opt =>
          opt.setName('warn_count')
            .setDescription('Number of warnings')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(10)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all configured automatic actions')
    )
    .addSubcommand(sub =>
      sub.setName('reset')
        .setDescription('Reset all automatic actions')
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
    }

    const guildId = interaction.guild.id;
    let settings;
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    } catch {
      settings = {};
    }

    if (!settings[guildId]) settings[guildId] = {};
    if (!settings[guildId].warnActions) settings[guildId].warnActions = {};

    const sub = interaction.options.getSubcommand();

    try {
      if (sub === 'setaction') {
        const warnCount = interaction.options.getInteger('warn_count');
        const action = interaction.options.getString('action');

        settings[guildId].warnActions[warnCount] = action;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle('✅ Action Configured')
          .setDescription(`Automatic action set for **${warnCount} warning(s)**`)
          .addFields(
            { name: 'Action', value: action, inline: true },
            { name: 'Trigger', value: `${warnCount} warning(s)`, inline: true }
          )
          .setColor(0x00ff99)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'removeaction') {
        const warnCount = interaction.options.getInteger('warn_count');

        if (settings[guildId].warnActions[warnCount]) {
          delete settings[guildId].warnActions[warnCount];
          fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

          const embed = new EmbedBuilder()
            .setTitle('🗑️ Action Removed')
            .setDescription(`Automatic action removed for **${warnCount} warning(s)**`)
            .setColor(0xff5555)
            .setTimestamp();

          await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          await interaction.reply({ content: '❌ No action configured for this warning count.', ephemeral: true });
        }

      } else if (sub === 'list') {
        const actions = settings[guildId].warnActions;
        const actionEntries = Object.entries(actions);

        if (actionEntries.length === 0) {
          const embed = new EmbedBuilder()
            .setTitle('📝 Warning Actions')
            .setDescription('No automatic actions configured.')
            .setColor(0x0099ff)
            .setTimestamp();

          await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          const embed = new EmbedBuilder()
            .setTitle('📝 Warning Actions')
            .setDescription(`**${actionEntries.length}** action(s) configured:`)
            .setColor(0x0099ff)
            .setTimestamp();

          actionEntries.forEach(([warnCount, action]) => {
            embed.addFields({
              name: `${warnCount} Warning(s)`,
              value: action,
              inline: true
            });
          });

          await interaction.reply({ embeds: [embed], ephemeral: true });
        }

      } else if (sub === 'reset') {
        settings[guildId].warnActions = {};
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle('♻️ Actions Reset')
          .setDescription('All automatic warning actions have been reset.')
          .setColor(0xffcc00)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }

    } catch (error) {
      console.error('Warn config error:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while configuring warning actions.', 
        ephemeral: true 
      });
    }
  }
}; 