const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const settingsPath = path.join(__dirname, '../settings.json');

module.exports = {
  data: new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) 
    .setName('mod')
    .setDescription('Moderation commands (ban, kick, warn, mute)')
    .addSubcommand(sub =>
      sub.setName('ban')
        .setDescription('Ban a user')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to ban')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('reason')
            .setDescription('Reason for ban')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('kick')
        .setDescription('Kick a user')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to kick')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('reason')
            .setDescription('Reason for kick')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('warn')
        .setDescription('Warn a user')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to warn')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('reason')
            .setDescription('Reason for warn')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('mute')
        .setDescription('Mute a user')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to mute')
            .setRequired(true)
        )
        .addIntegerOption(opt =>
          opt.setName('duration')
            .setDescription('Mute duration in minutes (leave empty for 10 minutes)')
            .setMinValue(1)
            .setMaxValue(1440)
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('reason')
            .setDescription('Reason for mute')
            .setRequired(false)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    // --- Custom moderator role check ---
    let allow = false;
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      const guildId = interaction.guild.id;
      const moderatorRoleId = settings[guildId]?.moderatorRole;
      if (moderatorRoleId) {
        if (interaction.member.roles.cache.has(moderatorRoleId)) {
          allow = true;
        }
      }
    } catch {}
    // If no role set, fallback to native permissions
    if (!allow && !interaction.memberPermissions.has(PermissionFlagsBits.KickMembers) || interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({ content: 'Permission denied. Only moderators can use this command.', ephemeral: true });
      return;
    }

    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason specified';
    let duration = interaction.options.getInteger('duration');
    if (sub === 'mute') {
      if (!duration || duration <= 0) duration = 10;
    }
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      await interaction.reply({ content: 'User not found on this server.', ephemeral: true });
      return;
    }

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      await interaction.reply({ content: 'Permission denied.', ephemeral: true });
      return;
    }

    if (sub === 'ban') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        await interaction.reply({ content: 'Permission denied to ban.', ephemeral: true });
        return;
      }
      // DM the user with embed
      try {
        const embed = new EmbedBuilder()
          .setTitle('⛔ Ban')
          .setDescription(`You have been banned from **${interaction.guild.name}**.\n\n**Reason:** ${reason}`)
          .setColor(0x8B0000)
          .setTimestamp();
        await user.send({ embeds: [embed] });
      } catch {}
      await member.ban({ reason }).catch(() => {});
      await interaction.reply({ content: `🔨 ${user.tag} banned. Reason: ${reason}`, ephemeral: true });

      // Moderation logging
      try {
        const fs = require('fs');
        const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
        const conf = settings[interaction.guild.id]?.logs;
        if (conf?.enabled && conf.categories?.mod && conf.channel) {
          const logChannel = interaction.guild.channels.cache.get(conf.channel);
          if (logChannel) {
            logChannel.send({
              embeds: [{
                title: `⚠️ Sanction: Ban`,
                fields: [
                  { name: 'Member', value: `${user.tag}`, inline: true },
                  { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                  { name: 'Reason', value: reason }
                ],
                color: 0xffa500,
                timestamp: new Date()
              }]
            });
          }
        }
      } catch {}
    } else if (sub === 'kick') {
      // DM the user with embed
      try {
        const embed = new EmbedBuilder()
          .setTitle('👢 Kick')
          .setDescription(`You have been kicked from **${interaction.guild.name}**.\n\n**Reason:** ${reason}`)
          .setColor(0xffa500)
          .setTimestamp();
        await user.send({ embeds: [embed] });
      } catch {}
      await member.kick(reason).catch(() => {});
      await interaction.reply({ content: `👢 ${user.tag} kicked. Reason: ${reason}`, ephemeral: true });

      // Moderation logging
      try {
        const fs = require('fs');
        const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
        const conf = settings[interaction.guild.id]?.logs;
        if (conf?.enabled && conf.categories?.mod && conf.channel) {
          const logChannel = interaction.guild.channels.cache.get(conf.channel);
          if (logChannel) {
            logChannel.send({
              embeds: [{
                title: `⚠️ Sanction: Kick`,
                fields: [
                  { name: 'Member', value: `${user.tag}`, inline: true },
                  { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                  { name: 'Reason', value: reason }
                ],
                color: 0xffa500,
                timestamp: new Date()
              }]
            });
          }
        }
      } catch {}
    } else if (sub === 'warn') {
      // Add to warns.json
      const fs = require('fs');
      const path = require('path');
      const warnsPath = path.join(__dirname, '../warns.json');
      let warnsData = {};
      if (fs.existsSync(warnsPath)) {
        warnsData = JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
      }
      if (!warnsData[interaction.guild.id]) warnsData[interaction.guild.id] = {};
      if (!warnsData[interaction.guild.id][user.id]) warnsData[interaction.guild.id][user.id] = [];
      warnsData[interaction.guild.id][user.id].push({
        moderator: interaction.user.tag,
        reason,
        date: new Date().toLocaleString()
      });
      fs.writeFileSync(warnsPath, JSON.stringify(warnsData, null, 2));

      // Get current warning count
      const currentWarnCount = warnsData[interaction.guild.id][user.id].length;

      // Check for automatic actions
      const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
      const warnActions = settings[interaction.guild.id]?.warnActions || {};
      const actionToTake = warnActions[currentWarnCount];

      let actionMessage = '';
      let actionExecuted = false;

      if (actionToTake) {
        actionExecuted = true;
        
        switch (actionToTake) {
          case 'kick':
            try {
              await member.kick(`Automatic kick after ${currentWarnCount} warning(s)`);
              actionMessage = `\n\n🚨 **Automatic kick** triggered after ${currentWarnCount} warning(s).`;
            } catch (error) {
              actionMessage = `\n\n❌ Failed to automatically kick user.`;
            }
            break;

          case 'ban':
            try {
              await member.ban({ reason: `Automatic ban after ${currentWarnCount} warning(s)` });
              actionMessage = `\n\n🚨 **Automatic ban** triggered after ${currentWarnCount} warning(s).`;
            } catch (error) {
              actionMessage = `\n\n❌ Failed to automatically ban user.`;
            }
            break;

          case 'mute_10':
          case 'mute_30':
          case 'mute_60':
          case 'mute_1440':
            const muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'mute');
            if (muteRole) {
              const duration = parseInt(actionToTake.split('_')[1]);
              try {
                await member.roles.add(muteRole, `Automatic mute after ${currentWarnCount} warning(s)`);
                actionMessage = `\n\n🔇 **Automatic mute** (${duration} minutes) triggered after ${currentWarnCount} warning(s).`;
                
                // Auto-unmute after duration
                setTimeout(async () => {
                  const freshMember = await interaction.guild.members.fetch(user.id).catch(() => null);
                  if (freshMember && freshMember.roles.cache.has(muteRole.id)) {
                    await freshMember.roles.remove(muteRole, 'End of automatic mute').catch(() => {});
                  }
                }, duration * 60 * 1000);
              } catch (error) {
                actionMessage = `\n\n❌ Failed to automatically mute user.`;
              }
            } else {
              actionMessage = `\n\n❌ No mute role found for automatic mute.`;
            }
            break;

          case 'clear_warns':
            warnsData[interaction.guild.id][user.id] = [];
            fs.writeFileSync(warnsPath, JSON.stringify(warnsData, null, 2));
            actionMessage = `\n\n🧹 **All warnings cleared** after ${currentWarnCount} warning(s).`;
            break;
        }
      }

      // DM the user with embed
      try {
        const embed = new EmbedBuilder()
          .setTitle('⚠️ Warning')
          .setDescription(
            `You have received a warning on **${interaction.guild.name}**.\n\n` +
            `**Reason:** ${reason}\n\n` +
            `**Warning Count:** ${currentWarnCount}${actionMessage}\n\n` +
            `Please respect the server rules. If in doubt, check the <#rules> channel or ask a moderator.`
          )
          .setColor(actionExecuted ? 0xff0000 : 0xffc300)
          .setTimestamp();
        await user.send({ embeds: [embed] });
      } catch {}

      await interaction.reply({ 
        content: `⚠️ ${user.tag} warned. Reason: ${reason}${actionMessage}`, 
        ephemeral: true 
      });

      // Moderation logging
      try {
        const conf = settings[interaction.guild.id]?.logs;
        if (conf?.enabled && conf.categories?.mod && conf.channel) {
          const logChannel = interaction.guild.channels.cache.get(conf.channel);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setTitle(`⚠️ Sanction: Warn`)
              .addFields(
                { name: 'Member', value: `${user.tag}`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Reason', value: reason, inline: false },
                { name: 'Warning Count', value: `${currentWarnCount}`, inline: true }
              )
              .setColor(0xffa500)
              .setTimestamp();

            if (actionExecuted) {
              logEmbed.addFields({ name: 'Automatic Action', value: actionToTake, inline: true });
            }

            await logChannel.send({ embeds: [logEmbed] });
          }
        }
      } catch {}
    } else if (sub === 'mute') {
      // DM the user with embed
      try {
        const embed = new EmbedBuilder()
          .setTitle('🔇 Mute')
          .setDescription(`You have been muted on **${interaction.guild.name}**.\n\n**Reason:** ${reason}` + (duration ? `\n**Duration:** ${duration} minute(s)` : ''))
          .setColor(0x808080)
          .setTimestamp();
        await user.send({ embeds: [embed] });
      } catch {}
      // Use the existing "mute" role
      const muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'mute');
      if (!muteRole) {
        await interaction.reply({ content: 'No "mute" role found.', ephemeral: true });
        return;
      }
      await member.roles.add(muteRole, reason).catch(() => {});
      await interaction.reply({ content: `🔇 ${user.tag} muted. Reason: ${reason}` + (duration ? ` (Duration: ${duration} min)` : ''), ephemeral: true });

      // Moderation logging
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        const conf = settings[interaction.guild.id]?.logs;
        if (conf?.enabled && conf.categories?.mod && conf.channel) {
          const logChannel = interaction.guild.channels.cache.get(conf.channel);
          if (logChannel) {
            logChannel.send({
              embeds: [{
                title: `⚠️ Sanction: Mute`,
                fields: [
                  { name: 'Member', value: `${user.tag}`, inline: true },
                  { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                  { name: 'Reason', value: reason },
                  ...(duration ? [{ name: 'Duration', value: `${duration} min`, inline: true }] : [])
                ],
                color: 0xffa500,
                timestamp: new Date()
              }]
            });
          }
        }
      } catch {}

      // Handle automatic unmute if duration specified
      if (duration && duration > 0) {
        setTimeout(async () => {
          const freshMember = await interaction.guild.members.fetch(user.id).catch(() => null);
          if (freshMember && freshMember.roles.cache.has(muteRole.id)) {
            await freshMember.roles.remove(muteRole, 'End of temporary mute').catch(() => {});
            try {
              await user.send(`🔊 You have been unmuted on **${interaction.guild.name}** after ${duration} minute(s).`);
            } catch {}
          }
        }, duration * 60 * 1000);
      }
    }
  }
};
