const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getGuildSettings, updateGuildSettings } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ecoman')
    .setDescription('Manage the economy (admin only)')
    .addSubcommand(cmd =>
      cmd.setName('addcoins')
        .setDescription('Add coins to a user')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to add coins to')
            .setRequired(true)
        )
        .addIntegerOption(opt =>
          opt.setName('amount')
            .setDescription('Amount of coins to add')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('removecoins')
        .setDescription('Remove coins from a user')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to remove coins from')
            .setRequired(true)
        )
        .addIntegerOption(opt =>
          opt.setName('amount')
            .setDescription('Amount of coins to remove')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('freeze')
        .setDescription('Freeze or unfreeze a user account')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to freeze/unfreeze')
            .setRequired(true)
        )
        .addBooleanOption(opt =>
          opt.setName('state')
            .setDescription('Freeze (true) or unfreeze (false)')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('setbooster')
        .setDescription('Set a booster role for coins')
        .addRoleOption(opt =>
          opt.setName('role')
            .setDescription('Role to boost coins')
            .setRequired(true)
        )
        .addIntegerOption(opt =>
          opt.setName('multiplier')
            .setDescription('Multiplier (e.g. 2 = x2)')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You must be an administrator to use this command.', ephemeral: true });
    }
    const guildId = interaction.guild.id;
    const settings = getGuildSettings(guildId);
    if (!settings.streak) settings.streak = { enabled: false, users: {} };
    if (!settings.streak.users) settings.streak.users = {};
    if (!settings.streak.boosters) settings.streak.boosters = {};
    const sub = interaction.options.getSubcommand();
    if (sub === 'addcoins') {
      const user = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      if (!settings.streak.users[user.id]) settings.streak.users[user.id] = { days: 0, coins: 0 };
      settings.streak.users[user.id].coins = (settings.streak.users[user.id].coins || 0) + amount;
      updateGuildSettings(guildId, settings);
      await interaction.reply({ content: `✅ Added ${amount} coins to <@${user.id}>.`, ephemeral: true });
    } else if (sub === 'removecoins') {
      const user = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');
      if (!settings.streak.users[user.id]) settings.streak.users[user.id] = { days: 0, coins: 0 };
      settings.streak.users[user.id].coins = Math.max(0, (settings.streak.users[user.id].coins || 0) - amount);
      updateGuildSettings(guildId, settings);
      await interaction.reply({ content: `✅ Removed ${amount} coins from <@${user.id}>.`, ephemeral: true });
    } else if (sub === 'freeze') {
      const user = interaction.options.getUser('user');
      const state = interaction.options.getBoolean('state');
      if (!settings.streak.users[user.id]) settings.streak.users[user.id] = { days: 0, coins: 0 };
      settings.streak.users[user.id].frozen = state;
      updateGuildSettings(guildId, settings);
      await interaction.reply({ content: `✅ Account for <@${user.id}> is now ${state ? 'frozen' : 'unfrozen'}.`, ephemeral: true });
    } else if (sub === 'setbooster') {
      const role = interaction.options.getRole('role');
      const multiplier = interaction.options.getInteger('multiplier');
      settings.streak.boosters[role.id] = multiplier;
      updateGuildSettings(guildId, settings);
      await interaction.reply({ content: `✅ Booster role <@&${role.id}> set to x${multiplier} coins.`, ephemeral: true });
    }
  }
};
