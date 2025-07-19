const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod-action')
    .setDescription('Manage actions for automod rules')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set actions for a rule')
        .addStringOption(opt =>
          opt.setName('rule_id')
            .setDescription('ID of the rule')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Type of action')
            .setRequired(true)
            .addChoices(
              { name: 'Block Message', value: 'block_message' },
              { name: 'Send Alert', value: 'send_alert' },
              { name: 'Timeout', value: 'timeout' },
              { name: 'Block Member', value: 'block_member' }
            )
        )
        .addIntegerOption(opt =>
          opt.setName('duration')
            .setDescription('Duration in seconds (for timeout action)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(2419200) // 28 days max
        )
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel for alerts (for send_alert action)')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List actions of a rule')
        .addStringOption(opt =>
          opt.setName('rule_id')
            .setDescription('ID of the rule')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('clear')
        .setDescription('Clear all actions from a rule')
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
      if (sub === 'set') {
        const ruleId = interaction.options.getString('rule_id');
        const actionType = interaction.options.getString('action');
        const duration = interaction.options.getInteger('duration');
        const channel = interaction.options.getChannel('channel');
        
        const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
        
        // Map action type to Discord action type
        const actionTypeMap = {
          'block_message': 1,
          'send_alert': 2,
          'timeout': 3,
          'block_member': 4
        };

        const discordActionType = actionTypeMap[actionType];
        const action = {
          type: discordActionType,
          metadata: {}
        };

        // Add metadata based on action type
        if (actionType === 'timeout' && duration) {
          action.metadata.durationSeconds = duration;
        } else if (actionType === 'send_alert' && channel) {
          action.metadata.channelId = channel.id;
        }

        // Update rule with new actions
        await rule.edit({
          actions: [action]
        });

        const embed = new EmbedBuilder()
          .setTitle('✅ Action Set')
          .setDescription(`Successfully set action **${actionType}** for rule **${rule.name}**`)
          .addFields(
            { name: 'Rule ID', value: `\`${rule.id}\``, inline: true },
            { name: 'Action', value: actionType, inline: true }
          )
          .setColor(0x00ff99)
          .setTimestamp();

        if (duration) {
          embed.addFields({ name: 'Duration', value: `${duration} seconds`, inline: true });
        }
        if (channel) {
          embed.addFields({ name: 'Alert Channel', value: `<#${channel.id}>`, inline: true });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'list') {
        const ruleId = interaction.options.getString('rule_id');
        const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
        
        if (rule.actions.length === 0) {
          const embed = new EmbedBuilder()
            .setTitle('📝 Actions List')
            .setDescription(`No actions configured for rule **${rule.name}**`)
            .setColor(0x0099ff)
            .setTimestamp();
          
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setTitle('📝 Actions List')
          .setDescription(`**${rule.actions.length}** action(s) for rule **${rule.name}**:`)
          .setColor(0x0099ff)
          .setTimestamp();

        rule.actions.forEach((action, index) => {
          const actionName = this.getActionName(action.type);
          let actionDetails = `**Type:** ${actionName}`;
          
          if (action.metadata.durationSeconds) {
            actionDetails += `\n**Duration:** ${action.metadata.durationSeconds} seconds`;
          }
          if (action.metadata.channelId) {
            actionDetails += `\n**Channel:** <#${action.metadata.channelId}>`;
          }

          embed.addFields({
            name: `Action ${index + 1}`,
            value: actionDetails,
            inline: true
          });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'clear') {
        const ruleId = interaction.options.getString('rule_id');
        const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
        
        const actionsCount = rule.actions.length;
        
        await rule.edit({
          actions: []
        });

        const embed = new EmbedBuilder()
          .setTitle('🧹 Actions Cleared')
          .setDescription(`Cleared **${actionsCount}** action(s) from rule **${rule.name}**`)
          .setColor(0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }

    } catch (error) {
      console.error('Automod action error:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while managing actions.', 
        ephemeral: true 
      });
    }
  },

  getActionName(type) {
    const actions = {
      1: 'Block Message',
      2: 'Send Alert',
      3: 'Timeout',
      4: 'Block Member'
    };
    return actions[type] || 'Unknown';
  }
}; 