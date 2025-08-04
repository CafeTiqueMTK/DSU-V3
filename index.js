// Load environment variables
require('dotenv').config();

const { Client, GatewayIntentBits, Collection, Events, REST, Routes, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { readFileSync, promises: { readFile } } = require('fs');
const fetch = require('node-fetch'); // Assurez-vous d'avoir installé node-fetch v2 ou v3
const { getGuildSettings, updateGuildSettings } = require('./config');

// Déclare la variable automodActionsPath en haut du fichier
const automodActionsPath = path.join(__dirname, 'automod_actions.json');

// Charger les variables d'environnement
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('❌ Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Créer le client
console.log('Creating Discord client...');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Ajouté pour l'automod
    GatewayIntentBits.GuildPresences // Ajouté pour le badge Automod
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
const settingsPath = path.join('/data', 'settings.json');
// Crée le dossier /data s'il n'existe pas
if (!fs.existsSync('/data')) {
  fs.mkdirSync('/data', { recursive: true });
}
// Crée le fichier settings.json vide s'il n'existe pas
if (!fs.existsSync(settingsPath)) {
  fs.writeFileSync(settingsPath, '{}');
}
const settingsRaw = fs.readFileSync(settingsPath, 'utf-8');
const settings = JSON.parse(settingsRaw);

// Déployer les commandes
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function deployCommands() {
  try {
    console.log('Deploying commands to Discord API...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
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
client.login(DISCORD_TOKEN);

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
      
      // Log command execution
      const logChannel = getLogChannel(interaction.guild, "commands");
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle('⚡ Command Executed')
          .addFields(
            { name: 'Command', value: `\`/${interaction.commandName}\``, inline: true },
            { name: 'User', value: `${interaction.user.tag} (<@${interaction.user.id}>)`, inline: true },
            { name: 'Channel', value: `<#${interaction.channel.id}>`, inline: true },
            { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
          )
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setColor(0x00ff99)
          .setFooter({ text: 'DSU Command Logger' })
          .setTimestamp(new Date());
        await logChannel.send({ embeds: [embed] });
      }
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
  } else if (interaction.isModalSubmit() && interaction.customId === 'ticket_embed_modal') {
    // Handle ticket embed configuration modal submission
    const guildId = interaction.guild.id;
    const ticketsPath = path.join(__dirname, 'tickets.json');
    
    let ticketsConfig = {};
    if (fs.existsSync(ticketsPath)) {
      ticketsConfig = JSON.parse(fs.readFileSync(ticketsPath, 'utf-8'));
    }
    
    const guildConfig = ticketsConfig[guildId];
    if (!guildConfig || !guildConfig.setup) {
      await interaction.reply({ content: '❌ Système de tickets non configuré.', ephemeral: true });
      return;
    }

    const title = interaction.fields.getTextInputValue('embed_title');
    const description = interaction.fields.getTextInputValue('embed_description');
    const footer = interaction.fields.getTextInputValue('embed_footer') || '';
    const buttonText = interaction.fields.getTextInputValue('button_text');

    try {
      // Mettre à jour l'embed de création de tickets
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(0x00ff99)
        .setTimestamp();

      if (footer) {
        embed.setFooter({ text: footer });
      }

      // Créer le bouton
      const button = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel(buttonText)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎫')
        );

      // Mettre à jour le message existant
      const setupChannel = interaction.guild.channels.cache.get(guildConfig.setupChannel);
      if (setupChannel && guildConfig.setupMessage) {
        try {
          const message = await setupChannel.messages.fetch(guildConfig.setupMessage);
          await message.edit({
            embeds: [embed],
            components: [button]
          });
        } catch (error) {
          console.error('Erreur lors de la mise à jour du message:', error);
          // Si le message n'existe plus, en créer un nouveau
          const newMessage = await setupChannel.send({
            embeds: [embed],
            components: [button]
          });
          guildConfig.setupMessage = newMessage.id;
        }
      }

      // Sauvegarder la configuration mise à jour
      fs.writeFileSync(ticketsPath, JSON.stringify(ticketsConfig, null, 2));

      await interaction.reply({ 
        content: `✅ L'embed de création de tickets a été mis à jour avec succès !`, 
        ephemeral: true 
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'embed:', error);
      await interaction.reply({ 
        content: '❌ Erreur lors de la mise à jour de l\'embed. Vérifiez les permissions du bot.', 
        ephemeral: true 
      });
    }
  } else if (interaction.isModalSubmit() && interaction.customId === 'ticket_name_modal') {
    // Handle ticket name modal submission
    const guildId = interaction.guild.id;
    const ticketsPath = path.join('/data', 'tickets.json');
    
    let ticketsConfig = {};
    if (fs.existsSync(ticketsPath)) {
      ticketsConfig = JSON.parse(fs.readFileSync(ticketsPath, 'utf-8'));
    }
    
    const guildConfig = ticketsConfig[guildId];
    if (!guildConfig || !guildConfig.setup) {
      await interaction.reply({ content: '❌ Système de tickets non configuré.', ephemeral: true });
      return;
    }

    const ticketName = interaction.fields.getTextInputValue('ticket_name');
    
    // Générer un ID unique pour le ticket
    const ticketId = `${guildConfig.ticketPrefix}-${Date.now()}`;
    
    // Créer le canal du ticket avec le nom personnalisé
    const category = interaction.guild.channels.cache.get(guildConfig.ticketsCategory);
    if (!category) {
      await interaction.reply({ content: '❌ Catégorie des tickets introuvable.', ephemeral: true });
      return;
    }

    try {
      // Nettoyer le nom pour qu'il soit compatible avec Discord
      const cleanName = ticketName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 32);

      const ticketChannel = await interaction.guild.channels.create({
        name: cleanName,
        type: 0, // Text channel
        parent: category,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: ['ViewChannel']
          },
          {
            id: interaction.user.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
          },
          {
            id: guildConfig.supportRole,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages']
          }
        ]
      });

      // Créer l'embed de bienvenue du ticket
      const welcomeEmbed = new EmbedBuilder()
        .setTitle(`🎫 ${ticketName}`)
        .setDescription(guildConfig.welcomeMessage)
        .addFields(
          { name: '👤 Utilisateur', value: `${interaction.user.tag} (<@${interaction.user.id}>)`, inline: true },
          { name: '📅 Créé le', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true },
          { name: '🆔 ID Ticket', value: ticketId, inline: true }
        )
        .setColor(0x00ff99)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      // Créer le bouton de fermeture
      const closeButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Fermer le ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒')
        );

      // Envoyer la mention du rôle support au-dessus de l'embed
      await ticketChannel.send({
        content: `<@&${guildConfig.supportRole}> - Nouveau ticket de ${interaction.user}`
      });

      // Envoyer l'embed de bienvenue avec le bouton de fermeture
      await ticketChannel.send({
        embeds: [welcomeEmbed],
        components: [closeButton]
      });

      // Sauvegarder les informations du ticket
      guildConfig.activeTickets[ticketId] = {
        channelId: ticketChannel.id,
        userId: interaction.user.id,
        ticketName: ticketName,
        createdAt: Date.now()
      };

      fs.writeFileSync(ticketsPath, JSON.stringify(ticketsConfig, null, 2));

      await interaction.reply({ 
        content: `✅ Votre ticket "${ticketName}" a été créé : ${ticketChannel}`, 
        ephemeral: true 
      });

      // Log ticket creation
      const logChannel = getLogChannel(interaction.guild, "tickets");
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle('🟢 New Ticket Created')
          .addFields(
            { name: 'Ticket ID', value: ticketId, inline: true },
            { name: 'Name', value: ticketName, inline: true },
            { name: 'User', value: `${interaction.user.tag} (<@${interaction.user.id}>)`, inline: true },
            { name: 'Channel', value: ticketChannel.toString(), inline: true }
          )
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setColor(0x00ff99)
          .setTimestamp(new Date());
        await logChannel.send({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      await interaction.reply({ 
        content: '❌ Erreur lors de la création du ticket. Vérifiez les permissions du bot.', 
        ephemeral: true 
      });
    }
  } else if (interaction.isButton() && interaction.customId.startsWith('reaction_role_')) {
    // Handle reaction role button clicks
    const roleId = interaction.customId.replace('reaction_role_', '');
    const member = interaction.member;
    const role = interaction.guild.roles.cache.get(roleId);
    
    if (!role) {
      await interaction.reply({ content: '❌ Rôle introuvable.', ephemeral: true });
      return;
    }

    try {
      if (member.roles.cache.has(roleId)) {
        // Remove role if user already has it
        await member.roles.remove(role);
        await interaction.reply({ 
          content: `❌ Role **${role.name}** removed.`, 
          ephemeral: true 
        });
        
        // Log role removal
        const logChannel = getLogChannel(interaction.guild, "roles");
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('🔴 Role Removed')
            .addFields(
              { name: 'Member', value: `${member.user.tag} (<@${member.user.id}>)`, inline: true },
              { name: 'Role', value: `${role.name} (<@&${role.id}>)`, inline: true },
              { name: 'Method', value: 'Button reaction', inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setColor(0xff5555)
            .setTimestamp(new Date());
          await logChannel.send({ embeds: [embed] });
        }
      } else {
        // Add role if user doesn't have it
        await member.roles.add(role);
        await interaction.reply({ 
          content: `✅ Role **${role.name}** added.`, 
          ephemeral: true 
        });
        
        // Log role addition
        const logChannel = getLogChannel(interaction.guild, "roles");
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('🟢 Role Added')
            .addFields(
              { name: 'Member', value: `${member.user.tag} (<@${member.user.id}>)`, inline: true },
              { name: 'Role', value: `${role.name} (<@&${role.id}>)`, inline: true },
              { name: 'Method', value: 'Button reaction', inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setColor(0x00ff99)
            .setTimestamp(new Date());
          await logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Error handling reaction role:', error);
      await interaction.reply({ 
        content: '❌ Error handling role. Check bot permissions.', 
        ephemeral: true 
      });
    }
  } else if (interaction.isButton() && interaction.customId === 'create_ticket') {
    // Handle ticket creation button
    const ticketsPath = path.join('/data', 'tickets.json');
    let ticketsConfig = {};
    if (fs.existsSync(ticketsPath)) {
      ticketsConfig = JSON.parse(fs.readFileSync(ticketsPath, 'utf-8'));
    }
    const guildId = interaction.guild.id;
    if (!ticketsConfig[guildId] || !ticketsConfig[guildId].setup) {
      return await interaction.reply({ content: '❌ Ticket system is not configured.', flags: 64 });
    }

    // Check if the user already has an open ticket
    const userId = interaction.user.id;
    const activeTickets = ticketsConfig[guildId].activeTickets || {};
    const existingTicket = Object.values(activeTickets).find(t => t.userId === userId);
    if (existingTicket) {
      return await interaction.reply({ content: '❌ You already have an open ticket.', flags: 64 });
    }

    // Create the ticket
    const category = interaction.guild.channels.cache.get(ticketsConfig[guildId].ticketsCategory);
    if (!category) {
      return await interaction.reply({ content: '❌ Ticket category not found.', flags: 64 });
    }

    const ticketName = `${ticketsConfig[guildId].ticketPrefix || 'ticket'}-${interaction.user.username}`;
    const channel = await interaction.guild.channels.create({
      name: ticketName,
      type: 0, // 0 = GUILD_TEXT
      parent: category.id,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: ['ViewChannel'],
        },
        {
          id: userId,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
        {
          id: ticketsConfig[guildId].supportRole,
          allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
        },
      ],
    });

    const welcomeMessage = ticketsConfig[guildId].welcomeMessage || "Welcome to your ticket! A support member will assist you soon.";
    // Send embed with close button (no role mention)
    const ticketEmbed = new EmbedBuilder()
      .setTitle('🎫 Support Ticket')
      .setDescription(welcomeMessage)
      .setColor(0x00ff99)
      .setTimestamp();
    const closeButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒')
    );
    await channel.send({ embeds: [ticketEmbed], components: [closeButton] });

    // Add the ticket to config
    const ticketId = channel.id;
    ticketsConfig[guildId].activeTickets[ticketId] = {
      channelId: channel.id,
      userId: userId,
      createdAt: Date.now(),
      ticketName: ticketName,
    };
    fs.writeFileSync(ticketsPath, JSON.stringify(ticketsConfig, null, 2));

    await interaction.reply({ content: `✅ Ticket created: ${channel}`, flags: 64 });
  } else if (interaction.isButton() && interaction.customId === 'close_ticket') {
    // Handle ticket close button
    const guildId = interaction.guild.id;
    const ticketsPath = path.join('/data', 'tickets.json');
    
    let ticketsConfig = {};
    if (fs.existsSync(ticketsPath)) {
      ticketsConfig = JSON.parse(fs.readFileSync(ticketsPath, 'utf-8'));
    }
    
    const guildConfig = ticketsConfig[guildId];
    if (!guildConfig) {
      await interaction.reply({ content: '❌ Ticket configuration not found.', flags: 64 });
      return;
    }

    // Find the ticket for this channel
    const ticketId = Object.keys(guildConfig.activeTickets || {}).find(
      id => guildConfig.activeTickets[id].channelId === interaction.channel.id
    );

    if (!ticketId) {
      await interaction.reply({ content: '❌ Ticket not found.', flags: 64 });
      return;
    }

    const ticketData = guildConfig.activeTickets[ticketId];
    
    // Create close embed
    const closeEmbed = new EmbedBuilder()
      .setTitle('🔒 Ticket Closed')
      .setDescription(`This ticket was closed by ${interaction.user.tag}`)
      .setColor(0xff5555)
      .setTimestamp();

    await interaction.channel.send({ embeds: [closeEmbed] });

    // Delete the channel after 5 seconds
    setTimeout(async () => {
      try {
        await interaction.channel.delete();
      } catch (error) {
        console.error('Error deleting channel:', error);
      }
    }, 5000);

    // Remove the ticket from config
    delete guildConfig.activeTickets[ticketId];
    fs.writeFileSync(ticketsPath, JSON.stringify(ticketsConfig, null, 2));

    await interaction.reply({ content: '✅ Ticket closed. This channel will be deleted in 5 seconds.', flags: 64 });

    // Log ticket closure
    const logChannel = getLogChannel(interaction.guild, "tickets");
    if (logChannel) {
      const user = await interaction.client.users.fetch(ticketData.userId).catch(() => null);
      const embed = new EmbedBuilder()
        .setTitle('🔴 Ticket Closed')
        .addFields(
          { name: 'Ticket ID', value: ticketId, inline: true },
          { name: 'User', value: user ? user.tag : 'Unknown user', inline: true },
          { name: 'Closed by', value: interaction.user.tag, inline: true },
          { name: 'Channel', value: interaction.channel.name, inline: true }
        )
        .setColor(0xff5555)
        .setTimestamp(new Date());
      await logChannel.send({ embeds: [embed] });
    }
  }
});

// Message handler (coins system only)
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  // --- Système de coins par message ---
  const guildId = message.guild.id;
  const userId = message.author.id;
  const guildSettingsStreak = getGuildSettings(guildId);
  if (!guildSettingsStreak.streak) guildSettingsStreak.streak = { enabled: false, users: {} };
  if (!guildSettingsStreak.streak.users) guildSettingsStreak.streak.users = {};
  if (!guildSettingsStreak.streak.users[userId]) guildSettingsStreak.streak.users[userId] = { coins: 0 };
  guildSettingsStreak.streak.users[userId].coins = (guildSettingsStreak.streak.users[userId].coins || 0) + 10;
  updateGuildSettings(guildId, guildSettingsStreak);
  // --- Fin système de coins ---
});

