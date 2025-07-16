const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const settingsPath = './settings.json';

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('logger')
    .setDescription('Configure log categories')
    .addSubcommand(cmd =>
      cmd.setName('arrived')
        .setDescription('Enable or disable the "arrived" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('farewell')
        .setDescription('Enable or disable the "farewell" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('vocal')
        .setDescription('Enable or disable the "vocal" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('mod')
        .setDescription('Enable or disable the "mod" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('automod')
        .setDescription('Enable or disable the "automod" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const state = interaction.options.getBoolean('state');

    if (!fs.existsSync(settingsPath)) fs.writeFileSync(settingsPath, '{}');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

    if (!settings[guildId]) settings[guildId] = {};
    if (!settings[guildId].logs) {
      settings[guildId].logs = {
        enabled: false,
        categories: {
          arrived: false,
          farewell: false,
          vocal: false,
          mod: false,
          automod: false
        }
      };
    }

    if (settings[guildId].logs.categories.hasOwnProperty(sub)) {
      settings[guildId].logs.categories[sub] = state;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      const embed = new EmbedBuilder()
        .setTitle('🔧 Log Category Updated')
        .setDescription(`The category \`${sub}\` is now ${state ? 'enabled ✅' : 'disabled ❌'}.`)
        .setColor(state ? 0x00bfff : 0xff5555);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('❌ Unknown Category')
        .setDescription('The specified category does not exist.')
        .setColor(0xff5555);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
