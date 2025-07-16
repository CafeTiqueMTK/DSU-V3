const { Client, GatewayIntentBits, Collection, Events, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { readFileSync, promises: { readFile } } = require('fs');
const fetch = require('node-fetch'); // Assurez-vous d'avoir installé node-fetch v2 ou v3
const { getGuildSettings, updateGuildSettings } = require('./config');

// Déclare la variable automodActionsPath en haut du fichier
const automodActionsPath = path.join(__dirname, 'automod_actions.json');

// Charger config.json
console.log('Loading config.json...');
const configRaw = fs.readFileSync('./config.json', 'utf-8');
const config = JSON.parse(configRaw);

// Créer le client
console.log('Creating Discord client...');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent // <-- Ajoute cet intent pour lire le contenu des messages
  ]
});

client.commands = new Collection();

// Fonction utilitaire pour charger les commandes
function loadCommands(client, commandsPath) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  const commandsArray = [];
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    let command;
    try {
      command = require(filePath);
    } catch (err) {
      console.warn(`[WARN] Failed to load command file ${file}: ${err.message}`);
      continue;
    }
    // Debug log to help identify problematic command files
    if (!command || !command.data || !command.data.name) {
      console.warn(`[DEBUG] Invalid command export in file: ${file}, export:`, command);
      console.warn(`[WARN] Command file ${file} is missing 'data' or 'name'. Skipped.`);
      continue;
    }
    client.commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON());
    console.log(`Loaded command: ${command.data.name}`);
  }
  return commandsArray;
}

// Charger les commandes
console.log('Loading commands...');
const commandsPath = path.join(__dirname, 'commands');
const commandsArray = loadCommands(client, commandsPath);

// Charger settings.json
console.log('Loading settings.json...');
const settingsPath = path.join(__dirname, 'settings.json');
const settingsRaw = fs.readFileSync(settingsPath, 'utf-8');
const settings = JSON.parse(settingsRaw);

// Déployer les commandes
const rest = new REST({ version: '10' }).setToken(config.token);

async function deployCommands() {
  try {
    console.log('Deploying commands to Discord API...');
    await rest.put(Routes.applicationCommands(config.clientId), {
      body: commandsArray,
    });
    console.log('Commands deployed successfully.');
    // Ajout d'un log pour indiquer que la connexion va commencer après le déploiement
    console.log('If you do not see the bot online, check your bot token and permissions.');
  } catch (error) {
    console.error('Error while deploying commands:', error);
  }
}
deployCommands();

// Ajoutez ceci juste avant ou après deployCommands() pour lancer la connexion du bot :
client.login(config.token);

// Interaction handler
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    console.log(`Received interaction: ${interaction.commandName}`);
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.log('Command not found.');
      return;
    }
    try {
      await command.execute(interaction);
      console.log(`Executed command: ${interaction.commandName}`);
    } catch (error) {
      console.error('Error during command execution:', error);
      await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
    }
  } else if (interaction.isModalSubmit() && interaction.customId.startsWith('embedModal:')) {
    // Handle embed modal submission
    const channelId = interaction.customId.split(':')[1];
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      await interaction.reply({ content: '❌ Channel not found.', ephemeral: true });
      return;
    }
    const title = interaction.fields.getTextInputValue('embedTitle');
    const description = interaction.fields.getTextInputValue('embedContent');
    const footer = interaction.fields.getTextInputValue('embedFooter');
    const embed = {
      title,
      description,
      color: 0x00AEFF,
      footer: { text: footer || '' },
      timestamp: new Date()
    };
    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `📢 Embed sent in ${channel}.`, ephemeral: true });
  }
});