client.on('guildMemberAdd', async (member) => {
  console.log(`New member joined: ${member.user.tag}`);
  const guildId = member.guild.id;
  const settingsPath = path.join('/data', 'settings.json');

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
    settings = JSON.parse(fs.readFileSync('/data/settings.json', 'utf-8'));
  } catch {
    settings = {};
  }
  const guildId = guild.id;
  const conf = settings[guildId]?.logs;
  if (!conf?.enabled || !conf.channel) return null;
  // Vérifier si la catégorie spécifique est activée
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
      .setTitle(`🗑️ Log: Member Left`)
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

// Log roles - Attribution/Retrait de rôles aux membres
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const logChannel = getLogChannel(newMember.guild, "roles");
  if (!logChannel) return;

  const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
  const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

  if (addedRoles.size > 0) {
    const embed = new EmbedBuilder()
      .setTitle('🎭 Role Added')
      .addFields(
        { name: 'Member', value: `${newMember.user.tag} (<@${newMember.id}>)`, inline: true },
        { name: 'Role(s)', value: addedRoles.map(role => `<@&${role.id}>`).join(', '), inline: true },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
      .setColor(0x00ff99)
      .setFooter({ text: 'DSU Role Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
    console.log(`Role added log sent for ${newMember.user.tag}`);
  }

  if (removedRoles.size > 0) {
    const embed = new EmbedBuilder()
      .setTitle('🗑️ Role Removed')
      .addFields(
        { name: 'Member', value: `${newMember.user.tag} (<@${newMember.id}>)`, inline: true },
        { name: 'Role(s)', value: removedRoles.map(role => `<@&${role.id}>`).join(', '), inline: true },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
      .setColor(0xff5555)
      .setFooter({ text: 'DSU Role Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
    console.log(`Role removed log sent for ${newMember.user.tag}`);
  }
});



// Nouveau système Automod - Gestion des messages
client.on('messageCreate', async (message) => {
  if (!message.guild || message.author?.bot) return;

  // Recharge settings à chaque message
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync('/data/settings.json', 'utf-8'));
  } catch {
    settings = {};
  }
  const guildSettings = settings[message.guild.id];
  if (!guildSettings) return;

  const member = message.member;
  
  // Fonction pour envoyer un avertissement DM et notification
  const sendAutomodWarning = async (reason, violationType) => {
    // Cooldown anti-abus : 10 secondes entre deux avertissements pour le même utilisateur
    if (!client.automodCooldown) client.automodCooldown = new Map();
    const cooldownKey = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    const lastWarning = client.automodCooldown.get(cooldownKey) || 0;
    if (now - lastWarning < 10000) {
      console.log(`[AUTOMOD] Cooldown: warning skipped for ${message.author.tag}`);
      return;
    }
    client.automodCooldown.set(cooldownKey, now);

          // Message privé à l'utilisateur
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle('⚠️ Warning - Violation Detected')
          .setDescription(`Hello ${message.author.username},\n\nYour message has been detected as a violation of our rules.\n\n**Violation Type:** ${violationType}\n**Reason:** ${reason}\n\n**Please be careful to:**\n• Respect server rules\n• Avoid spam behavior\n• Do not excessively mention other users\n• Do not share Discord invitation links\n\nThank you for your understanding and respect for the community rules.\n\n*This warning is automatic. In case of recurrence, more severe sanctions may be applied.*`)
          .setColor(0xffa500)
          .setFooter({ text: `${message.guild.name} - Automod System`, iconURL: message.guild.iconURL() })
          .setTimestamp(new Date());

        await message.author.send({ embeds: [dmEmbed] });
        console.log(`Sent automod warning to ${message.author.tag} for ${violationType}`);
      } catch (dmError) {
        console.warn(`Could not send DM to ${message.author.tag}:`, dmError);
      }

    // Notification dans le canal d'action Automod
    try {
      const actionChannelId = guildSettings.automod?.actionChannel;
      if (actionChannelId) {
        const actionChannel = message.guild.channels.cache.get(actionChannelId);
        if (actionChannel) {
          const actionEmbed = new EmbedBuilder()
            .setTitle('🚨 Automod Action')
            .setDescription(`**${message.author.tag}** triggered an Automod protection`)
            .addFields(
              { name: '👤 User', value: `<@${message.author.id}>`, inline: true },
              { name: '🚫 Violation', value: violationType, inline: true },
              { name: '📝 Reason', value: reason, inline: false },
              { name: '📍 Channel', value: `<#${message.channel.id}>`, inline: true },
              { name: '⏰ Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setColor(0xff0000)
            .setFooter({ text: 'DSU Automod System' })
            .setTimestamp(new Date());

          await actionChannel.send({ embeds: [actionEmbed] });
          console.log(`Sent automod notification to action channel for ${message.author.tag}`);
        }
      }
    } catch (e) {
      console.warn('Error sending automod notification to action channel:', e);
    }

    // Log dans le canal de logs
    const logChannel = getLogChannel(message.guild, "automod");
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('🚨 Automod Action')
        .addFields(
          { name: 'Member', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
          { name: 'Violation', value: violationType, inline: true },
          { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setColor(0xff0000)
        .setFooter({ text: 'DSU Automod System' })
        .setTimestamp(new Date());

      await logChannel.send({ embeds: [logEmbed] });
      console.log(`Logged automod action for ${message.author.tag}`);
    }
  };

  // Anti Mass Mention (5+ mentions)
  if (guildSettings.antiMassMention?.enabled) {
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    if (mentionCount >= 5) {
      await message.delete().catch(() => {});
      await sendAutomodWarning('Mentions excessives détectées', 'Mass Mention');
      return;
    }
  }

  // Anti Spam (5 messages en 5 secondes)
  if (guildSettings.antiSpam?.enabled) {
    if (!client.spamMessages) client.spamMessages = new Map();
    const spamKey = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    
    // Initialiser ou récupérer les messages de l'utilisateur
    if (!client.spamMessages.has(spamKey)) {
      client.spamMessages.set(spamKey, []);
    }
    
    const userMessages = client.spamMessages.get(spamKey);
    
    // Ajouter le message actuel
    userMessages.push(now);
    
    // Nettoyer les anciens messages (plus de 5 secondes)
    const fiveSecondsAgo = now - 5000;
    const recentMessages = userMessages.filter(time => time > fiveSecondsAgo);
    client.spamMessages.set(spamKey, recentMessages);
    
    // Vérifier si l'utilisateur a envoyé plus de 5 messages en 5 secondes
    if (recentMessages.length > 5) {
      // Supprimer tous les messages récents de l'utilisateur
      try {
        const messages = await message.channel.messages.fetch({ limit: 50 });
        const userRecentMessages = messages.filter(msg => 
          msg.author.id === message.author.id && 
          (now - msg.createdTimestamp) < 5000
        );
        
        if (userRecentMessages.size > 0) {
          await message.channel.bulkDelete(userRecentMessages);
          console.log(`Deleted ${userRecentMessages.size} spam messages from ${message.author.tag}`);
        }
      } catch (error) {
        console.warn('Could not delete spam messages:', error);
      }
      
      await sendAutomodWarning('Spam detected - multiple messages deleted', 'Spam');
      return;
    }
  }

  // Anti Invites (Discord invite links)
  if (guildSettings.antiInvites?.enabled) {
    const discordLinkRegex = /discord\.gg\/[a-zA-Z0-9]+/;
    if (discordLinkRegex.test(message.content)) {
      await message.delete().catch(() => {});
      await sendAutomodWarning('Discord invitation link detected', 'Discord Invite');
      return;
    }
  }

  // Anti Links (All external links)
  if (guildSettings.antiLinks?.enabled) {
    const linkRegex = /https?:\/\/[^\s]+/;
    if (linkRegex.test(message.content)) {
      await message.delete().catch(() => {});
      await sendAutomodWarning('External link detected', 'External Link');
      return;
    }
  }

  // Anti Keywords (Custom blacklisted words)
  if (guildSettings.antiKeywords?.enabled && guildSettings.antiKeywords.keywords?.length > 0) {
    const content = message.content.toLowerCase();
    const foundKeyword = guildSettings.antiKeywords.keywords.find(keyword => 
      content.includes(keyword.toLowerCase())
    );
    
    if (foundKeyword) {
      await message.delete().catch(() => {});
      await sendAutomodWarning(`Blacklisted keyword detected: "${foundKeyword}"`, 'Blacklisted Keyword');
      return;
    }
  }

  // Funny Responses - Eat Detection
  if (guildSettings.funny?.eat?.enabled) {
    const content = message.content.toLowerCase();
    
    // Détecter "I eat" ou variations en anglais uniquement
    if (content.includes('i eat') || content.includes('i\'m eating') || content.includes('i am eating')) {
      // Cooldown pour éviter le spam (30 secondes par utilisateur)
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:eat`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) { // 30 secondes de cooldown
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      
      // Répondre avec "Bon appétit!" en anglais
      await message.reply('🍽️ **Bon appétit!** Enjoy your meal! 😋');
      console.log(`Funny response sent to ${message.author.tag} for eat detection`);
    }
  }

  // Funny Responses - Sleep Detection
  if (guildSettings.funny?.sleep?.enabled) {
    const content = message.content.toLowerCase();
    
    // Détecter "I'm going to sleep" ou variations en anglais
    if (content.includes('i\'m going to sleep') || content.includes('i am going to sleep') || 
        content.includes('i\'m going to bed') || content.includes('i am going to bed') ||
        content.includes('i\'m trying to sleep') || content.includes('i am trying to sleep') ||
        content.includes('i\'m going to rest') || content.includes('i am going to rest')) {
      // Cooldown pour éviter le spam (30 secondes par utilisateur)
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:sleep`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) { // 30 secondes de cooldown
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      
      // Répondre avec "Bonne nuit!" en anglais
      await message.reply('😴 **Bonne nuit!** Good night! Sweet dreams! 🌙');
      console.log(`Funny response sent to ${message.author.tag} for sleep detection`);
    }
  }

  // Funny Responses - Game Detection
  if (guildSettings.funny?.game?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m playing') || content.includes('i\'m gaming') || content.includes('i am playing') || content.includes('i am gaming')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:game`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('🎮 **Have fun gaming!** Good luck! 🎯');
      console.log(`Funny response sent to ${message.author.tag} for game detection`);
    }
  }

  // Funny Responses - Work Detection
  if (guildSettings.funny?.work?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m working') || content.includes('i\'m at work') || content.includes('i am working') || content.includes('i am at work') || content.includes('i\'m busy working')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:work`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('💼 **Good luck with work!** Stay productive! 📈');
      console.log(`Funny response sent to ${message.author.tag} for work detection`);
    }
  }

  // Funny Responses - Study Detection
  if (guildSettings.funny?.study?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m studying') || content.includes('i\'m learning') || content.includes('i am studying') || content.includes('i am learning') || content.includes('i\'m doing homework')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:study`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('📚 **Good luck studying!** You got this! 🧠');
      console.log(`Funny response sent to ${message.author.tag} for study detection`);
    }
  }

  // Funny Responses - Sport Detection
  if (guildSettings.funny?.sport?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m exercising') || content.includes('i\'m working out') || content.includes('i am exercising') || content.includes('i am working out') || content.includes('i\'m at the gym')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:sport`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('💪 **Keep it up!** Stay strong! 🏋️');
      console.log(`Funny response sent to ${message.author.tag} for sport detection`);
    }
  }

  // Funny Responses - Travel Detection
  if (guildSettings.funny?.travel?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m traveling') || content.includes('i\'m on a trip') || content.includes('i am traveling') || content.includes('i am on a trip') || content.includes('i\'m going somewhere')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:travel`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('✈️ **Safe travels!** Have a great trip! 🌍');
      console.log(`Funny response sent to ${message.author.tag} for travel detection`);
    }
  }

  // Funny Responses - Happy Detection
  if (guildSettings.funny?.happy?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m happy') || content.includes('i\'m glad') || content.includes('i am happy') || content.includes('i am glad') || content.includes('i\'m excited')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:happy`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('😊 **That\'s great!** Keep smiling! ✨');
      console.log(`Funny response sent to ${message.author.tag} for happy detection`);
    }
  }

  // Funny Responses - Tired Detection
  if (guildSettings.funny?.tired?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m tired') || content.includes('i\'m exhausted') || content.includes('i am tired') || content.includes('i am exhausted') || content.includes('i\'m sleepy')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:tired`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('😴 **Take a rest!** You deserve it! 💤');
      console.log(`Funny response sent to ${message.author.tag} for tired detection`);
    }
  }

  // Funny Responses - Stress Detection
  if (guildSettings.funny?.stress?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m stressed') || content.includes('i\'m worried') || content.includes('i am stressed') || content.includes('i am worried') || content.includes('i\'m anxious')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:stress`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('🧘 **Take a deep breath!** You\'ll be okay! 💙');
      console.log(`Funny response sent to ${message.author.tag} for stress detection`);
    }
  }

  // Funny Responses - Pizza Detection
  if (guildSettings.funny?.pizza?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m eating pizza') || content.includes('i am eating pizza') || content.includes('i want pizza') || content.includes('pizza time')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:pizza`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('🍕 **Pizza time!** Enjoy your slice! 🍕');
      console.log(`Funny response sent to ${message.author.tag} for pizza detection`);
    }
  }

  // Funny Responses - Coffee Detection
  if (guildSettings.funny?.coffee?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m drinking coffee') || content.includes('i am drinking coffee') || content.includes('i need coffee') || content.includes('coffee time')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:coffee`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('☕ **Coffee time!** Stay awake! ⚡');
      console.log(`Funny response sent to ${message.author.tag} for coffee detection`);
    }
  }

  // Funny Responses - Music Detection
  if (guildSettings.funny?.music?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m listening to music') || content.includes('i am listening to music') || content.includes('i\'m playing music')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:music`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('🎵 **Great music!** Rock on! 🎸');
      console.log(`Funny response sent to ${message.author.tag} for music detection`);
    }
  }

  // Funny Responses - Concert Detection
  if (guildSettings.funny?.concert?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m at a concert') || content.includes('i am at a concert') || content.includes('i\'m going to a concert')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:concert`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('🎤 **Have fun at the concert!** Rock the night! 🎪');
      console.log(`Funny response sent to ${message.author.tag} for concert detection`);
    }
  }

  // Funny Responses - Movie Detection
  if (guildSettings.funny?.movie?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m watching a movie') || content.includes('i am watching a movie') || content.includes('i\'m going to the cinema')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:movie`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('🎬 **Enjoy the movie!** Don\'t forget the popcorn! 🍿');
      console.log(`Funny response sent to ${message.author.tag} for movie detection`);
    }
  }

  // Funny Responses - Series Detection
  if (guildSettings.funny?.series?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('i\'m watching a series') || content.includes('i am watching a series') || content.includes('i\'m binging a show')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:series`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('📺 **Binge time!** Don\'t forget to sleep! 😴');
      console.log(`Funny response sent to ${message.author.tag} for series detection`);
    }
  }

  // Funny Responses - Birthday Detection
  if (guildSettings.funny?.birthday?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('it\'s my birthday') || content.includes('it is my birthday') || content.includes('happy birthday to me')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:birthday`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('🎉 **Happy Birthday!** Have an amazing day! 🎂');
      console.log(`Funny response sent to ${message.author.tag} for birthday detection`);
    }
  }

  // Funny Responses - Weekend Detection
  if (guildSettings.funny?.weekend?.enabled) {
    const content = message.content.toLowerCase();
    
    if (content.includes('it\'s weekend') || content.includes('it is weekend') || content.includes('weekend time') || content.includes('tgif')) {
      if (!client.funnyCooldown) client.funnyCooldown = new Map();
      const cooldownKey = `${message.guild.id}:${message.author.id}:weekend`;
      const now = Date.now();
      const lastResponse = client.funnyCooldown.get(cooldownKey) || 0;
      
      if (now - lastResponse < 30000) {
        return;
      }
      
      client.funnyCooldown.set(cooldownKey, now);
      await message.reply('🎊 **Weekend vibes!** Have fun! 🎊');
      console.log(`Funny response sent to ${message.author.tag} for weekend detection`);
    }
  }
});

// Fonction pour enregistrer les actions de modération
// Cette fonction est appelée après chaque action de modération (ban, kick, warn, mute)
function logModerationAction(guild, user, action, reason, moderator) {
  // Correction : bien charger settings.json et vérifier la config
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync('/data/settings.json', 'utf-8'));
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
  const settings = JSON.parse(fs.readFileSync('/data/settings.json', 'utf-8'));
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
  const settings = JSON.parse(fs.readFileSync('/data/settings.json', 'utf-8'));
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

// Gestion des événements de réaction pour les rôles réaction avec émojis
client.on('messageReactionAdd', async (reaction, user) => {
  // Ignore bot reactions
  if (user.bot) return;
  
  // Fetch user if needed
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Error fetching reaction:', error);
      return;
    }
  }

  // Fetch message if needed
  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.error('Error fetching message:', error);
      return;
    }
  }

  const guildId = reaction.message.guild?.id;
  if (!guildId) return;

  const reactionRolesEmojiPath = path.join(__dirname, 'reaction_roles_emoji.json');
  
  // Charger la configuration des rôles réaction avec émojis
  let reactionRolesEmoji = {};
  if (fs.existsSync(reactionRolesEmojiPath)) {
    reactionRolesEmoji = JSON.parse(fs.readFileSync(reactionRolesEmojiPath, 'utf-8'));
  }

  const guildConfig = reactionRolesEmoji[guildId];
  if (!guildConfig || !guildConfig[reaction.message.id]) return;

  const config = guildConfig[reaction.message.id];
  const emojiIndex = config.emojis.indexOf(reaction.emoji.name || reaction.emoji.toString());
  
  if (emojiIndex === -1) return;

  const roleId = config.roles[emojiIndex].id;
  const role = reaction.message.guild.roles.cache.get(roleId);
  const member = await reaction.message.guild.members.fetch(user.id);

  if (!role || !member) return;

  try {
    await member.roles.add(role);
    console.log(`Role ${role.name} added to ${user.tag} via reaction`);
  } catch (error) {
    console.error('Error adding role via reaction:', error);
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  // Ignore bot reactions
  if (user.bot) return;
  
  // Fetch user if needed
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Error fetching reaction:', error);
      return;
    }
  }

  // Fetch message if needed
  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.error('Error fetching message:', error);
      return;
    }
  }

  const guildId = reaction.message.guild?.id;
  if (!guildId) return;

  const reactionRolesEmojiPath = path.join(__dirname, 'reaction_roles_emoji.json');
  
  // Charger la configuration des rôles réaction avec émojis
  let reactionRolesEmoji = {};
  if (fs.existsSync(reactionRolesEmojiPath)) {
    reactionRolesEmoji = JSON.parse(fs.readFileSync(reactionRolesEmojiPath, 'utf-8'));
  }

  const guildConfig = reactionRolesEmoji[guildId];
  if (!guildConfig || !guildConfig[reaction.message.id]) return;

  const config = guildConfig[reaction.message.id];
  const emojiIndex = config.emojis.indexOf(reaction.emoji.name || reaction.emoji.toString());
  
  if (emojiIndex === -1) return;

  const roleId = config.roles[emojiIndex].id;
  const role = reaction.message.guild.roles.cache.get(roleId);
  const member = await reaction.message.guild.members.fetch(user.id);

  if (!role || !member) return;

  try {
    await member.roles.remove(role);
    console.log(`Role ${role.name} removed from ${user.tag} via reaction`);
  } catch (error) {
    console.error('Error removing role via reaction:', error);
  }
});

// Soundboard event logging
client.on('guildScheduledEventCreate', async (event) => {
  const logChannel = getLogChannel(event.guild, "soundboard");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('🎵 Soundboard Event Created')
      .addFields(
        { name: 'Event Name', value: event.name, inline: true },
        { name: 'Created by', value: event.creator?.tag || 'Unknown', inline: true },
        { name: 'Start Time', value: event.scheduledStartAt ? `<t:${Math.floor(event.scheduledStartAt.getTime()/1000)}:F>` : 'Not scheduled', inline: true },
        { name: 'Description', value: event.description || 'No description', inline: false }
      )
      .setColor(0x00ff99)
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

client.on('guildScheduledEventUpdate', async (oldEvent, newEvent) => {
  const logChannel = getLogChannel(newEvent.guild, "soundboard");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('🎵 Soundboard Event Updated')
      .addFields(
        { name: 'Event Name', value: newEvent.name, inline: true },
        { name: 'Updated by', value: newEvent.creator?.tag || 'Unknown', inline: true },
        { name: 'Status', value: newEvent.status, inline: true },
        { name: 'Changes', value: getEventChanges(oldEvent, newEvent), inline: false }
      )
      .setColor(0xffa500)
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

client.on('guildScheduledEventDelete', async (event) => {
  const logChannel = getLogChannel(event.guild, "soundboard");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('🎵 Soundboard Event Deleted')
      .addFields(
        { name: 'Event Name', value: event.name, inline: true },
        { name: 'Deleted by', value: event.creator?.tag || 'Unknown', inline: true },
        { name: 'Status', value: event.status, inline: true }
      )
      .setColor(0xff5555)
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

// Helper function to detect changes in soundboard events
function getEventChanges(oldEvent, newEvent) {
  const changes = [];
  
  if (oldEvent.name !== newEvent.name) {
    changes.push(`Name: "${oldEvent.name}" → "${newEvent.name}"`);
  }
  
  if (oldEvent.description !== newEvent.description) {
    changes.push('Description updated');
  }
  
  if (oldEvent.scheduledStartAt?.getTime() !== newEvent.scheduledStartAt?.getTime()) {
    changes.push('Start time updated');
  }
  
  if (oldEvent.scheduledEndAt?.getTime() !== newEvent.scheduledEndAt?.getTime()) {
    changes.push('End time updated');
  }
  
  if (oldEvent.status !== newEvent.status) {
    changes.push(`Status: ${oldEvent.status} → ${newEvent.status}`);
  }
  
  return changes.length > 0 ? changes.join('\n') : 'No specific changes detected';
}

// Channel modification logging
client.on('channelCreate', async (channel) => {
  const logChannel = getLogChannel(channel.guild, "channels");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('📝 Channel Created')
      .addFields(
        { name: 'Channel Name', value: channel.name, inline: true },
        { name: 'Channel Type', value: channel.type.toString(), inline: true },
        { name: 'Channel ID', value: channel.id, inline: true },
        { name: 'Category', value: channel.parent?.name || 'No category', inline: true },
        { name: 'Position', value: channel.position.toString(), inline: true },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setColor(0x00ff99)
      .setFooter({ text: 'DSU Channel Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

client.on('channelDelete', async (channel) => {
  const logChannel = getLogChannel(channel.guild, "channels");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('🗑️ Channel Deleted')
      .addFields(
        { name: 'Channel Name', value: channel.name, inline: true },
        { name: 'Channel Type', value: channel.type.toString(), inline: true },
        { name: 'Channel ID', value: channel.id, inline: true },
        { name: 'Category', value: channel.parent?.name || 'No category', inline: true },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setColor(0xff5555)
      .setFooter({ text: 'DSU Channel Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
  const logChannel = getLogChannel(newChannel.guild, "channels");
  if (!logChannel) return;

  const changes = [];
  
  // Check for name changes
  if (oldChannel.name !== newChannel.name) {
    changes.push(`Name: "${oldChannel.name}" → "${newChannel.name}"`);
  }
  
  // Check for topic changes (text channels only)
  if (oldChannel.topic !== newChannel.topic) {
    changes.push('Topic updated');
  }
  
  // Check for position changes
  if (oldChannel.position !== newChannel.position) {
    changes.push(`Position: ${oldChannel.position} → ${newChannel.position}`);
  }
  
  // Check for parent/category changes
  if (oldChannel.parent?.id !== newChannel.parent?.id) {
    const oldParent = oldChannel.parent?.name || 'No category';
    const newParent = newChannel.parent?.name || 'No category';
    changes.push(`Category: "${oldParent}" → "${newParent}"`);
  }
  
  // Check for permission overwrite changes
  if (oldChannel.permissionOverwrites.cache.size !== newChannel.permissionOverwrites.cache.size) {
    changes.push('Permission overwrites updated');
  }
  
  // Check for slowmode changes (text channels only)
  if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
    changes.push(`Slowmode: ${oldChannel.rateLimitPerUser}s → ${newChannel.rateLimitPerUser}s`);
  }
  
  // Check for nsfw changes (text channels only)
  if (oldChannel.nsfw !== newChannel.nsfw) {
    changes.push(`NSFW: ${oldChannel.nsfw} → ${newChannel.nsfw}`);
  }

  if (changes.length > 0) {
    const embed = new EmbedBuilder()
      .setTitle('🔧 Channel Updated')
      .addFields(
        { name: 'Channel', value: `${newChannel.name} (<#${newChannel.id}>)`, inline: true },
        { name: 'Channel Type', value: newChannel.type.toString(), inline: true },
        { name: 'Changes', value: changes.join('\n'), inline: false },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setColor(0xffa500)
      .setFooter({ text: 'DSU Channel Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

// Message logging
client.on('messageDelete', async (message) => {
  // Ignore bot messages and DMs
  if (message.author?.bot || !message.guild) return;
  
  const logChannel = getLogChannel(message.guild, "messages");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('🗑️ Message Deleted')
      .addFields(
        { name: 'Author', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
        { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
        { name: 'Message ID', value: message.id, inline: true },
        { name: 'Content', value: message.content || 'No content (embed/attachment)', inline: false },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setColor(0xff5555)
      .setFooter({ text: 'DSU Message Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
  // Ignore bot messages and DMs
  if (oldMessage.author?.bot || !oldMessage.guild) return;
  
  // Ignore if content is the same
  if (oldMessage.content === newMessage.content) return;
  
  const logChannel = getLogChannel(oldMessage.guild, "messages");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('✏️ Message Edited')
      .addFields(
        { name: 'Author', value: `${oldMessage.author.tag} (<@${oldMessage.author.id}>)`, inline: true },
        { name: 'Channel', value: `<#${oldMessage.channel.id}>`, inline: true },
        { name: 'Message ID', value: oldMessage.id, inline: true },
        { name: 'Old Content', value: oldMessage.content || 'No content', inline: false },
        { name: 'New Content', value: newMessage.content || 'No content', inline: false },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setThumbnail(oldMessage.author.displayAvatarURL({ dynamic: true }))
      .setColor(0xffa500)
      .setFooter({ text: 'DSU Message Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

// Bulk delete logging
client.on('messageDeleteBulk', async (messages) => {
  const firstMessage = messages.first();
  if (!firstMessage || !firstMessage.guild) return;
  
  const logChannel = getLogChannel(firstMessage.guild, "bulkdelete");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('🗑️ Bulk Messages Deleted')
      .addFields(
        { name: 'Channel', value: `<#${firstMessage.channel.id}>`, inline: true },
        { name: 'Messages Count', value: messages.size.toString(), inline: true },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setColor(0xff5555)
      .setFooter({ text: 'DSU Bulk Delete Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

// Economy logging - Streaks and Level ups
client.on('messageCreate', async (message) => {
  // Ignore bot messages and DMs
  if (message.author?.bot || !message.guild) return;
  
  const logChannel = getLogChannel(message.guild, "economy");
  if (!logChannel) return;

  // Check for streak commands
  if (message.content.startsWith('/streak') || message.content.startsWith('/mystreak')) {
    const embed = new EmbedBuilder()
      .setTitle('🔥 Streak Checked')
      .addFields(
        { name: 'User', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
        { name: 'Command', value: message.content.split(' ')[0], inline: true },
        { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setColor(0xff6b35)
      .setFooter({ text: 'DSU Economy Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }

  // Check for level commands
  if (message.content.startsWith('/rank') || message.content.startsWith('/level')) {
    const embed = new EmbedBuilder()
      .setTitle('⭐ Level Checked')
      .addFields(
        { name: 'User', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
        { name: 'Command', value: message.content.split(' ')[0], inline: true },
        { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setColor(0xffd700)
      .setFooter({ text: 'DSU Economy Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

// Level up detection (you can customize this based on your leveling system)
client.on('messageCreate', async (message) => {
  // Ignore bot messages and DMs
  if (message.author?.bot || !message.guild) return;
  
  const logChannel = getLogChannel(message.guild, "economy");
  if (!logChannel) return;

  // This is a placeholder - you'll need to integrate with your actual leveling system
  // Example: Check if user leveled up in your leveling system
  try {
    const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
    const guildId = message.guild.id;
    const userId = message.author.id;
    
    if (settings[guildId]?.level?.users?.[userId]) {
      const userData = settings[guildId].level.users[userId];
      const oldLevel = userData.level;
      
      // Simulate level up detection (replace with your actual logic)
      // This is just an example - you should integrate with your real leveling system
      if (userData.xp >= oldLevel * 100 && userData.xp < (oldLevel + 1) * 100) {
        const embed = new EmbedBuilder()
          .setTitle('🎉 Level Up!')
          .addFields(
            { name: 'User', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
            { name: 'New Level', value: `${oldLevel + 1}`, inline: true },
            { name: 'XP', value: `${userData.xp}`, inline: true },
            { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
            { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
          )
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .setColor(0x00ff99)
          .setFooter({ text: 'DSU Economy Logger' })
          .setTimestamp(new Date());
        await logChannel.send({ embeds: [embed] });
      }
    }
  } catch (error) {
    // Silently handle errors
  }
});

// Streak milestone detection (you can customize this based on your streak system)
client.on('messageCreate', async (message) => {
  // Ignore bot messages and DMs
  if (message.author?.bot || !message.guild) return;
  
  const logChannel = getLogChannel(message.guild, "economy");
  if (!logChannel) return;

  // This is a placeholder - you'll need to integrate with your actual streak system
  // Example: Check for streak milestones
  try {
    // You can add your streak checking logic here
    // For now, this is just a placeholder
    if (message.content.includes('streak') && (message.content.includes('7') || message.content.includes('30') || message.content.includes('100'))) {
      const embed = new EmbedBuilder()
        .setTitle('🔥 Streak Milestone!')
        .addFields(
          { name: 'User', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
          { name: 'Milestone', value: 'Streak achievement mentioned', inline: true },
          { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
          { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setColor(0xff6b35)
        .setFooter({ text: 'DSU Economy Logger' })
        .setTimestamp(new Date());
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    // Silently handle errors
  }
});

// Invite logging
client.on('inviteCreate', async (invite) => {
  const logChannel = getLogChannel(invite.guild, "invites");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('📨 Invite Created')
      .addFields(
        { name: 'Created by', value: `${invite.inviter?.tag || 'Unknown'} (<@${invite.inviter?.id || 'Unknown'}>)`, inline: true },
        { name: 'Channel', value: `<#${invite.channel.id}>`, inline: true },
        { name: 'Code', value: invite.code, inline: true },
        { name: 'Max Uses', value: invite.maxUses ? invite.maxUses.toString() : 'Unlimited', inline: true },
        { name: 'Expires At', value: invite.expiresAt ? `<t:${Math.floor(invite.expiresAt.getTime()/1000)}:F>` : 'Never', inline: true },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setThumbnail(invite.inviter?.displayAvatarURL({ dynamic: true }) || null)
      .setColor(0x00ff99)
      .setFooter({ text: 'DSU Invite Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

client.on('inviteDelete', async (invite) => {
  const logChannel = getLogChannel(invite.guild, "invites");
  if (logChannel) {
    const embed = new EmbedBuilder()
      .setTitle('🗑️ Invite Deleted')
      .addFields(
        { name: 'Channel', value: `<#${invite.channel.id}>`, inline: true },
        { name: 'Code', value: invite.code, inline: true },
        { name: 'Uses', value: `${invite.uses}/${invite.maxUses || '∞'}`, inline: true },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setColor(0xff5555)
      .setFooter({ text: 'DSU Invite Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

client.on('guildMemberAdd', async (member) => {
  // Log member join with invite info
  const logChannel = getLogChannel(member.guild, "invites");
  if (logChannel) {
    // Try to get invite info (this is a simplified version)
    const embed = new EmbedBuilder()
      .setTitle('👋 Member Joined via Invite')
      .addFields(
        { name: 'Member', value: `${member.user.tag} (<@${member.id}>)`, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:F>`, inline: true },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setColor(0x00ff99)
      .setFooter({ text: 'DSU Invite Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
  }
});

// Anti raid protection
client.on('guildMemberAdd', async (member) => {
  try {
    const { getGuildData, saveGuildData } = require('./utils/guildManager');
    const settings = getGuildData(member.guild.id, 'settings');
    
    // Check if anti-raid protection is enabled
    if (settings[member.guild.id]?.antiRaid?.enabled) {
      const antiRaid = settings[member.guild.id].antiRaid;
      const now = Date.now();
      
      // Initialize recentJoins if it doesn't exist
      if (!antiRaid.recentJoins) {
        antiRaid.recentJoins = [];
      }
      
      // Add current join to the list
      antiRaid.recentJoins.push({
        userId: member.id,
        userTag: member.user.tag,
        timestamp: now
      });
      
      // Remove joins older than 10 seconds
      antiRaid.recentJoins = antiRaid.recentJoins.filter(join => now - join.timestamp < 10000);
      
      // Check if raid threshold is exceeded
      if (antiRaid.recentJoins.length >= antiRaid.threshold) {
        console.log(`🚨 RAID DETECTED in ${member.guild.name}! ${antiRaid.recentJoins.length} joins in 10 seconds`);
        
        // Save the updated settings
        saveGuildData(member.guild.id, settings, 'settings');
        
        // Trigger raid response
        await handleRaidResponse(member.guild, antiRaid.recentJoins);
        
        // Clear the recent joins after handling
        antiRaid.recentJoins = [];
        saveGuildData(member.guild.id, settings, 'settings');
      } else {
        // Save the updated settings
        saveGuildData(member.guild.id, settings, 'settings');
      }
    }
  } catch (error) {
    console.error('Error in anti-raid protection:', error);
  }
});

// Function to handle raid response
async function handleRaidResponse(guild, recentJoins) {
  try {
    // Log the raid detection
    const logChannel = getLogChannel(guild, "automod");
    if (logChannel) {
      const raidEmbed = new EmbedBuilder()
        .setTitle('🚨 RAID DETECTED!')
        .setDescription(`A raid has been detected in the server!`)
        .addFields(
          { name: 'Joins Detected', value: `${recentJoins.length} users in 10 seconds`, inline: true },
          { name: 'Server', value: guild.name, inline: true },
          { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true },
          { name: 'Recent Joins', value: recentJoins.map(join => `• ${join.userTag} (<@${join.userId}>)`).join('\n'), inline: false }
        )
        .setColor(0xff0000)
        .setFooter({ text: 'DSU Anti-Raid Protection' })
        .setTimestamp(new Date());
      await logChannel.send({ embeds: [raidEmbed] });
    }

    // Kick all recent joins (except bots if anti-bot is disabled)
    const kickedUsers = [];
    const failedKicks = [];
    
    for (const join of recentJoins) {
      try {
        const member = await guild.members.fetch(join.userId);
        
        // Don't kick if it's a bot and anti-bot is disabled
        const settings = getGuildData(guild.id, 'settings');
        if (member.user.bot && !settings[guild.id]?.antiBot?.enabled) {
          console.log(`Skipping bot ${join.userTag} in raid response`);
          continue;
        }
        
        await member.kick('Anti-raid protection: Raid detected');
        kickedUsers.push(join.userTag);
        console.log(`Kicked ${join.userTag} due to raid`);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (kickError) {
        console.error(`Failed to kick ${join.userTag}:`, kickError);
        failedKicks.push(join.userTag);
      }
    }

    // Log the results
    if (logChannel) {
      const resultsEmbed = new EmbedBuilder()
        .setTitle('🛡️ Raid Response Results')
        .addFields(
          { name: 'Users Kicked', value: kickedUsers.length.toString(), inline: true },
          { name: 'Failed Kicks', value: failedKicks.length.toString(), inline: true },
          { name: 'Total Detected', value: recentJoins.length.toString(), inline: true }
        )
        .setColor(0x00ff00)
        .setTimestamp(new Date());
      
      if (kickedUsers.length > 0) {
        resultsEmbed.addFields({
          name: 'Successfully Kicked',
          value: kickedUsers.join(', '),
          inline: false
        });
      }
      
      if (failedKicks.length > 0) {
        resultsEmbed.addFields({
          name: 'Failed to Kick',
          value: failedKicks.join(', '),
          inline: false
        });
      }
      
      await logChannel.send({ embeds: [resultsEmbed] });
    }

    // Optional: Enable server lockdown (disable invites temporarily)
    try {
      const invites = await guild.invites.fetch();
      for (const [code, invite] of invites) {
        try {
          await invite.delete('Anti-raid protection: Server lockdown');
        } catch (deleteError) {
          console.error(`Failed to delete invite ${code}:`, deleteError);
        }
      }
      
      if (logChannel) {
        const lockdownEmbed = new EmbedBuilder()
          .setTitle('🔒 Server Lockdown Activated')
          .setDescription('All invites have been deleted to prevent further raids.')
          .setColor(0xffa500)
          .setTimestamp(new Date());
        await logChannel.send({ embeds: [lockdownEmbed] });
      }
    } catch (lockdownError) {
      console.error('Failed to enable server lockdown:', lockdownError);
    }

  } catch (error) {
    console.error('Error handling raid response:', error);
  }
}

// Anti bot protection
client.on('guildMemberAdd', async (member) => {
  // Ignore if not a bot
  if (!member.user.bot) return;

  try {
    const { getGuildData } = require('./utils/guildManager');
    const settings = getGuildData(member.guild.id, 'settings');
    
    // Check if anti-bot protection is enabled
    if (!settings[member.guild.id]?.antiBot?.enabled) return;

    // Check if the bot is authorized (has proper permissions or is verified)
    const botMember = member;
    const botUser = member.user;
    
    // Allow verified bots and bots with proper permissions
    if (botUser.verified || botUser.flags?.has('VerifiedBot')) {
      console.log(`Verified bot ${botUser.tag} joined ${member.guild.name} - allowed`);
      return;
    }

    // Check if bot has proper OAuth2 scopes (simplified check)
    // In a real implementation, you might want to check the bot's invite URL or permissions
    const hasProperPermissions = botMember.permissions.has('SendMessages') && 
                                botMember.permissions.has('ViewChannel') &&
                                botMember.permissions.has('UseSlashCommands');

    if (hasProperPermissions) {
      console.log(`Bot ${botUser.tag} has proper permissions in ${member.guild.name} - allowed`);
      return;
    }

    // Kick the unauthorized bot
    try {
      await member.kick('Anti-bot protection: Unauthorized bot detected');
      console.log(`Kicked unauthorized bot ${botUser.tag} from ${member.guild.name}`);

      // Send warning to bot owner (if possible)
      try {
        const warningEmbed = new EmbedBuilder()
          .setTitle('🤖 Bot Blocked')
          .setDescription('Your bot was blocked from joining this server due to anti-bot protection.')
          .addFields(
            { name: 'Server', value: member.guild.name, inline: true },
            { name: 'Bot', value: botUser.tag, inline: true },
            { name: 'Reason', value: 'Unauthorized bot detected', inline: false },
            { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
          )
          .setColor(0xff0000)
          .setTimestamp();

        // Note: We can't DM the bot owner directly, but we can log this
        console.log(`Bot ${botUser.tag} was blocked from ${member.guild.name}`);
      } catch (dmError) {
        console.log(`Could not send warning for bot ${botUser.tag}: ${dmError.message}`);
      }

      // Log the action
      const logChannel = getLogChannel(member.guild, "automod");
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('🤖 Unauthorized Bot Blocked')
          .addFields(
            { name: 'Bot', value: `${botUser.tag} (<@${botUser.id}>)`, inline: true },
            { name: 'Bot ID', value: botUser.id, inline: true },
            { name: 'Action', value: 'Bot kicked', inline: true },
            { name: 'Reason', value: 'Unauthorized bot detected', inline: true },
            { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
          )
          .setThumbnail(botUser.displayAvatarURL({ dynamic: true }))
          .setColor(0xff0000)
          .setFooter({ text: 'DSU Anti-Bot Protection' })
          .setTimestamp(new Date());
        await logChannel.send({ embeds: [logEmbed] });
      }

    } catch (kickError) {
      console.error(`Failed to kick bot ${botUser.tag}:`, kickError);
      
      // Log the failed kick attempt
      const logChannel = getLogChannel(member.guild, "automod");
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('⚠️ Failed to Kick Bot')
          .addFields(
            { name: 'Bot', value: `${botUser.tag} (<@${botUser.id}>)`, inline: true },
            { name: 'Error', value: kickError.message, inline: true },
            { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
          )
          .setThumbnail(botUser.displayAvatarURL({ dynamic: true }))
          .setColor(0xffa500)
          .setFooter({ text: 'DSU Anti-Bot Protection' })
          .setTimestamp(new Date());
        await logChannel.send({ embeds: [logEmbed] });
      }
    }

  } catch (error) {
    console.error('Error in anti-bot protection:', error);
  }
});

// Anti role mention protection
client.on('messageCreate', async (message) => {
  // Ignore bot messages and DMs
  if (message.author?.bot || !message.guild) return;

  try {
    const { getGuildData } = require('./utils/guildManager');
    const settings = getGuildData(message.guild.id, 'settings');
    
    // Check if anti-role protection is enabled
    if (!settings[message.guild.id]?.antiRoles?.enabled) return;
    
    // Check if automod blocked roles are configured
    const blockedRoles = settings[message.guild.id]?.automod?.blockedRoles || [];
    if (blockedRoles.length === 0) return;

    // Check if message contains any blocked role mentions
    const mentionedRoles = message.mentions.roles;
    const blockedMentions = mentionedRoles.filter(role => blockedRoles.includes(role.id));

    if (blockedMentions.size > 0) {
      // Delete the message
      await message.delete().catch(console.error);

      // Send warning to user
      const warningEmbed = new EmbedBuilder()
        .setTitle('⚠️ Role Mention Blocked')
        .setDescription('You are not allowed to mention certain roles in this server.')
        .addFields(
          { name: 'Blocked Roles', value: blockedMentions.map(role => `${role}`).join(', '), inline: false },
          { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
          { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true }
        )
        .setColor(0xff0000)
        .setTimestamp();

      try {
        await message.author.send({ embeds: [warningEmbed] });
      } catch (dmError) {
        // If DM fails, log it
        console.log(`Could not send DM to ${message.author.tag}: ${dmError.message}`);
      }

      // Log the action
      const logChannel = getLogChannel(message.guild, "automod");
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('🚫 Role Mention Blocked')
          .addFields(
            { name: 'User', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
            { name: 'Blocked Roles', value: blockedMentions.map(role => `${role}`).join(', '), inline: true },
            { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
            { name: 'Action', value: 'Message deleted + DM warning', inline: true },
            { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
          )
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .setColor(0xff0000)
          .setFooter({ text: 'DSU Anti-Role Protection' })
          .setTimestamp(new Date());
        await logChannel.send({ embeds: [logEmbed] });
      }

      console.log(`Blocked role mention from ${message.author.tag} in ${message.guild.name}`);
    }
  } catch (error) {
    console.error('Error in anti-role mention protection:', error);
  }
});

// Initialize and start the update checker
const UpdateChecker = require('./update-checker.js');
const updateChecker = new UpdateChecker(client);

// Start the update checker when the bot is ready
client.once('ready', () => {
  console.log(`✅ Bot connected as ${client.user.tag}`);
  updateChecker.start();
});



// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  updateChecker.stop();
  client.destroy();
  process.exit(0);
});

