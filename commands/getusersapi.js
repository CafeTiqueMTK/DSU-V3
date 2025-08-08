const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getusersapi')
    .setDescription('Récupère la liste des utilisateurs via API Discord (⚠️ ToS)')
    .addStringOption(option =>
      option.setName('guild_id')
        .setDescription('ID du serveur Discord')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('webhook_url')
        .setDescription('URL du webhook Discord')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    // Vérifier que c'est bien vous qui utilisez la commande
    const authorizedUserId = '1233390879742492692';
    
    if (interaction.user.id !== authorizedUserId) {
      const embed = new EmbedBuilder()
        .setTitle('❌ Accès refusé')
        .setDescription('Cette commande est réservée à l\'administrateur du bot.')
        .setColor(0xFF0000)
        .setTimestamp();
      
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const guildId = interaction.options.getString('guild_id');
    const webhookUrl = interaction.options.getString('webhook_url');
    
    // Vérifier que l'URL du webhook est valide
    if (!webhookUrl.includes('discord.com/api/webhooks/')) {
      const embed = new EmbedBuilder()
        .setTitle('❌ URL invalide')
        .setDescription('L\'URL du webhook fournie n\'est pas valide.')
        .setColor(0xFF0000)
        .setTimestamp();
      
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      const loadingEmbed = new EmbedBuilder()
        .setTitle('⏳ Traitement en cours')
        .setDescription('⚠️ **ATTENTION** : Cette méthode utilise l\'API Discord directement.\nCela peut être contre les ToS de Discord.\n\nRécupération de la liste des utilisateurs...')
        .setColor(0xFFFF00)
        .setTimestamp();
      
      await interaction.reply({ embeds: [loadingEmbed], ephemeral: true });

      // Récupérer les informations du serveur
      const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!guildResponse.ok) {
        throw new Error(`Impossible d'accéder au serveur: ${guildResponse.status}`);
      }

      const guildData = await guildResponse.json();
      
      // Récupérer les membres (limité à 1000 par défaut)
      const membersResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!membersResponse.ok) {
        throw new Error(`Impossible de récupérer les membres: ${membersResponse.status}`);
      }

      const membersData = await membersResponse.json();
      
      if (!Array.isArray(membersData)) {
        throw new Error('Format de réponse invalide pour les membres');
      }

      const usersList = membersData.map(member => ({
        id: member.user.id,
        username: member.user.username,
        globalName: member.user.global_name || member.user.username,
        tag: `${member.user.username}#${member.user.discriminator}`,
        joinedAt: member.joined_at || 'Inconnu',
        roles: member.roles ? member.roles.join(', ') : 'Aucun rôle',
        isBot: member.user.bot || false,
        status: 'offline' // Impossible de récupérer le statut via API REST
      }));

      if (usersList.length === 0) {
        throw new Error('Aucun membre trouvé dans le serveur.');
      }

      console.log(`Récupération terminée: ${usersList.length} utilisateurs trouvés`);

      // Créer le fichier JSON
      const jsonData = {
        serverInfo: {
          name: guildData.name,
          id: guildData.id,
          memberCount: guildData.approximate_member_count || usersList.length,
          createdAt: new Date(guildData.created_at).toISOString(),
          exportedAt: new Date().toISOString()
        },
        statistics: {
          totalMembers: usersList.length,
          bots: usersList.filter(u => u.isBot).length,
          humans: usersList.filter(u => !u.isBot).length,
          note: 'Statuts non disponibles via API REST'
        },
        users: usersList,
        warning: '⚠️ Cette liste peut être incomplète car limitée à 1000 membres par défaut'
      };

      // Créer le nom du fichier
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const fileName = `users_${guildData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
      const filePath = path.join('/data', fileName);

      // Écrire le fichier JSON
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
      const fileBuffer = fs.readFileSync(filePath);

      // Préparer les données pour le webhook
      const webhookData = {
        username: 'DSU Bot - Export API',
        avatar_url: interaction.client.user.displayAvatarURL(),
        embeds: [{
          title: '📊 Export via API terminé',
          description: `**Serveur:** ${guildData.name}\n**Total d'utilisateurs:** ${usersList.length}\n\n**Statistiques:**\n• Membres récupérés: ${usersList.length}\n• Bots: ${jsonData.statistics.bots}\n• Humains: ${jsonData.statistics.humans}\n\n⚠️ **Limitation:** Liste limitée à 1000 membres maximum`,
          color: 0xFFA500,
          footer: {
            text: `Exporté le ${new Date().toLocaleString('fr-FR')} - Via API Discord`
          },
          timestamp: new Date().toISOString()
        }],
        files: [{
          name: fileName,
          data: fileBuffer
        }]
      };

      // Envoyer via webhook
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (webhookResponse.ok) {
        const successEmbed = new EmbedBuilder()
          .setTitle('✅ Export API terminé')
          .setDescription(`Fichier JSON avec **${usersList.length}** utilisateurs envoyé via webhook.\n\n**Fichier:** \`${fileName}\`\n**Taille:** ${(fileBuffer.length / 1024).toFixed(2)} KB\n\n⚠️ **Attention:** Cette méthode utilise l'API Discord directement et peut être contre les ToS.`)
          .setColor(0xFFA500)
          .setTimestamp();
        
        await interaction.editReply({ embeds: [successEmbed] });
      } else {
        throw new Error(`Erreur webhook: ${webhookResponse.status}`);
      }

    } catch (error) {
      console.error('Erreur dans la commande getusersapi:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Erreur API')
        .setDescription(`Une erreur s'est produite: ${error.message}`)
        .setColor(0xFF0000)
        .setTimestamp();
      
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};