// Message handler (automod)
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  // --- Ajout : système de coins par message ---
  const guildId = message.guild.id;
  const userId = message.author.id;
  const guildSettingsStreak = getGuildSettings(guildId);
  if (!guildSettingsStreak.streak) guildSettingsStreak.streak = { enabled: false, users: {} };
  if (!guildSettingsStreak.streak.users) guildSettingsStreak.streak.users = {};
  if (!guildSettingsStreak.streak.users[userId]) guildSettingsStreak.streak.users[userId] = { coins: 0 };
  guildSettingsStreak.streak.users[userId].coins = (guildSettingsStreak.streak.users[userId].coins || 0) + 10;
  updateGuildSettings(guildId, guildSettingsStreak);
  // --- Fin ajout ---

  // Ignore all messages from the bot itself (so automod never triggers on bot messages)
  if (message.author.id === client.user.id) return;

  // DEBUG : Vérifie si le bot lit bien les messages et affiche tout le contenu
  console.log(`[DEBUG] Message received: Server=${message.guild.name} | Channel=#${message.channel.name} | Author=${message.author.tag} | Content="${message.content}"`);

  // Recharge settings à chaque message pour éviter le cache
  let freshSettings;
  try {
    freshSettings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
  } catch {
    freshSettings = {};
  }
  const guildSettings = freshSettings[message.guild.id]?.automod;

  if (!guildSettings?.enabled) return;

  // --- Ignorer les rôles configurés ---
  const ignoredRoles = guildSettings.ignoredRoles || [];
  if (
    ignoredRoles.length > 0 &&
    message.member &&
    message.member.roles.cache.some(r => ignoredRoles.includes(r.id))
  ) {
    return;
  }
  // --- Ignorer les salons configurés ---
  const ignoredChannels = guildSettings.ignoredChannels || [];
  if (ignoredChannels.length > 0 && ignoredChannels.includes(message.channel.id)) {
    return;
  }
  // --- Fin ajout ---

  const member = message.member;

  const applySanction = async (sanction, reason) => {
    // --- Cooldown anti-abus : 5 secondes entre deux sanctions automod pour le même utilisateur ---
    if (!client.automodCooldown) client.automodCooldown = new Map();
    const cooldownKey = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    const lastSanction = client.automodCooldown.get(cooldownKey) || 0;
    if (now - lastSanction < 5000) {
      console.log(`[AUTOMOD] Cooldown: sanction skipped for ${message.author.tag}`);
      return;
    }
    client.automodCooldown.set(cooldownKey, now);

    try {
      await message.author.send({
        embeds: [{
          title: 'Automod Sanction',
          description: `You have been sanctioned for: **${reason}**\nPlease respect the server rules.`,
          color: 0xff0000
        }]
      });
      console.log(`Sent sanction DM to ${message.author.tag}`);
    } catch (e) {
      console.warn(`Could not send DM to ${message.author.tag}`);
    }

    // --- Send notification in automod.actionChannel ---
    try {
      const actionChannelId = guildSettings.actionChannel;
      if (actionChannelId) {
        const notifChannel = message.guild.channels.cache.get(actionChannelId);
        if (notifChannel) {
          const embed = new EmbedBuilder()
            .setTitle('🚨 Automod Action')
            .addFields(
              { name: 'User', value: `<@${message.author.id}> (${message.author.tag || 'unknown'})`, inline: true },
              { name: 'Sanction', value: String(sanction || 'None'), inline: true },
              { name: 'Reason', value: String(reason || 'Not specified'), inline: false },
              { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
            )
            .setColor(0xff0000)
            .setTimestamp(new Date());
          await notifChannel.send({ embeds: [embed] });
        }
      }
    } catch (e) {
      console.warn('Error while sending automod notification:', e);
    }
    // --- End notification ---

    switch (sanction) {
      case 'warn':
        await message.channel.send(`⚠️ <@${message.author.id}> has been warned for **${reason}**.`);
        console.log(`Warned ${message.author.tag} for: ${reason}`);
        if (client.logModerationAction) {
          client.logModerationAction(message.guild, message.author, 'warn', reason, message.client.user);
        }
        break;
      case 'kick':
        await member.kick(reason);
        console.log(`Kicked ${message.author.tag} for: ${reason}`);
        break;
      case 'ban':
        await member.ban({ reason });
        console.log(`Banned ${message.author.tag} for: ${reason}`);
        break;
      case 'mute':
        const muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'mute');
        if (muteRole) {
          await member.roles.add(muteRole, reason);
          console.log(`Muted ${message.author.tag} for: ${reason}`);
        } else {
          await message.channel.send('🔇 Mute role not found.');
          console.log('Mute role not found.');
        }
        break;
    }

    // Enregistrement de l'action automod
    try {
      let actions = {};
      if (fs.existsSync(automodActionsPath)) {
        try {
          const raw = fs.readFileSync(automodActionsPath, 'utf-8');
          actions = raw.trim() ? JSON.parse(raw) : {};
        } catch (e) {
          console.warn('automod_actions.json corrompu ou vide, réinitialisation.');
          actions = {};
        }
      }
      if (!actions[message.guild.id]) actions[message.guild.id] = {};
      if (!actions[message.guild.id][message.author.id]) actions[message.guild.id][message.author.id] = [];
      actions[message.guild.id][message.author.id].push({
        date: new Date().toISOString(),
        sanction,
        reason
      });
      fs.writeFileSync(automodActionsPath, JSON.stringify(actions, null, 2));
    } catch (e) {
      console.warn('Erreur lors de l\'enregistrement de l\'action automod :', e);
    }
  };

  // 🔗 Discord link (détection améliorée + debug)
  if (
    guildSettings.categories?.discordLink?.enabled &&
    /(https?:\/\/)?(www\.)?(discord(app)?\.com\/invite|discord\.gg)\/[a-zA-Z0-9-]+/i.test(message.content)
  ) {
    console.log('[DEBUG] Discord link detected, trying to delete...');
    await message.delete().then(() => {
      console.log('[DEBUG] Message deleted successfully.');
    }).catch(e => {
      console.warn('[DEBUG] Failed to delete message:', e);
    });
    await applySanction(guildSettings.categories.discordLink.sanction, 'discord link$');
    return;
  }

  // 👻 Ghost ping
  // Correction : ne considère ghost ping que si le message est supprimé juste après l'envoi (messageDelete), pas à la création
  // Donc on retire ce bloc du messageCreate :
  // if (guildSettings.categories?.ghostPing?.enabled && message.mentions.users.size > 0 && message.type === 0 && message.content.trim() === '') {
  //   console.log('Detected ghost ping.');
  //   await applySanction(guildSettings.categories.ghostPing.sanction, 'Ghost ping');
  // }

  // 📣 Mention spam
  if (guildSettings.categories?.mentionSpam?.enabled && message.mentions.users.size >= 5) {
    await message.delete().catch(e => console.warn('Failed to delete mention spam message:', e));
    console.log('Deleted message for mention spam.');
    await applySanction(guildSettings.categories.mentionSpam.sanction, 'Mention spam');
  }

  // 💬 Soft spam
  if (guildSettings.categories?.spam?.enabled) {
    const now = Date.now();
    if (!client.spamMap) client.spamMap = new Map();

    const userData = client.spamMap.get(message.author.id) || { count: 0, last: now };
    const timeDiff = now - userData.last;

    if (timeDiff < 15000) {
      userData.count += 1;
    } else {
      userData.count = 1;
    }
    userData.last = now;
    client.spamMap.set(message.author.id, userData);

    if (userData.count > 10) {
      console.log(`Detected spam from ${message.author.tag}`);
      await applySanction(guildSettings.categories.spam.sanction, 'Message spam');
      client.spamMap.set(message.author.id, { count: 0, last: now });
    }
  }

  // 💬 Soft spam (anti-spam: 5 messages in 5 seconds, delete last 5)
  if (guildSettings.categories?.spam?.enabled) {
    if (!client.antiSpamMap) client.antiSpamMap = new Map();
    const key = `${message.guild.id}:${message.channel.id}:${message.author.id}`;
    const now = Date.now();
    let arr = client.antiSpamMap.get(key) || [];
    arr = arr.filter(ts => now - ts < 5000); // keep only last 5 seconds
    arr.push(now);
    client.antiSpamMap.set(key, arr);
    if (arr.length >= 5) {
      // Fetch last 20 messages in the channel
      const messages = await message.channel.messages.fetch({ limit: 20 });
      // Filter last 5 messages from this user
      const userMsgs = messages.filter(m => m.author.id === message.author.id).first(5);
      for (const m of userMsgs) {
        await m.delete().catch(() => {});
      }
      await applySanction(guildSettings.categories.spam.sanction, 'Spam: 5 messages in 5 seconds');
      client.antiSpamMap.set(key, []); // reset
    }
  }

  // ❌ Bad words
  if (guildSettings.categories?.badWords?.enabled) {
    const badWordsPath = './bannedWords.json';
    if (fs.existsSync(badWordsPath)) {
      const words = JSON.parse(fs.readFileSync(badWordsPath, 'utf-8'));
      const lower = message.content.toLowerCase();
      // Découper le message en mots (enlève la ponctuation, accents non gérés)
      const messageWords = lower.split(/\b/).map(w => w.trim()).filter(Boolean);
      let found = null;
      for (const badWord of words) {
        // Vérifie si le mot interdit est présent comme mot entier (en ignorant la casse)
        const regex = new RegExp(`\\b${badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(lower)) {
          found = badWord;
          break;
        }
      }
      if (found) {
        await message.delete().catch(e => console.warn('Failed to delete bad word message:', e));
        console.log(`Deleted message for bad word: ${found}`);
        // Récupère la durée si la sanction est mute
        let muteDuration = 10;
        if (guildSettings.categories.badWords.sanction === 'mute') {
          muteDuration = guildSettings.categories.badWords.duree || 10;
        }
        await applySanction(
          guildSettings.categories.badWords.sanction,
          `Forbidden word: ${found}`,
          muteDuration
        );

        // Ajout automatique du warn dans warns.json
        if (guildSettings.categories.badWords.sanction === 'warn') {
          const warnsPath = path.join(__dirname, 'warns.json');
          let warnsData = {};
          if (fs.existsSync(warnsPath)) {
            warnsData = JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
          }
          if (!warnsData[guildId]) warnsData[guildId] = {};
          if (!warnsData[guildId][message.author.id]) warnsData[guildId][message.author.id] = [];
          warnsData[guildId][message.author.id].push({
            moderator: 'Automod',
            reason: `Forbidden word: ${found}`,
            date: new Date().toLocaleString()
          });
          fs.writeFileSync(warnsPath, JSON.stringify(warnsData, null, 2));
          console.log(`Warn added to warns.json for ${message.author.tag}`);
        }
      }
    }
  }

  // --- Système de niveaux ---
  try {
    let settings;
    try {
      settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
    } catch {
      settings = {};
    }
    const guildId = message.guild.id;
    const levelConf = settings[guildId]?.level;
    if (levelConf && levelConf.enabled) {
      if (!levelConf.users) levelConf.users = {};
      let userData = levelConf.users[message.author.id];
      if (!userData) userData = levelConf.users[message.author.id] = { xp: 0, level: 1 };

      // Calcul du multiplicateur de rôle booster
      let multiplier = 1;
      if (levelConf.boosters && message.member) {
        for (const [roleId, mult] of Object.entries(levelConf.boosters)) {
          if (message.member.roles.cache.has(roleId)) {
            multiplier = Math.max(multiplier, mult);
          }
        }
      }

      // XP de base par message
      const baseXp = 10;
      const xpGain = baseXp * multiplier;
      userData.xp += xpGain;

      // Fonction pour calculer l'xp nécessaire pour le prochain niveau (progression exponentielle)
      function xpForLevel(level) {
        return 100 * Math.pow(1.25, level - 1);
      }

      // Passage de niveau
      let leveledUp = false;
      while (userData.xp >= xpForLevel(userData.level)) {
        userData.xp -= xpForLevel(userData.level);
        userData.level += 1;
        leveledUp = true;
      }

      if (leveledUp && levelConf.channel) {
        const channel = message.guild.channels.cache.get(levelConf.channel);
        if (channel) {
          channel.send({
            embeds: [{
              title: '🎉 Level up! ',
              description: `<@${message.author.id}> just reached level **${userData.level}**!`,
              color: 0x00ff99,
              footer: { text: 'DSU level system' },
              timestamp: new Date()
            }]
          });
        }
      }

      // Sauvegarde
      settings[guildId].level = levelConf;
      fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 2));
    }
  } catch (err) {
    console.warn('Level system error:', err);
  }
});

client.on('guildMemberAdd', async (member) => {
  console.log(`New member joined: ${member.user.tag}`);
  const guildId = member.guild.id;
  const settingsPath = path.join(__dirname, 'settings.json');

  if (!fs.existsSync(settingsPath)) return;
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  const autorole = settings[guildId]?.autorole;

  if (autorole?.enabled && autorole.roleId) {
    const role = member.guild.roles.cache.get(autorole.roleId);
    if (role) {
      try {
        await member.roles.add(role);
        console.log(`Role ${role.name} assigned to ${member.user.tag}`);
      } catch (err) {
        console.error(`Failed to assign role to ${member.user.tag}`, err);
      }
    }
  }
});

// Vérification utilitaire pour les logs
function getLogChannel(guild, type = "mod") {
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
  } catch {
    settings = {};
  }
  const guildId = guild.id;
  const conf = settings[guildId]?.logs;
  if (!conf?.enabled || !conf.channel) return null;
  if (type && conf.categories && !conf.categories[type]) return null;
  const channel = guild.channels.cache.get(conf.channel);
  if (!channel) return null;
  // Vérifie les permissions du bot
  const me = guild.members.me;
  if (!me) return null;
  const perms = channel.permissionsFor(me);
  if (!perms?.has('ViewChannel') || !perms?.has('SendMessages')) return null;
  return channel;
}

// Fonction pour enregistrer les actions de modération
function logModerationAction(guild, user, action, reason, moderator) {
  const logChannel = getLogChannel(guild, "mod");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Sanction: ${action}`)
      .addFields(
        { name: 'Member', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Moderator', value: `${moderator?.tag || 'Automod'}`, inline: true },
        { name: 'Reason', value: reason || 'Not specified', inline: false }
      )
      .setColor(0xffa500)
      .setTimestamp(new Date());
    logChannel.send({ embeds: [embed] })
      .then(() => {
        console.log(`Logged moderation action: ${action} for ${user.tag}`);
      })
      .catch(e => {
        console.warn('Failed to send moderation log:', e);
      });
  } else {
    console.warn('Moderation log channel not found or misconfigured.');
  }
}
client.logModerationAction = logModerationAction;

// Log arrivée membre
client.on('guildMemberAdd', async member => {
  const logChannel = getLogChannel(member.guild, "arrived");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle(`📝 Log: New Member Joined`)
      .setDescription(`A new user has joined the server:\n• Tag: **${member.user.tag}**\n• ID: ${member.id}\n• Account created: <t:${Math.floor(member.user.createdTimestamp/1000)}:F>`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setColor(0x0099ff)
      .setFooter({ text: `Joined ${member.guild.name}` })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
    console.log(`Sent arrival log for ${member.user.tag}`);
  }
});

// Log départ membre
client.on('guildMemberRemove', async member => {
  const logChannel = getLogChannel(member.guild, "farewell");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle(`� Log: Member Left`)
      .setDescription(`A user has left the server:\n• Tag: **${member.user.tag}**\n• ID: ${member.id}\n• Account created: <t:${Math.floor(member.user.createdTimestamp/1000)}:F>`)
      .setImage(member.user.displayAvatarURL({ dynamic: true }))
      .setColor(0xff5555)
      .setFooter({ text: `Left ${member.guild.name}` })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
    console.log(`Sent farewell log for ${member.user.tag}`);
  }
});

// Log vocal
client.on('voiceStateUpdate', (oldState, newState) => {
  const logChannel = getLogChannel(newState.guild, "vocal");
  if (!logChannel) {
    console.log('Vocal log skipped: not enabled or misconfigured.');
    return;
  }
  // ...permissions check already done in getLogChannel...
  if (!oldState.channel && newState.channel) {
    logChannel.send({
      embeds: [{
        title: '🔊 Voice Channel Join',
        description: `${newState.member.user.tag} joined **${newState.channel.name}**`,
        color: 0x00bfff,
        timestamp: new Date()
      }]
    }).then(() => {
      console.log('Voice join log sent.');
    }).catch(e => console.error('Failed to send join log:', e));
  } else if (oldState.channel && !newState.channel) {
    logChannel.send({
      embeds: [{
        title: '🔇 Voice Channel Leave',
        description: `${oldState.member.user.tag} left **${oldState.channel.name}**`,
        color: 0xff5555,
        timestamp: new Date()
      }]
    }).then(() => {
      console.log('Voice leave log sent.');
    }).catch(e => console.error('Failed to send leave log:', e));
  } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
    logChannel.send({
      embeds: [{
        title: '🔄 Voice Channel Switch',
        description: `${newState.member.user.tag} switched from **${oldState.channel.name}** to **${newState.channel.name}**`,
        color: 0xffcc00,
        timestamp: new Date()
      }]
    }).then(() => {
      console.log('Voice switch log sent.');
    }).catch(e => console.error('Failed to send switch log:', e));
  }
});

