const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod-rule')
    .setDescription('Manage Discord automod rules')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Create a new automod rule')
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('Name of the rule')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('Type of rule')
            .setRequired(true)
            .addChoices(
              { name: 'Keyword Filter', value: 'keyword' },
              { name: 'Harmful Link', value: 'harmful_link' },
              { name: 'Spam', value: 'spam' },
              { name: 'Mention Spam', value: 'mention_spam' }
            )
        )
        .addStringOption(opt =>
          opt.setName('keywords')
            .setDescription('Keywords to filter (for keyword type, separate with commas)')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('Edit an existing automod rule')
        .addStringOption(opt =>
          opt.setName('rule_id')
            .setDescription('ID of the rule to edit')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('New name for the rule')
            .setRequired(false)
        )
        .addBooleanOption(opt =>
          opt.setName('enabled')
            .setDescription('Enable or disable the rule')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('delete')
        .setDescription('Delete an automod rule')
        .addStringOption(opt =>
          opt.setName('rule_id')
            .setDescription('ID of the rule to delete')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all automod rules')
    )
    .addSubcommand(sub =>
      sub.setName('info')
        .setDescription('Get detailed information about a rule')
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
      if (sub === 'create') {
        const name = interaction.options.getString('name');
        const type = interaction.options.getString('type');
        const keywords = interaction.options.getString('keywords');

        // Map type to Discord trigger type
        const triggerTypeMap = {
          'keyword': 1,
          'harmful_link': 2,
          'spam': 3,
          'mention_spam': 5
        };

        const triggerType = triggerTypeMap[type];
        const triggerMetadata = {};

        if (type === 'keyword' && keywords) {
          triggerMetadata.keywordFilter = keywords.split(',').map(k => k.trim());
        } else if (type === 'mention_spam') {
          triggerMetadata.mentionTotalLimit = 5;
        }

        // Check if a rule of this type already exists
        const existingRules = await interaction.guild.autoModerationRules.fetch();
        const existingRuleOfType = existingRules.find(rule => rule.triggerType === triggerType);
        
        if (existingRuleOfType) {
          const embed = new EmbedBuilder()
            .setTitle('⚠️ Rule Already Exists')
            .setDescription(`A rule of type **${type}** already exists.`)
            .addFields(
              { name: 'Existing Rule', value: `**${existingRuleOfType.name}** (\`${existingRuleOfType.id}\`)`, inline: false },
              { name: 'Solution', value: 'Delete the existing rule first, or edit it instead.', inline: false }
            )
            .setColor(0xffa500)
            .setTimestamp();
          
          await interaction.reply({ embeds: [embed], ephemeral: true });
          return;
        }

        const rule = await interaction.guild.autoModerationRules.create({
          name: name,
          creatorId: interaction.client.user.id,
          enabled: true,
          eventType: 1, // MESSAGE_SEND
          triggerType: triggerType,
          triggerMetadata: triggerMetadata,
          actions: [
            {
              type: 1, // BLOCK_MESSAGE
              metadata: {}
            }
          ]
        });

        const embed = new EmbedBuilder()
          .setTitle('✅ Rule Created')
          .setDescription(`Successfully created automod rule **${name}**`)
          .addFields(
            { name: 'Rule ID', value: `\`${rule.id}\``, inline: true },
            { name: 'Type', value: type, inline: true },
            { name: 'Status', value: '✅ Enabled', inline: true }
          )
          .setColor(0x00ff99)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'edit') {
        const ruleId = interaction.options.getString('rule_id');
        const newName = interaction.options.getString('name');
        const enabled = interaction.options.getBoolean('enabled');

        const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
        
        const updateData = {};
        if (newName) updateData.name = newName;
        if (enabled !== null) updateData.enabled = enabled;

        await rule.edit(updateData);

        const embed = new EmbedBuilder()
          .setTitle('🔧 Rule Updated')
          .setDescription(`Successfully updated rule **${rule.name}**`)
          .addFields(
            { name: 'Rule ID', value: `\`${rule.id}\``, inline: true },
            { name: 'Status', value: rule.enabled ? '✅ Enabled' : '❌ Disabled', inline: true }
          )
          .setColor(0x00ff99)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'delete') {
        const ruleId = interaction.options.getString('rule_id');
        const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
        
        await rule.delete();

        const embed = new EmbedBuilder()
          .setTitle('🗑️ Rule Deleted')
          .setDescription(`Successfully deleted rule **${rule.name}**`)
          .setColor(0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'list') {
        const rules = await interaction.guild.autoModerationRules.fetch();
        
        if (rules.size === 0) {
          const embed = new EmbedBuilder()
            .setTitle('📝 Automod Rules')
            .setDescription('No automod rules found.')
            .setColor(0x0099ff)
            .setTimestamp();
          
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setTitle('📝 Automod Rules')
          .setDescription(`**${rules.size}** rule(s) found:`)
          .setColor(0x0099ff)
          .setTimestamp();

        rules.forEach(rule => {
          const status = rule.enabled ? '✅' : '❌';
          embed.addFields({
            name: `${status} ${rule.name}`,
            value: `**ID:** \`${rule.id}\`\n**Type:** ${this.getTriggerTypeName(rule.triggerType)}`,
            inline: true
          });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'info') {
        const ruleId = interaction.options.getString('rule_id');
        const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
        
        const embed = new EmbedBuilder()
          .setTitle(`📋 Rule Info: ${rule.name}`)
          .addFields(
            { name: 'Rule ID', value: `\`${rule.id}\``, inline: true },
            { name: 'Status', value: rule.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Type', value: this.getTriggerTypeName(rule.triggerType), inline: true },
            { name: 'Created', value: `<t:${Math.floor(rule.createdTimestamp / 1000)}:F>`, inline: false }
          )
          .setColor(0x0099ff)
          .setTimestamp();

        if (rule.triggerMetadata.keywordFilter) {
          embed.addFields({
            name: 'Keywords',
            value: rule.triggerMetadata.keywordFilter.map(k => `\`${k}\``).join(', '),
            inline: false
          });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }

    } catch (error) {
      console.error('Automod rule error:', error);
      
      // Handle specific Discord API errors
      if (error.code === 50035 && error.message.includes('AUTO_MODERATION_MAX_RULES_OF_TYPE_EXCEEDED')) {
        const embed = new EmbedBuilder()
          .setTitle('⚠️ Rule Limit Reached')
          .setDescription('You have reached the maximum number of automod rules for this type.')
          .addFields(
            { name: 'Error', value: 'Maximum number of rules with this trigger type exceeded', inline: false },
            { name: 'Solution', value: 'Delete an existing rule of the same type first, then create a new one.', inline: false }
          )
          .setColor(0xffa500)
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      
      if (error.code === 50035) {
        const embed = new EmbedBuilder()
          .setTitle('❌ Invalid Form Body')
          .setDescription('The rule configuration is invalid.')
          .addFields(
            { name: 'Error', value: error.message || 'Unknown error', inline: false },
            { name: 'Solution', value: 'Check your rule parameters and try again.', inline: false }
          )
          .setColor(0xff5555)
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      
      await interaction.reply({ 
        content: '❌ An error occurred while managing the automod rule.', 
        ephemeral: true 
      });
    }
  },

  getTriggerTypeName(type) {
    const types = {
      1: 'Keyword Filter',
      2: 'Harmful Link',
      3: 'Spam',
      4: 'Keyword Preset',
      5: 'Mention Spam'
    };
    return types[type] || 'Unknown';
  }
}; 