const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)  
  .setName('clearmsg')
    .setDescription('Delete the last messages from a user in this channel')
    .addSubcommand(sub =>
      sub.setName('user')
        .setDescription('Delete messages from a user')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('Target user')
            .setRequired(true)
        )
        .addIntegerOption(opt =>
          opt.setName('count')
            .setDescription('Number of messages to delete (max 100)')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub !== 'user') return;

    const user = interaction.options.getUser('user');
    const count = interaction.options.getInteger('count');
    if (count < 1 || count > 100) {
      await interaction.reply({ content: 'The number must be between 1 and 100.', ephemeral: true });
      return;
    }

    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: 100 });
    const toDelete = messages.filter(m => m.author.id === user.id).first(count);

    if (toDelete.length === 0) {
      await interaction.reply({ content: `No messages found for ${user.tag}.`, ephemeral: true });
      return;
    }

    await channel.bulkDelete(toDelete, true);
    await interaction.reply({ content: `🧹 ${toDelete.length} message(s) from ${user.tag} deleted.`, ephemeral: true });
  }
};
