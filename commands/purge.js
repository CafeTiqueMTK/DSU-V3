const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete messages in a channel')
    .addSubcommand(sub =>
      sub.setName('all')
        .setDescription('Delete all messages in a channel')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel to purge')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('bot')
        .setDescription('Delete only bot messages in a channel')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel to purge')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  async execute(interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ Missing permission: Manage Messages.', ephemeral: true });
    }
    const sub = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel');
    if (!channel) {
      return interaction.reply({ content: '❌ Channel is required.', ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    let deleted = 0;
    let lastId;
    try {
      while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;
        const messages = await channel.messages.fetch(options);
        if (messages.size === 0) break;
        const now = Date.now();
        let toDelete;
        if (sub === 'bot') {
          toDelete = messages.filter(m => m.author.bot && (now - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000));
        } else {
          toDelete = messages.filter(m => now - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
        }
        if (toDelete.size > 1) {
          await channel.bulkDelete(toDelete, true);
          deleted += toDelete.size;
        } else {
          for (const msg of messages.values()) {
            if (sub === 'bot' && !msg.author.bot) continue;
            await msg.delete().catch(() => {});
            deleted++;
          }
        }
        lastId = messages.last()?.id;
        if (messages.size < 100) break;
      }
      await interaction.editReply({ content: `✅ Purge complete. ${deleted} messages deleted.` });
    } catch (e) {
      await interaction.editReply({ content: '❌ Error during purge: ' + e.message });
    }
  }
};