// Fonction pour enregistrer les actions de modération
// Cette fonction est appelée après chaque action de modération (ban, kick, warn, mute)
function logModerationAction(guild, user, action, reason, moderator) {
  // Correction : bien charger settings.json et vérifier la config
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
  } catch {
    settings = {};
  }
  const guildId = guild.id;
  const conf = settings[guildId]?.logs;

  if (conf?.enabled && conf.categories?.mod && conf.channel) {
    const logChannel = guild.channels.cache.get(conf.channel);
    if (logChannel) {
      // Correction : utiliser EmbedBuilder de discord.js v14+
      const embed = new EmbedBuilder()
        .setTitle(`⚠️ Sanction: ${action}`)
        .addFields(
          { name: 'Member', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Moderator', value: `${moderator?.tag || 'Automod'}`, inline: true },
          { name: 'Reason', value: reason || 'Not specified', inline: false }
        )
        .setColor(0xffa500)
        .setTimestamp(new Date());
      logChannel.send({ embeds: [embed] })
        .then(() => {
          console.log(`Logged moderation action: ${action} for ${user.tag}`);
        })
        .catch(e => {
          console.warn('Failed to send moderation log:', e);
        });
    } else {
      console.warn('Log channel not found or bot has no access.');
    }
  } else {
    console.warn('Logging is disabled or misconfigured for this guild.');
  }
}

