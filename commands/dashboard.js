const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settingsPath = path.join('/data', 'settings.json');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('dashboard')
    .setDescription('Interactive dashboard to configure all bot features')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    let settings;
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    } catch {
      settings = {};
    }
    if (!settings[guildId]) settings[guildId] = {};
    if (!settings[guildId].automod) settings[guildId].automod = { enabled: false, categories: {} };

    // List of main modules/features to display (updated for your current commands)
    const modules = [
      {
        name: 'Automod',
        key: 'automod',
        enabled: settings[guildId].automod.enabled,
        description: 'Filtering of links, spam, bad words, ghost ping, etc. Use /automod and /anti for config.',
        emoji: '🛡️'
      },
      {
        name: 'Logs',
        key: 'logs',
        enabled: settings[guildId]?.logs?.enabled,
        description: 'Logging of moderation, voice, joins, leaves. Use /log, /logconfig, /logchannelset.',
        emoji: '📜'
      },
      {
        name: 'Level System',
        key: 'level',
        enabled: settings[guildId]?.level?.enabled,
        description: 'XP and levels for active members. Use /level for all options.',
        emoji: '🏆'
      },
      {
        name: 'Autorole',
        key: 'autorole',
        enabled: settings[guildId]?.autorole?.enabled,
        description: 'Automatic role assignment for new members. Use /autorole.',
        emoji: '🎭'
      },
      {
        name: 'Welcome',
        key: 'welcome',
        enabled: settings[guildId]?.welcome?.enabled,
        description: 'Personalized welcome message. Use /welcome.',
        emoji: '👋'
      },
      {
        name: 'Farewell',
        key: 'farewell',
        enabled: settings[guildId]?.farewell?.enabled,
        description: 'Personalized departure message. Use /farewell.',
        emoji: '👋'
      },
      {
        name: 'Warn System',
        key: 'warn',
        enabled: true,
        description: 'Warn, clearwarn, viewwarn, warnaction. Use /warn, /clearwarn, /viewwarn, /warnaction.',
        emoji: '⚠️'
      },
      {
        name: 'Relay',
        key: 'relay',
        enabled: true,
        description: 'Relay messages as the bot. Use /relay.',
        emoji: '📢'
      }
    ];

    function getDashboardEmbed(selectedKey = null) {
      const embed = new EmbedBuilder()
        .setTitle('📊 Interactive Dashboard')
        .setDescription('Select a module to configure or toggle it on/off with the buttons below.')
        .setColor(0x00bfff)
        .setTimestamp();
      modules.forEach(mod => {
        embed.addFields({
          name: `${mod.emoji} ${mod.name} ${mod.enabled ? '🟢' : '🔴'}${selectedKey === mod.key ? ' ⬅️' : ''}`,
          value: `${mod.description}\nStatus: **${mod.enabled ? 'Enabled' : 'Disabled'}**`,
          inline: false
        });
      });
      if (selectedKey) {
        const mod = modules.find(m => m.key === selectedKey);
        embed.setFooter({ text: `Quick configuration: ${mod.name}` });
      }
      return embed;
    }

    function getDashboardRows(selectedKey = null) {
      const selectRows = [];
      let currentRow = new ActionRowBuilder();
      modules.forEach((mod, idx) => {
        if (currentRow.components.length === 5) {
          selectRows.push(currentRow);
          currentRow = new ActionRowBuilder();
        }
        currentRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`select_${mod.key}`)
            .setLabel(mod.name)
            .setStyle(selectedKey === mod.key ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setEmoji(mod.emoji)
        );
      });
      if (currentRow.components.length > 0) selectRows.push(currentRow);
      let actionRow = null;
      if (selectedKey) {
        const mod = modules.find(m => m.key === selectedKey);
        actionRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`toggle_${mod.key}`)
              .setLabel(mod.enabled ? `Disable` : `Enable`)
              .setStyle(mod.enabled ? ButtonStyle.Danger : ButtonStyle.Success)
              .setEmoji(mod.enabled ? '🔴' : '🟢'),
            new ButtonBuilder()
              .setCustomId('back_dashboard')
              .setLabel('Back')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('⬅️')
          );
      }
      return actionRow ? [...selectRows, actionRow] : selectRows;
    }

    await interaction.reply({
      embeds: [getDashboardEmbed()],
      components: getDashboardRows(),
      ephemeral: true
    });

    let selectedKey = null;
    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      componentType: ComponentType.Button,
      time: 10 * 60 * 1000
    });

    collector.on('collect', async i => {
      if (i.customId.startsWith('select_')) {
        selectedKey = i.customId.split('_')[1];
        await i.update({
          embeds: [getDashboardEmbed(selectedKey)],
          components: getDashboardRows(selectedKey)
        });
        return;
      }
      if (i.customId === 'back_dashboard') {
        selectedKey = null;
        await i.update({
          embeds: [getDashboardEmbed()],
          components: getDashboardRows()
        });
        return;
      }
      if (i.customId.startsWith('toggle_')) {
        const key = i.customId.split('_')[1];
        if (!settings[guildId][key]) settings[guildId][key] = {};
        settings[guildId][key].enabled = !settings[guildId][key].enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        modules.forEach(mod => {
          if (mod.key === key) mod.enabled = settings[guildId][key].enabled;
        });
        await i.update({
          embeds: [getDashboardEmbed(key)],
          components: getDashboardRows(key)
        });
        return;
      }
    });

    collector.on('end', async () => {
      try {
        const disabledRows = getDashboardRows(selectedKey).map(row => {
          row.components.forEach(btn => btn.setDisabled(true));
          return row;
        });
        await interaction.editReply({ components: disabledRows });
      } catch {}
    });
  }
};
