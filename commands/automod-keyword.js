const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod-keyword')
    .setDescription('Manage keywords for automod rules')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add keywords to a rule')
        .addStringOption(opt =>
          opt.setName('rule_id')
            .setDescription('ID of the rule')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('keywords')
            .setDescription('Keywords to add (separate with commas)')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove keywords from a rule')
        .addStringOption(opt =>
          opt.setName('rule_id')
            .setDescription('ID of the rule')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('keywords')
            .setDescription('Keywords to remove (separate with commas)')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List keywords of a rule')
        .addStringOption(opt =>
          opt.setName('rule_id')
            .setDescription('ID of the rule')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('clear')
        .setDescription('Clear all keywords from a rule')
        .addStringOption(opt =>
          opt.setName('rule_id')
            .setDescription('ID of the rule')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    try {
      if (sub === 'add') {
        const ruleId = interaction.options.getString('rule_id');
        const keywords = interaction.options.getString('keywords');
        
        const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
        
        if (rule.triggerType !== 1) {
          return interaction.reply({ 
            content: '❌ This rule is not a keyword filter rule.', 
            ephemeral: true 
          });
        }

        const currentKeywords = rule.triggerMetadata.keywordFilter || [];
        const newKeywords = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
        
        // Add new keywords (avoid duplicates)
        const updatedKeywords = [...new Set([...currentKeywords, ...newKeywords])];
        
        await rule.edit({
          triggerMetadata: {
            ...rule.triggerMetadata,
            keywordFilter: updatedKeywords
          }
        });

        const embed = new EmbedBuilder()
          .setTitle('✅ Keywords Added')
          .setDescription(`Added **${newKeywords.length}** keyword(s) to rule **${rule.name}**`)
          .addFields(
            { name: 'New Keywords', value: newKeywords.map(k => `\`${k}\``).join(', '), inline: false },
            { name: 'Total Keywords', value: `${updatedKeywords.length}`, inline: true }
          )
          .setColor(0x00ff99)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'remove') {
        const ruleId = interaction.options.getString('rule_id');
        const keywords = interaction.options.getString('keywords');
        
        const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
        
        if (rule.triggerType !== 1) {
          return interaction.reply({ 
            content: '❌ This rule is not a keyword filter rule.', 
            ephemeral: true 
          });
        }

        const currentKeywords = rule.triggerMetadata.keywordFilter || [];
        const keywordsToRemove = keywords.split(',').map(k => k.trim());
        
        // Remove keywords
        const updatedKeywords = currentKeywords.filter(k => !keywordsToRemove.includes(k));
        
        await rule.edit({
          triggerMetadata: {
            ...rule.triggerMetadata,
            keywordFilter: updatedKeywords
          }
        });

        const embed = new EmbedBuilder()
          .setTitle('🗑️ Keywords Removed')
          .setDescription(`Removed **${keywordsToRemove.length}** keyword(s) from rule **${rule.name}**`)
          .addFields(
            { name: 'Removed Keywords', value: keywordsToRemove.map(k => `\`${k}\``).join(', '), inline: false },
            { name: 'Remaining Keywords', value: `${updatedKeywords.length}`, inline: true }
          )
          .setColor(0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'list') {
        const ruleId = interaction.options.getString('rule_id');
        const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
        
        if (rule.triggerType !== 1) {
          return interaction.reply({ 
            content: '❌ This rule is not a keyword filter rule.', 
            ephemeral: true 
          });
        }

        const keywords = rule.triggerMetadata.keywordFilter || [];
        
        if (keywords.length === 0) {
          const embed = new EmbedBuilder()
            .setTitle('📝 Keywords List')
            .setDescription(`No keywords found in rule **${rule.name}**`)
            .setColor(0x0099ff)
            .setTimestamp();
          
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setTitle('📝 Keywords List')
          .setDescription(`**${keywords.length}** keyword(s) in rule **${rule.name}**:`)
          .addFields({
            name: 'Keywords',
            value: keywords.map(k => `\`${k}\``).join(', '),
            inline: false
          })
          .setColor(0x0099ff)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'clear') {
        const ruleId = interaction.options.getString('rule_id');
        const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
        
        if (rule.triggerType !== 1) {
          return interaction.reply({ 
            content: '❌ This rule is not a keyword filter rule.', 
            ephemeral: true 
          });
        }

        const keywordsCount = rule.triggerMetadata.keywordFilter?.length || 0;
        
        await rule.edit({
          triggerMetadata: {
            ...rule.triggerMetadata,
            keywordFilter: []
          }
        });

        const embed = new EmbedBuilder()
          .setTitle('🧹 Keywords Cleared')
          .setDescription(`Cleared **${keywordsCount}** keyword(s) from rule **${rule.name}**`)
          .setColor(0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }

    } catch (error) {
      console.error('Automod keyword error:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while managing keywords.', 
        ephemeral: true 
      });
    }
  }
}; 