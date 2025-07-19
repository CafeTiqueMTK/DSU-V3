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

      // Log de la création du ticket
      const logChannel = getLogChannel(interaction.guild, "tickets");
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle('🟢 Nouveau ticket créé')
          .addFields(
            { name: 'Ticket ID', value: ticketId, inline: true },
            { name: 'Nom', value: ticketName, inline: true },
            { name: 'Utilisateur', value: `${interaction.user.tag} (<@${interaction.user.id}>)`, inline: true },
            { name: 'Canal', value: ticketChannel.toString(), inline: true }
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
          content: `❌ Rôle **${role.name}** retiré.`, 
          ephemeral: true 
        });
        
        // Log role removal
        const logChannel = getLogChannel(interaction.guild, "roles");
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('🔴 Rôle retiré')
            .addFields(
              { name: 'Membre', value: `${member.user.tag} (<@${member.user.id}>)`, inline: true },
              { name: 'Rôle', value: `${role.name} (<@&${role.id}>)`, inline: true },
              { name: 'Méthode', value: 'Bouton réaction', inline: true }
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
          content: `✅ Rôle **${role.name}** ajouté.`, 
          ephemeral: true 
        });
        
        // Log role addition
        const logChannel = getLogChannel(interaction.guild, "roles");
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('🟢 Rôle ajouté')
            .addFields(
              { name: 'Membre', value: `${member.user.tag} (<@${member.user.id}>)`, inline: true },
              { name: 'Rôle', value: `${role.name} (<@&${role.id}>)`, inline: true },
              { name: 'Méthode', value: 'Bouton réaction', inline: true }
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
        content: '❌ Erreur lors de la gestion du rôle. Vérifiez les permissions du bot.', 
        ephemeral: true 
      });
    }
  } else if (interaction.isButton() && interaction.customId === 'create_ticket') {
    // Handle ticket creation button
    const guildId = interaction.guild.id;
    const ticketsPath = path.join(__dirname, 'tickets.json');
    
    // Charger la configuration des tickets
    let ticketsConfig = {};
    if (fs.existsSync(ticketsPath)) {
      ticketsConfig = JSON.parse(fs.readFileSync(ticketsPath, 'utf-8'));
    }
    
    const guildConfig = ticketsConfig[guildId];
    if (!guildConfig || !guildConfig.setup) {
      await interaction.reply({ content: '❌ Système de tickets non configuré.', ephemeral: true });
      return;
    }

    // Vérifier si l'utilisateur a déjà un ticket ouvert
    const existingTicket = Object.values(guildConfig.activeTickets || {}).find(
      ticket => ticket.userId === interaction.user.id
    );
    
    if (existingTicket) {
      const channel = interaction.guild.channels.cache.get(existingTicket.channelId);
      if (channel) {
        await interaction.reply({ 
          content: `❌ Vous avez déjà un ticket ouvert : ${channel}`, 
          ephemeral: true 
        });
        return;
      }
    }

    // Créer le modal pour le nom du ticket
    const modal = new ModalBuilder()
      .setCustomId('ticket_name_modal')
      .setTitle('Nommer votre ticket');

    const ticketNameInput = new TextInputBuilder()
      .setCustomId('ticket_name')
      .setLabel('Nom du ticket')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Ex: Bug Minecraft, Question Discord, Suggestion...')
      .setRequired(true)
      .setMaxLength(32);

    const firstActionRow = new ActionRowBuilder().addComponents(ticketNameInput);
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);
    
    // Créer le canal du ticket
    const category = interaction.guild.channels.cache.get(guildConfig.ticketsCategory);
    if (!category) {
      await interaction.reply({ content: '❌ Catégorie des tickets introuvable.', ephemeral: true });
      return;
    }

    try {
      const ticketChannel = await interaction.guild.channels.create({
        name: ticketId,
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
        .setTitle(`🎫 Ticket ${ticketId}`)
        .setDescription(guildConfig.welcomeMessage)
        .addFields(
          { name: '👤 Utilisateur', value: `${interaction.user.tag} (<@${interaction.user.id}>)`, inline: true },
          { name: '📅 Créé le', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true }
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
        createdAt: Date.now()
      };

      fs.writeFileSync(ticketsPath, JSON.stringify(ticketsConfig, null, 2));

      await interaction.reply({ 
        content: `✅ Votre ticket a été créé : ${ticketChannel}`, 
        ephemeral: true 
      });

      // Log de la création du ticket
      const logChannel = getLogChannel(interaction.guild, "tickets");
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle('🟢 Nouveau ticket créé')
          .addFields(
            { name: 'Ticket ID', value: ticketId, inline: true },
            { name: 'Utilisateur', value: `${interaction.user.tag} (<@${interaction.user.id}>)`, inline: true },
            { name: 'Canal', value: ticketChannel.toString(), inline: true }
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
  } else if (interaction.isButton() && interaction.customId === 'close_ticket') {
    // Handle ticket close button
    const guildId = interaction.guild.id;
    const ticketsPath = path.join(__dirname, 'tickets.json');
    
    let ticketsConfig = {};
    if (fs.existsSync(ticketsPath)) {
      ticketsConfig = JSON.parse(fs.readFileSync(ticketsPath, 'utf-8'));
    }
    
    const guildConfig = ticketsConfig[guildId];
    if (!guildConfig) {
      await interaction.reply({ content: '❌ Configuration des tickets introuvable.', ephemeral: true });
      return;
    }

    // Trouver le ticket correspondant au canal
    const ticketId = Object.keys(guildConfig.activeTickets || {}).find(
      id => guildConfig.activeTickets[id].channelId === interaction.channel.id
    );

    if (!ticketId) {
      await interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });
      return;
    }

    const ticketData = guildConfig.activeTickets[ticketId];
    
    // Créer l'embed de fermeture
    const closeEmbed = new EmbedBuilder()
      .setTitle('🎫 Ticket fermé')
      .setDescription(`Ticket fermé par ${interaction.user.tag}`)
      .setColor(0xff5555)
      .setTimestamp();

    await interaction.channel.send({ embeds: [closeEmbed] });

    // Supprimer le canal après 5 secondes
    setTimeout(async () => {
      try {
        await interaction.channel.delete();
      } catch (error) {
        console.error('Erreur lors de la suppression du canal:', error);
      }
    }, 5000);

    // Supprimer le ticket de la configuration
    delete guildConfig.activeTickets[ticketId];
    fs.writeFileSync(ticketsPath, JSON.stringify(ticketsConfig, null, 2));

    await interaction.reply({ content: '✅ Ticket fermé. Le canal sera supprimé dans 5 secondes.', ephemeral: true });

    // Log de la fermeture du ticket
    const logChannel = getLogChannel(interaction.guild, "tickets");
    if (logChannel) {
      const user = await interaction.client.users.fetch(ticketData.userId).catch(() => null);
      const embed = new EmbedBuilder()
        .setTitle('🔴 Ticket fermé')
        .addFields(
          { name: 'Ticket ID', value: ticketId, inline: true },
          { name: 'Utilisateur', value: user ? user.tag : 'Utilisateur inconnu', inline: true },
          { name: 'Fermé par', value: interaction.user.tag, inline: true },
          { name: 'Canal', value: interaction.channel.name, inline: true }
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

// Log roles - Modifications de rôles (création, suppression, modification)
client.on('guildRoleCreate', async (role) => {
  const logChannel = getLogChannel(role.guild, "roles");
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setTitle('✨ Role Created')
    .addFields(
      { name: 'Role', value: `<@&${role.id}>`, inline: true },
      { name: 'Color', value: `#${role.color.toString(16).padStart(6, '0')}`, inline: true },
      { name: 'Position', value: `${role.position}`, inline: true },
      { name: 'Permissions', value: role.permissions.toArray().length > 0 ? role.permissions.toArray().join(', ') : 'None', inline: false },
      { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
    )
    .setColor(role.color || 0x00ff99)
    .setFooter({ text: 'DSU Role Logger' })
    .setTimestamp(new Date());
  await logChannel.send({ embeds: [embed] });
  console.log(`Role created log sent for ${role.name}`);
});

client.on('guildRoleDelete', async (role) => {
  const logChannel = getLogChannel(role.guild, "roles");
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setTitle('💥 Role Deleted')
    .addFields(
      { name: 'Role Name', value: role.name, inline: true },
      { name: 'Role ID', value: role.id, inline: true },
      { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
    )
    .setColor(0xff5555)
    .setFooter({ text: 'DSU Role Logger' })
    .setTimestamp(new Date());
  await logChannel.send({ embeds: [embed] });
  console.log(`Role deleted log sent for ${role.name}`);
});

client.on('guildRoleUpdate', async (oldRole, newRole) => {
  const logChannel = getLogChannel(newRole.guild, "roles");
  if (!logChannel) return;

  const changes = [];
  
  if (oldRole.name !== newRole.name) {
    changes.push(`**Name**: \`${oldRole.name}\` → \`${newRole.name}\``);
  }
  
  if (oldRole.color !== newRole.color) {
    const oldColor = `#${oldRole.color.toString(16).padStart(6, '0')}`;
    const newColor = `#${newRole.color.toString(16).padStart(6, '0')}`;
    changes.push(`**Color**: \`${oldColor}\` → \`${newColor}\``);
  }
  
  if (oldRole.hoist !== newRole.hoist) {
    changes.push(`**Hoist**: \`${oldRole.hoist}\` → \`${newRole.hoist}\``);
  }
  
  if (oldRole.mentionable !== newRole.mentionable) {
    changes.push(`**Mentionable**: \`${oldRole.mentionable}\` → \`${newRole.mentionable}\``);
  }
  
  if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
    const addedPerms = newRole.permissions.toArray().filter(perm => !oldRole.permissions.has(perm));
    const removedPerms = oldRole.permissions.toArray().filter(perm => !newRole.permissions.has(perm));
    
    if (addedPerms.length > 0) {
      changes.push(`**Added Permissions**: ${addedPerms.join(', ')}`);
    }
    if (removedPerms.length > 0) {
      changes.push(`**Removed Permissions**: ${removedPerms.join(', ')}`);
    }
  }

  if (changes.length > 0) {
    const embed = new EmbedBuilder()
      .setTitle('🔧 Role Updated')
      .addFields(
        { name: 'Role', value: `<@&${newRole.id}>`, inline: true },
        { name: 'Changes', value: changes.join('\n'), inline: false },
        { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
      )
      .setColor(newRole.color || 0xffcc00)
      .setFooter({ text: 'DSU Role Logger' })
      .setTimestamp(new Date());
    await logChannel.send({ embeds: [embed] });
    console.log(`Role updated log sent for ${newRole.name}`);
  }
});

// Gestionnaire d'événements automod Discord
client.on('autoModerationActionExecution', async (autoModerationAction) => {
  try {
    const { guild, ruleId, ruleTriggerType, userId, channelId, messageId, alertSystemMessageId, content, matchedKeyword, matchedContent } = autoModerationAction;
    
    // Récupérer les informations du membre
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    // Récupérer les informations de la règle
    const rule = await guild.autoModerationRules.fetch(ruleId).catch(() => null);
    if (!rule) return;

    // Déterminer le type de violation
    let violationType = 'Unknown';
    let reason = 'Automod violation';
    
    switch (ruleTriggerType) {
      case 1: // KEYWORD
        violationType = 'Forbidden Keyword';
        reason = `Used forbidden keyword: "${matchedKeyword}"`;
        break;
      case 2: // HARMFUL_LINK
        violationType = 'Harmful Link';
        reason = 'Posted a harmful link';
        break;
      case 3: // SPAM
        violationType = 'Spam';
        reason = 'Spam detected';
        break;
      case 4: // KEYWORD_PRESET
        violationType = 'Inappropriate Content';
        reason = 'Inappropriate content detected';
        break;
      case 5: // MENTION_SPAM
        violationType = 'Mention Spam';
        reason = 'Excessive mentions detected';
        break;
    }

    // Envoyer un message d'avertissement au membre
    try {
      const warningEmbed = new EmbedBuilder()
        .setTitle('⚠️ Automod Warning')
        .setDescription(`Your message has been flagged by our automod system.`)
        .addFields(
          { name: 'Violation Type', value: violationType, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Server', value: guild.name, inline: false },
          { name: 'Channel', value: `<#${channelId}>`, inline: false }
        )
        .setColor(0xffa500)
        .setFooter({ text: 'Please respect the server rules to avoid further actions' })
        .setTimestamp(new Date());

      await member.send({ embeds: [warningEmbed] });
      console.log(`Sent automod warning to ${member.user.tag} for ${violationType}`);
    } catch (dmError) {
      console.warn(`Could not send DM to ${member.user.tag}:`, dmError);
    }

    // Logger l'action automod
    const logChannel = getLogChannel(guild, "automod");
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('🚨 Automod Action')
        .addFields(
          { name: 'Member', value: `${member.user.tag} (<@${userId}>)`, inline: true },
          { name: 'Rule', value: rule.name, inline: true },
          { name: 'Violation', value: violationType, inline: true },
          { name: 'Channel', value: `<#${channelId}>`, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Time', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: false }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setColor(0xff0000)
        .setFooter({ text: 'Discord Automod' })
        .setTimestamp(new Date());

      await logChannel.send({ embeds: [logEmbed] });
      console.log(`Logged automod action for ${member.user.tag}`);
    }

  } catch (error) {
    console.error('Error handling automod action:', error);
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

// Gestion des événements de réaction pour les rôles réaction avec émojis
client.on('messageReactionAdd', async (reaction, user) => {
  // Ignorer les réactions du bot
  if (user.bot) return;
  
  // Récupérer l'utilisateur complet si nécessaire
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Erreur lors de la récupération de la réaction:', error);
      return;
    }
  }

  // Récupérer le message complet si nécessaire
  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.error('Erreur lors de la récupération du message:', error);
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
    console.log(`Rôle ${role.name} ajouté à ${user.tag} via réaction`);

    // Log de l'ajout de rôle
    const logChannel = getLogChannel(reaction.message.guild, "roles");
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle('🟢 Rôle ajouté')
        .addFields(
          { name: 'Membre', value: `${user.tag} (<@${user.id}>)`, inline: true },
          { name: 'Rôle', value: `${role.name} (<@&${role.id}>)`, inline: true },
          { name: 'Méthode', value: 'Réaction émoji', inline: true }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor(0x00ff99)
        .setTimestamp(new Date());
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du rôle via réaction:', error);
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  // Ignorer les réactions du bot
  if (user.bot) return;
  
  // Récupérer l'utilisateur complet si nécessaire
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Erreur lors de la récupération de la réaction:', error);
      return;
    }
  }

  // Récupérer le message complet si nécessaire
  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.error('Erreur lors de la récupération du message:', error);
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
    console.log(`Rôle ${role.name} retiré de ${user.tag} via réaction`);

    // Log du retrait de rôle
    const logChannel = getLogChannel(reaction.message.guild, "roles");
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle('🔴 Rôle retiré')
        .addFields(
          { name: 'Membre', value: `${user.tag} (<@${user.id}>)`, inline: true },
          { name: 'Rôle', value: `${role.name} (<@&${role.id}>)`, inline: true },
          { name: 'Méthode', value: 'Réaction émoji', inline: true }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor(0xff5555)
        .setTimestamp(new Date());
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Erreur lors du retrait du rôle via réaction:', error);
  }
});