// Rendez la fonction accessible aux commandes
client.logModerationAction = logModerationAction;

// Gestion des événements de bienvenue
client.on('guildMemberAdd', async member => {
  const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
  const conf = settings[member.guild.id]?.welcome;

  if (conf?.enabled && conf.channel) {
    const channel = member.guild.channels.cache.get(conf.channel);
    if (channel) {
      const { EmbedBuilder } = require('discord.js');
      const embed = new EmbedBuilder()
        .setTitle(`👋 Welcome ${member.user.username}!`)
        .setDescription(`We are happy to welcome you to **${member.guild.name}**! 🎉`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setColor(0x00ff99)
        .setFooter({ text: `User ID: ${member.id}` })
        .setTimestamp(new Date());
      await channel.send({ embeds: [embed] });
      console.log(`Sent custom welcome embed for ${member.user.tag}`);
    }
  }
});

// Gestion des événements de départ
client.on('guildMemberRemove', async member => {
  const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
  const conf = settings[member.guild.id]?.farewell;

  if (conf?.enabled && conf.channel) {
    const channel = member.guild.channels.cache.get(conf.channel);
    if (channel) {
      const { EmbedBuilder } = require('discord.js');
      const embed = new EmbedBuilder()
        .setTitle(`😢 ${member.user.username} left the server`)
        .setDescription(`We hope to see you again on **${member.guild.name}**...`)
        .setImage(member.user.displayAvatarURL({ dynamic: true }))
        .setColor(0xff5555)
        .setFooter({ text: `User ID: ${member.id}` })
        .setTimestamp(new Date());
      await channel.send({ embeds: [embed] });
      console.log(`Sent custom farewell embed for ${member.user.tag}`);
    }
  }
});

console.log('All startup steps completed. Bot is now connecting to Discord...');

// Prêt
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot is ready and logged in as ${client.user.tag}`);
  console.log('Bot is fully operational and listening for events.');
});

// Ajoutez ce bloc pour gérer le ghost ping dans l'event messageDelete :
client.on('messageDelete', async (message) => {
  if (!message.guild || message.author?.bot) return;

  // Recharge settings à chaque suppression
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
  } catch {
    settings = {};
  }
  const guildSettings = settings[message.guild.id]?.automod;
  if (!guildSettings?.enabled) return;

  // Ghost ping : message supprimé qui mentionnait quelqu'un
  if (
    guildSettings.categories?.ghostPing?.enabled &&
    message.mentions?.users?.size > 0
  ) {
    // Optionnel : ignorer les suppressions par modérateurs (si possible)
    // if (message.deletable && !message.deleted) return;

    // Appliquer la sanction
    const member = message.member || (await message.guild.members.fetch(message.author.id).catch(() => null));
    const applySanction = async (sanction, reason) => {
      // --- Cooldown anti-abus : 5 secondes entre deux sanctions automod pour le même utilisateur ---
      if (!client.automodCooldown) client.automodCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}`;
      const now = Date.now();
      const lastSanction = client.automodCooldown.get(cooldownKey) || 0;
      if (now - lastSanction < 5000) {
        console.log(`[AUTOMOD] Cooldown: sanction skipped for ${message.author.tag}`);
        return;
      }
      client.automodCooldown.set(cooldownKey, now);

      try {
        await message.author.send({
          embeds: [{
            title: 'Sanction Automod',
            description: `Tu as été sanctionné pour : **${reason}**\nMerci de respecter les règles du serveur.`,
            color: 0xff0000
          }]
        });
      } catch {}
      // --- Ajout notification automod.actionChannel ---
      try {
        const actionChannelId = guildSettings.actionChannel;
        if (actionChannelId) {
          const notifChannel = message.guild.channels.cache.get(actionChannelId);
          if (notifChannel) {
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
              .setTitle('🚨 Automod Action')
              .addFields(
                { name: 'User', value: `<@${message.author.id}> (${message.author.tag || 'unknown'})`, inline: true },
                { name: 'Sanction', value: String(sanction || 'None'), inline: true },
                { name: 'Reason', value: String(reason || 'Not specified'), inline: false },
                { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
              )
              .setColor(0xff0000)
              .setTimestamp(new Date());
            await notifChannel.send({ embeds: [embed] });
          }
        }
      } catch (e) {
        console.warn('Erreur lors de l\'envoi de la notification automod :', e);
      }
      // --- Fin ajout ---
      switch (sanction) {
        case 'warn':
          await message.channel?.send(`⚠️ <@${message.author.id}> has been warned for **${reason}**.`);
          if (client.logModerationAction) {
            client.logModerationAction(message.guild, message.author, 'warn', reason, client.user);
          }
          break;
        case 'kick':
          await member?.kick(reason);
          break;
        case 'ban':
          await member?.ban({ reason });
          break;
        case 'mute':
          const muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'mute');
          if (muteRole && member) await member.roles.add(muteRole, reason);
          break;
      }
    };

    await applySanction(guildSettings.categories.ghostPing.sanction, 'Ghost ping');
  }
});

