const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole-emoji')
    .setDescription('Gérer le système de rôle réaction avec émojis')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Créer un message de rôle réaction avec émojis')
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
          option.setName('emoji1')
            .setDescription('Émoji pour le premier rôle')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role2')
            .setDescription('Deuxième rôle')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('emoji2')
            .setDescription('Émoji pour le deuxième rôle')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role3')
            .setDescription('Troisième rôle')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('emoji3')
            .setDescription('Émoji pour le troisième rôle')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role4')
            .setDescription('Quatrième rôle')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('emoji4')
            .setDescription('Émoji pour le quatrième rôle')
            .setRequired(false))
        .addRoleOption(option =>
          option.setName('role5')
            .setDescription('Cinquième rôle')
            .setRequired(false))
        .addStringOption(option =>
          option.setName('emoji5')
            .setDescription('Émoji pour le cinquième rôle')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Lister tous les messages de rôle réaction avec émojis'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Supprimer un message de rôle réaction avec émojis')
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('ID du message à supprimer')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const reactionRolesEmojiPath = path.join(__dirname, '..', 'reaction_roles_emoji.json');

    // Charger ou créer le fichier de configuration
    let reactionRolesEmoji = {};
    if (fs.existsSync(reactionRolesEmojiPath)) {
      reactionRolesEmoji = JSON.parse(fs.readFileSync(reactionRolesEmojiPath, 'utf-8'));
    }
    if (!reactionRolesEmoji[guildId]) {
      reactionRolesEmoji[guildId] = {};
    }

    if (subcommand === 'setup') {
      const channel = interaction.options.getChannel('channel');
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      
      // Récupérer les rôles et émojis
      const roles = [];
      const emojis = [];
      
      for (let i = 1; i <= 5; i++) {
        const role = interaction.options.getRole(`role${i}`);
        const emoji = interaction.options.getString(`emoji${i}`);
        if (role && emoji) {
          roles.push(role);
          emojis.push(emoji);
        }
      }

      if (roles.length === 0) {
        return await interaction.reply({ content: '❌ Vous devez spécifier au moins un rôle et un émoji.', ephemeral: true });
      }

      // Créer l'embed
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(0x00ff99)
        .setFooter({ text: 'Réagissez avec les émojis pour obtenir vos rôles' })
        .setTimestamp();

      // Ajouter les rôles et émojis à l'embed
      let rolesList = '';
      for (let i = 0; i < roles.length; i++) {
        rolesList += `${emojis[i]} - ${roles[i]}\n`;
      }
      embed.addFields({ name: 'Rôles disponibles', value: rolesList });

      // Envoyer le message
      const message = await channel.send({ embeds: [embed] });

      // Ajouter les réactions
      for (const emoji of emojis) {
        await message.react(emoji);
      }

      // Sauvegarder la configuration
      reactionRolesEmoji[guildId][message.id] = {
        channelId: channel.id,
        roles: roles.map(role => ({
          id: role.id,
          name: role.name
        })),
        emojis: emojis
      };

      fs.writeFileSync(reactionRolesEmojiPath, JSON.stringify(reactionRolesEmoji, null, 2));

      await interaction.reply({ 
        content: `✅ Message de rôle réaction avec émojis créé dans ${channel} avec ${roles.length} rôle(s).`, 
        ephemeral: true 
      });

    } else if (subcommand === 'list') {
      const guildReactionRolesEmoji = reactionRolesEmoji[guildId];
      
      if (Object.keys(guildReactionRolesEmoji).length === 0) {
        return await interaction.reply({ content: '❌ Aucun message de rôle réaction avec émojis configuré.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('📋 Messages de rôle réaction avec émojis')
        .setColor(0x00ff99)
        .setTimestamp();

      for (const [messageId, config] of Object.entries(guildReactionRolesEmoji)) {
        const channel = interaction.guild.channels.cache.get(config.channelId);
        const rolesList = config.roles.map((role, index) => 
          `• ${config.emojis[index]} ${role.name}: <@&${role.id}>`
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
      
      if (!reactionRolesEmoji[guildId][messageId]) {
        return await interaction.reply({ content: '❌ Message de rôle réaction avec émojis non trouvé.', ephemeral: true });
      }

      // Supprimer le message du canal
      try {
        const channel = interaction.guild.channels.cache.get(reactionRolesEmoji[guildId][messageId].channelId);
        if (channel) {
          const message = await channel.messages.fetch(messageId);
          await message.delete();
        }
      } catch (error) {
        console.log('Message déjà supprimé ou introuvable');
      }

      // Supprimer de la configuration
      delete reactionRolesEmoji[guildId][messageId];
      fs.writeFileSync(reactionRolesEmojiPath, JSON.stringify(reactionRolesEmoji, null, 2));

      await interaction.reply({ 
        content: `✅ Message de rôle réaction avec émojis supprimé.`, 
        ephemeral: true 
      });
    }
  },
}; 