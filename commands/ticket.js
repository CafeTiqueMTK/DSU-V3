const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Gérer le système de tickets')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Configurer le système de tickets')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Canal où afficher le message de création de tickets')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('support_role')
            .setDescription('Rôle du support qui sera mentionné dans les tickets')
            .setRequired(true))
        .addChannelOption(option =>
          option.setName('tickets_category')
            .setDescription('Catégorie où créer les tickets')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Titre du message de création de tickets')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Description du message de création de tickets')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('button_text')
            .setDescription('Texte du bouton de création')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('config')
        .setDescription('Modifier la configuration des tickets')
        .addStringOption(option =>
          option.setName('setting')
            .setDescription('Paramètre à modifier')
            .setRequired(true)
            .addChoices(
              { name: 'Support Role', value: 'support_role' },
              { name: 'Tickets Category', value: 'tickets_category' },
              { name: 'Welcome Message', value: 'welcome_message' },
              { name: 'Ticket Prefix', value: 'ticket_prefix' }
            ))
        .addStringOption(option =>
          option.setName('value')
            .setDescription('Nouvelle valeur')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Lister tous les tickets ouverts'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Fermer un ticket')
        .addStringOption(option =>
          option.setName('ticket_id')
            .setDescription('ID du ticket à fermer')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Raison de la fermeture')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('transcript')
        .setDescription('Générer une transcription d\'un ticket')
        .addStringOption(option =>
          option.setName('ticket_id')
            .setDescription('ID du ticket')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('embed')
        .setDescription('Configurer l\'embed de création de tickets'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const ticketsPath = path.join(__dirname, '..', 'tickets.json');

    // Charger ou créer le fichier de configuration
    let ticketsConfig = {};
    if (fs.existsSync(ticketsPath)) {
      ticketsConfig = JSON.parse(fs.readFileSync(ticketsPath, 'utf-8'));
    }
    if (!ticketsConfig[guildId]) {
      ticketsConfig[guildId] = {
        setup: false,
        supportRole: null,
        ticketsCategory: null,
        welcomeMessage: "Bienvenue dans votre ticket ! Un membre du support vous répondra bientôt.",
        ticketPrefix: "ticket",
        activeTickets: {}
      };
    }

    if (subcommand === 'setup') {
      const channel = interaction.options.getChannel('channel');
      const supportRole = interaction.options.getRole('support_role');
      const ticketsCategory = interaction.options.getChannel('tickets_category');
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const buttonText = interaction.options.getString('button_text') || 'Créer un ticket';

      // Vérifier que la catégorie est bien une catégorie
      if (ticketsCategory.type !== 4) {
        return await interaction.reply({ 
          content: '❌ Le canal spécifié pour les tickets doit être une catégorie.', 
          ephemeral: true 
        });
      }

      // Créer l'embed de création de tickets
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(0x00ff99)
        .setFooter({ text: 'Système de tickets' })
        .setTimestamp();

      // Créer le bouton
      const button = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel(buttonText)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎫')
        );

      // Envoyer le message
      const message = await channel.send({
        embeds: [embed],
        components: [button]
      });

      // Sauvegarder la configuration
      ticketsConfig[guildId] = {
        setup: true,
        setupChannel: channel.id,
        setupMessage: message.id,
        supportRole: supportRole.id,
        ticketsCategory: ticketsCategory.id,
        welcomeMessage: ticketsConfig[guildId].welcomeMessage,
        ticketPrefix: ticketsConfig[guildId].ticketPrefix,
        activeTickets: ticketsConfig[guildId].activeTickets || {}
      };

      fs.writeFileSync(ticketsPath, JSON.stringify(ticketsConfig, null, 2));

      await interaction.reply({ 
        content: `✅ Système de tickets configuré dans ${channel} avec le rôle ${supportRole.name}.`, 
        ephemeral: true 
      });

    } else if (subcommand === 'config') {
      const setting = interaction.options.getString('setting');
      const value = interaction.options.getString('value');

      switch (setting) {
        case 'support_role':
          const role = interaction.guild.roles.cache.get(value);
          if (!role) {
            return await interaction.reply({ content: '❌ Rôle introuvable.', ephemeral: true });
          }
          ticketsConfig[guildId].supportRole = value;
          break;
        case 'tickets_category':
          const category = interaction.guild.channels.cache.get(value);
          if (!category || category.type !== 4) {
            return await interaction.reply({ content: '❌ Catégorie introuvable.', ephemeral: true });
          }
          ticketsConfig[guildId].ticketsCategory = value;
          break;
        case 'welcome_message':
          ticketsConfig[guildId].welcomeMessage = value;
          break;
        case 'ticket_prefix':
          ticketsConfig[guildId].ticketPrefix = value;
          break;
      }

      fs.writeFileSync(ticketsPath, JSON.stringify(ticketsConfig, null, 2));
      await interaction.reply({ 
        content: `✅ Configuration mise à jour : ${setting} = ${value}`, 
        ephemeral: true 
      });

    } else if (subcommand === 'list') {
      const activeTickets = ticketsConfig[guildId].activeTickets;
      
      if (Object.keys(activeTickets).length === 0) {
        return await interaction.reply({ content: '❌ Aucun ticket ouvert.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('📋 Tickets Ouverts')
        .setColor(0x00ff99)
        .setTimestamp();

      for (const [ticketId, ticketData] of Object.entries(activeTickets)) {
        const channel = interaction.guild.channels.cache.get(ticketData.channelId);
        const user = await interaction.client.users.fetch(ticketData.userId).catch(() => null);
        const ticketName = ticketData.ticketName || 'Sans nom';
        
        embed.addFields({
          name: `🎫 ${ticketName}`,
          value: `**ID:** ${ticketId}\n**Canal:** ${channel ? channel.toString() : 'Canal supprimé'}\n**Utilisateur:** ${user ? user.tag : 'Utilisateur inconnu'}\n**Ouvert le:** <t:${Math.floor(ticketData.createdAt/1000)}:F>`,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } else if (subcommand === 'close') {
      const ticketId = interaction.options.getString('ticket_id');
      const reason = interaction.options.getString('reason') || 'Aucune raison spécifiée';

      const ticketData = ticketsConfig[guildId].activeTickets[ticketId];
      if (!ticketData) {
        return await interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });
      }

      const channel = interaction.guild.channels.cache.get(ticketData.channelId);
      if (channel) {
        try {
          await channel.delete();
        } catch (error) {
          console.error('Erreur lors de la suppression du canal:', error);
        }
      }

      // Supprimer le ticket de la configuration
      delete ticketsConfig[guildId].activeTickets[ticketId];
      fs.writeFileSync(ticketsPath, JSON.stringify(ticketsConfig, null, 2));

      await interaction.reply({ 
        content: `✅ Ticket ${ticketId} fermé. Raison: ${reason}`, 
        ephemeral: true 
      });

    } else if (subcommand === 'transcript') {
      const ticketId = interaction.options.getString('ticket_id');

      const ticketData = ticketsConfig[guildId].activeTickets[ticketId];
      if (!ticketData) {
        return await interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });
      }

      const channel = interaction.guild.channels.cache.get(ticketData.channelId);
      if (!channel) {
        return await interaction.reply({ content: '❌ Canal du ticket introuvable.', ephemeral: true });
      }

      try {
        // Récupérer les messages du ticket
        const messages = await channel.messages.fetch({ limit: 100 });
        let transcript = `=== TRANSCRIPTION DU TICKET ${ticketId} ===\n`;
        transcript += `Canal: ${channel.name}\n`;
        transcript += `Utilisateur: ${ticketData.userId}\n`;
        transcript += `Créé le: ${new Date(ticketData.createdAt).toLocaleString()}\n\n`;

        // Trier les messages par ordre chronologique
        const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        for (const [id, message] of sortedMessages) {
          const timestamp = new Date(message.createdTimestamp).toLocaleString();
          transcript += `[${timestamp}] ${message.author.tag}: ${message.content}\n`;
        }

        // Créer un fichier temporaire
        const transcriptPath = path.join(__dirname, '..', `transcript_${ticketId}.txt`);
        fs.writeFileSync(transcriptPath, transcript);

        await interaction.reply({
          content: `📄 Transcription du ticket ${ticketId} générée.`,
          files: [transcriptPath],
          ephemeral: true
        });

        // Supprimer le fichier temporaire
        fs.unlinkSync(transcriptPath);

      } catch (error) {
        console.error('Erreur lors de la génération de la transcription:', error);
        await interaction.reply({ content: '❌ Erreur lors de la génération de la transcription.', ephemeral: true });
      }
    } else if (subcommand === 'embed') {
      // Créer le modal pour configurer l'embed de création de tickets
      const modal = new ModalBuilder()
        .setCustomId('ticket_embed_modal')
        .setTitle('Configurer l\'embed de création de tickets');

      const titleInput = new TextInputBuilder()
        .setCustomId('embed_title')
        .setLabel('Titre de l\'embed')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: 🎫 Système de Support')
        .setRequired(true)
        .setMaxLength(256);

      const descriptionInput = new TextInputBuilder()
        .setCustomId('embed_description')
        .setLabel('Description de l\'embed')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Décrivez le système de tickets...')
        .setRequired(true)
        .setMaxLength(4000);

      const footerInput = new TextInputBuilder()
        .setCustomId('embed_footer')
        .setLabel('Footer de l\'embed (optionnel)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Cliquez sur le bouton pour créer un ticket')
        .setRequired(false)
        .setMaxLength(2048);

      const buttonTextInput = new TextInputBuilder()
        .setCustomId('button_text')
        .setLabel('Texte du bouton')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Créer un ticket')
        .setRequired(true)
        .setMaxLength(80);

      const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
      const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);
      const thirdActionRow = new ActionRowBuilder().addComponents(footerInput);
      const fourthActionRow = new ActionRowBuilder().addComponents(buttonTextInput);

      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);
      await interaction.showModal(modal);
    }
  },
}; 