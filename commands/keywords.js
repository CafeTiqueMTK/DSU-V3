const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getGuildData, saveGuildData } = require('../utils/guildManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('keywords')
    .setDescription('Manage blacklisted keywords')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a keyword to the blacklist')
        .addStringOption(opt =>
          opt.setName('word')
            .setDescription('The keyword to add to the blacklist')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('rem')
        .setDescription('Remove a keyword from the blacklist')
        .addStringOption(opt =>
          opt.setName('word')
            .setDescription('The keyword to remove from the blacklist')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('Show all blacklisted keywords')
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ 
        content: '❌ This command can only be used in a server.', 
        ephemeral: true 
      });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // Utiliser le gestionnaire de guild pour obtenir les données
    const settings = getGuildData(guildId, 'settings');

    // Initialize antiKeywords settings
    if (!settings[guildId].antiKeywords) {
      settings[guildId].antiKeywords = { enabled: false, keywords: [] };
    }

    try {
      if (sub === 'add') {
        const word = interaction.options.getString('word').toLowerCase();
        
        if (settings[guildId].antiKeywords.keywords.includes(word)) {
          const alreadyExistsEmbed = new EmbedBuilder()
            .setTitle('⚠️ Keyword Already Exists')
            .setDescription(`The keyword "${word}" is already in the blacklist.`)
            .setColor(0xffa500)
            .setTimestamp();
          return interaction.reply({ embeds: [alreadyExistsEmbed], ephemeral: true });
        }

        settings[guildId].antiKeywords.keywords.push(word);
        saveGuildData(guildId, settings, 'settings');

        const embed = new EmbedBuilder()
          .setTitle('✅ Keyword Added')
          .setDescription(`The keyword "${word}" has been added to the blacklist.`)
          .addFields(
            { name: 'Keyword', value: word, inline: true },
            { name: 'Total Keywords', value: `${settings[guildId].antiKeywords.keywords.length}`, inline: true },
            { name: 'Status', value: settings[guildId].antiKeywords.enabled ? '✅ Protection Active' : '❌ Protection Inactive', inline: true }
          )
          .setColor(0x00ff99)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'rem') {
        const word = interaction.options.getString('word').toLowerCase();
        
        if (!settings[guildId].antiKeywords.keywords.includes(word)) {
          const notFoundEmbed = new EmbedBuilder()
            .setTitle('⚠️ Keyword Not Found')
            .setDescription(`The keyword "${word}" is not in the blacklist.`)
            .setColor(0xffa500)
            .setTimestamp();
          return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
        }

        settings[guildId].antiKeywords.keywords = settings[guildId].antiKeywords.keywords.filter(k => k !== word);
        saveGuildData(guildId, settings, 'settings');

        const embed = new EmbedBuilder()
          .setTitle('✅ Keyword Removed')
          .setDescription(`The keyword "${word}" has been removed from the blacklist.`)
          .addFields(
            { name: 'Keyword', value: word, inline: true },
            { name: 'Total Keywords', value: `${settings[guildId].antiKeywords.keywords.length}`, inline: true },
            { name: 'Status', value: settings[guildId].antiKeywords.enabled ? '✅ Protection Active' : '❌ Protection Inactive', inline: true }
          )
          .setColor(0x00ff99)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'list') {
        const keywords = settings[guildId].antiKeywords.keywords;

        const embed = new EmbedBuilder()
          .setTitle('📋 Blacklisted Keywords')
          .setDescription(keywords.length > 0 ? 'All blacklisted keywords:' : 'No keywords in the blacklist.')
          .addFields(
            { name: 'Total Keywords', value: `${keywords.length}`, inline: true },
            { name: 'Protection Status', value: settings[guildId].antiKeywords.enabled ? '✅ Active' : '❌ Inactive', inline: true }
          )
          .setColor(0x0099ff)
          .setTimestamp();

        if (keywords.length > 0) {
          // Split keywords into chunks of 10 for better display
          const chunks = [];
          for (let i = 0; i < keywords.length; i += 10) {
            chunks.push(keywords.slice(i, i + 10));
          }
          
          chunks.forEach((chunk, index) => {
            embed.addFields({
              name: `Keywords ${index * 10 + 1}-${Math.min((index + 1) * 10, keywords.length)}`,
              value: chunk.map(k => `• ${k}`).join('\n'),
              inline: true
            });
          });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      console.error('Error in keywords command:', error);
      await interaction.reply({
        content: '❌ An error occurred while managing keywords.',
        ephemeral: true
      });
    }
  }
}; 