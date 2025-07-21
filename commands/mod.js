const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Définir le dossier de données persistant (Railway volume ou fallback local)
const DATA_DIR = process.env.RAILWAY_VOLUME_PATH || '/data';
const settingsPath = path.join('/app/data', 'settings.json');
const warnsPath = path.join('/app/data', 'warns.json');

module.exports = {
  data: new SlashCommandBuilder()
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
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    // --- Permission check for Administrators and Moderators ---
    let hasPermission = false;
    
    // Check if user is Administrator
    if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      hasPermission = true;
    }
    
    // Check for custom moderator role
    if (!hasPermission) {
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        const guildId = interaction.guild.id;
        const moderatorRoleId = settings[guildId]?.moderatorRole;
        if (moderatorRoleId && interaction.member.roles.cache.has(moderatorRoleId)) {
          hasPermission = true;
        }
      } catch {}
    }
    
    // Check for native moderation permissions (KickMembers or BanMembers)
    if (!hasPermission && (interaction.member.permissions.has(PermissionFlagsBits.KickMembers) || interaction.member.permissions.has(PermissionFlagsBits.BanMembers))) {
      hasPermission = true;
    }
    
    if (!hasPermission) {
      const permissionEmbed = new EmbedBuilder()
        .setTitle('❌ Permission Denied')
        .setDescription('Only administrators and moderators can use this command.')
        .setColor(0xff0000)
        .setTimestamp();
      await interaction.reply({ embeds: [permissionEmbed], flags: 64 });
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
      const userNotFoundEmbed = new EmbedBuilder()
        .setTitle('❌ User Not Found')
        .setDescription('The specified user was not found on this server.')
        .setColor(0xff0000)
        .setTimestamp();
      await interaction.reply({ embeds: [userNotFoundEmbed], flags: 64 });
      return;
    }

    if (sub === 'ban') {
      // Check if user has ban permission or is admin
      if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const banPermissionEmbed = new EmbedBuilder()
          .setTitle('❌ Permission Denied')
          .setDescription('You do not have permission to ban users.')
          .setColor(0xff0000)
          .setTimestamp();
        await interaction.reply({ embeds: [banPermissionEmbed], flags: 64 });
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
      const banSuccessEmbed = new EmbedBuilder()
        .setTitle('🔨 User Banned')
        .setDescription(`**${user.tag}** has been banned from the server.`)
        .addFields(
          { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
          { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setColor(0x8B0000)
        .setTimestamp();
      await interaction.reply({ embeds: [banSuccessEmbed], flags: 64 });

      // Moderation logging
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
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
      const kickSuccessEmbed = new EmbedBuilder()
        .setTitle('👢 User Kicked')
        .setDescription(`**${user.tag}** has been kicked from the server.`)
        .addFields(
          { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
          { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setColor(0xffa500)
        .setTimestamp();
      await interaction.reply({ embeds: [kickSuccessEmbed], flags: 64 });

      // Moderation logging
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
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
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
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

      const warnSuccessEmbed = new EmbedBuilder()
        .setTitle('⚠️ User Warned')
        .setDescription(`**${user.tag}** has been warned.${actionMessage}`)
        .addFields(
          { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
          { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: '📝 Reason', value: reason, inline: false },
          { name: '📊 Warning Count', value: `${currentWarnCount}`, inline: true }
        )
        .setColor(actionExecuted ? 0xff0000 : 0xffc300)
        .setTimestamp();
      await interaction.reply({ embeds: [warnSuccessEmbed], flags: 64 });

      // Moderation logging
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
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
        const noMuteRoleEmbed = new EmbedBuilder()
          .setTitle('❌ Mute Role Not Found')
          .setDescription('No "mute" role was found on this server. Please create a role named "mute" to use this command.')
          .setColor(0xff0000)
          .setTimestamp();
        await interaction.reply({ embeds: [noMuteRoleEmbed], flags: 64 });
        return;
      }
      await member.roles.add(muteRole, reason).catch(() => {});
      const muteSuccessEmbed = new EmbedBuilder()
        .setTitle('🔇 User Muted')
        .setDescription(`**${user.tag}** has been muted.`)
        .addFields(
          { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
          { name: '🛡️ Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setColor(0x808080)
        .setTimestamp();
      
      if (duration && duration > 0) {
        muteSuccessEmbed.addFields({ name: '⏰ Duration', value: `${duration} minute(s)`, inline: true });
      }
      
      await interaction.reply({ embeds: [muteSuccessEmbed], flags: 64 });

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
