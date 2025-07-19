const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Gérer le système de rôle réaction')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Créer un message de rôle réaction')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Le canal où envoyer le message')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Titre du message')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Description du message')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role1')
            .setDescription('Premier rôle')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('label1')
            .setDescription('Label du premier bouton')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role2')
            .setDescription('Deuxième rôle')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('label2')
            .setDescription('Label du deuxième bouton')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role3')
            .setDescription('Troisième rôle')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('label3')
            .setDescription('Label du troisième bouton')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role4')
            .setDescription('Quatrième rôle')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('label4')
            .setDescription('Label du quatrième bouton')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role5')
            .setDescription('Cinquième rôle')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('label5')
            .setDescription('Label du cinquième bouton')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Lister tous les messages de rôle réaction'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Supprimer un message de rôle réaction')
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('ID du message à supprimer')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const reactionRolesPath = path.join(__dirname, '..', 'reaction_roles.json');

    // Charger ou créer le fichier de configuration
    let reactionRoles = {};
    if (fs.existsSync(reactionRolesPath)) {
      reactionRoles = JSON.parse(fs.readFileSync(reactionRolesPath, 'utf-8'));
    }
    if (!reactionRoles[guildId]) {
      reactionRoles[guildId] = {};
    }

    if (subcommand === 'setup') {
      const channel = interaction.options.getChannel('channel');
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      
      // Récupérer les rôles et labels
      const roles = [];
      const labels = [];
      
      for (let i = 1; i <= 5; i++) {
        const role = interaction.options.getRole(`role${i}`);
        const label = interaction.options.getString(`label${i}`);
        if (role && label) {
          roles.push(role);
          labels.push(label);
        }
      }

      if (roles.length === 0) {
        return await interaction.reply({ content: '❌ Vous devez spécifier au moins un rôle et un label.', ephemeral: true });
      }

      // Créer l'embed
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(0x00ff99)
        .setFooter({ text: 'Cliquez sur les boutons pour obtenir vos rôles' })
        .setTimestamp();

      // Créer les boutons
      const rows = [];
      const buttonsPerRow = 3;
      
      for (let i = 0; i < roles.length; i++) {
        const rowIndex = Math.floor(i / buttonsPerRow);
        if (!rows[rowIndex]) {
          rows[rowIndex] = new ActionRowBuilder();
        }
        
        const button = new ButtonBuilder()
          .setCustomId(`reaction_role_${roles[i].id}`)
          .setLabel(labels[i])
          .setStyle(ButtonStyle.Primary);
        
        rows[rowIndex].addComponents(button);
      }

      // Envoyer le message
      const message = await channel.send({
        embeds: [embed],
        components: rows
      });

      // Sauvegarder la configuration
      reactionRoles[guildId][message.id] = {
        channelId: channel.id,
        roles: roles.map(role => ({
          id: role.id,
          name: role.name
        })),
        labels: labels
      };

      fs.writeFileSync(reactionRolesPath, JSON.stringify(reactionRoles, null, 2));

      await interaction.reply({ 
        content: `✅ Message de rôle réaction créé dans ${channel} avec ${roles.length} rôle(s).`, 
        ephemeral: true 
      });

    } else if (subcommand === 'list') {
      const guildReactionRoles = reactionRoles[guildId];
      
      if (Object.keys(guildReactionRoles).length === 0) {
        return await interaction.reply({ content: '❌ Aucun message de rôle réaction configuré.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('📋 Messages de rôle réaction')
        .setColor(0x00ff99)
        .setTimestamp();

      for (const [messageId, config] of Object.entries(guildReactionRoles)) {
        const channel = interaction.guild.channels.cache.get(config.channelId);
        const rolesList = config.roles.map((role, index) => 
          `• ${config.labels[index]}: <@&${role.id}>`
        ).join('\n');

        embed.addFields({
          name: `Message ID: ${messageId}`,
          value: `Canal: ${channel ? channel.toString() : 'Canal supprimé'}\nRôles:\n${rolesList}`,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } else if (subcommand === 'delete') {
      const messageId = interaction.options.getString('message_id');
      
      if (!reactionRoles[guildId][messageId]) {
        return await interaction.reply({ content: '❌ Message de rôle réaction non trouvé.', ephemeral: true });
      }

      // Supprimer le message du canal
      try {
        const channel = interaction.guild.channels.cache.get(reactionRoles[guildId][messageId].channelId);
        if (channel) {
          const message = await channel.messages.fetch(messageId);
          await message.delete();
        }
      } catch (error) {
        console.log('Message déjà supprimé ou introuvable');
      }

      // Supprimer de la configuration
      delete reactionRoles[guildId][messageId];
      fs.writeFileSync(reactionRolesPath, JSON.stringify(reactionRoles, null, 2));

      await interaction.reply({ 
        content: `✅ Message de rôle réaction supprimé.`, 
        ephemeral: true 
      });
    }
  },
}; 