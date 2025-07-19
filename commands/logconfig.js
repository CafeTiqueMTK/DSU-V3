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
    )
    .addSubcommand(cmd =>
      cmd.setName('commands')
        .setDescription('Enable or disable the "commands" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('roles')
        .setDescription('Enable or disable the "roles" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('soundboard')
        .setDescription('Enable or disable the "soundboard" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('tickets')
        .setDescription('Enable or disable the "tickets" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('channels')
        .setDescription('Enable or disable the "channels" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('economy')
        .setDescription('Enable or disable the "economy" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('bulkdelete')
        .setDescription('Enable or disable the "bulkdelete" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('messages')
        .setDescription('Enable or disable the "messages" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('invites')
        .setDescription('Enable or disable the "invites" category')
        .addBooleanOption(option =>
          option.setName('state')
            .setDescription('Enable or disable')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('enableall')
        .setDescription('Enable all log categories at once')
    )
    .addSubcommand(cmd =>
      cmd.setName('disableall')
        .setDescription('Disable all log categories at once')
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

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
          automod: false,
          commands: false,
          roles: false,
          soundboard: false,
          tickets: false,
          channels: false,
          economy: false,
          bulkdelete: false,
          messages: false,
          invites: false
        }
      };
    }

    // Handle enableall and disableall commands
    if (sub === 'enableall') {
      const categories = Object.keys(settings[guildId].logs.categories);
      categories.forEach(category => {
        settings[guildId].logs.categories[category] = true;
      });
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      
      const embed = new EmbedBuilder()
        .setTitle('✅ All Categories Enabled')
        .setDescription(`All ${categories.length} log categories have been enabled:\n\n${categories.map(cat => `• \`${cat}\``).join('\n')}`)
        .setColor(0x00ff99)
        .setFooter({ text: 'DSU Logger System' })
        .setTimestamp(new Date());
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (sub === 'disableall') {
      const categories = Object.keys(settings[guildId].logs.categories);
      categories.forEach(category => {
        settings[guildId].logs.categories[category] = false;
      });
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      
      const embed = new EmbedBuilder()
        .setTitle('❌ All Categories Disabled')
        .setDescription(`All ${categories.length} log categories have been disabled:\n\n${categories.map(cat => `• \`${cat}\``).join('\n')}`)
        .setColor(0xff5555)
        .setFooter({ text: 'DSU Logger System' })
        .setTimestamp(new Date());
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Handle individual category commands
    const state = interaction.options.getBoolean('state');
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
