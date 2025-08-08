const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getusers')
    .setDescription('Récupère la liste des utilisateurs du serveur et l\'envoie via webhook')
    .addStringOption(option =>
      option.setName('webhook_url')
        .setDescription('URL du webhook Discord')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    // Vérifier que c'est bien vous qui utilisez la commande
    const authorizedUserId = '1233390879742492692'; // Remplacez par votre ID Discord
    
    if (interaction.user.id !== authorizedUserId) {
      const embed = new EmbedBuilder()
        .setTitle('❌ Accès refusé')
        .setDescription('Cette commande est réservée à l\'administrateur du bot.')
        .setColor(0xFF0000)
        .setTimestamp();
      
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

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
      // Répondre immédiatement pour éviter le timeout
      const loadingEmbed = new EmbedBuilder()
        .setTitle('⏳ Traitement en cours')
        .setDescription('Récupération de la liste des utilisateurs...')
        .setColor(0xFFFF00)
        .setTimestamp();
      
      await interaction.reply({ embeds: [loadingEmbed], ephemeral: true });

      // Récupérer tous les membres du serveur
      const guild = interaction.guild;
      await guild.members.fetch(); // Force le fetch de tous les membres
      
      const members = guild.members.cache;
      const usersList = [];
      
      members.forEach(member => {
        const user = member.user;
        const roles = member.roles.cache
          .filter(role => role.id !== guild.id) // Exclure le rôle @everyone
          .map(role => role.name)
          .join(', ');
        
        usersList.push({
          id: user.id,
          username: user.username,
          globalName: user.globalName || user.username,
          tag: user.tag,
          joinedAt: member.joinedAt ? member.joinedAt.toISOString() : 'Inconnu',
          roles: roles || 'Aucun rôle',
          isBot: user.bot,
          status: member.presence?.status || 'offline'
        });
      });

      // Trier par date d'arrivée (plus récent en premier)
      usersList.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

             // Créer le fichier JSON avec les données des utilisateurs
       const jsonData = {
         serverInfo: {
           name: guild.name,
           id: guild.id,
           memberCount: usersList.length,
           createdAt: guild.createdAt.toISOString(),
           exportedAt: new Date().toISOString()
         },
         statistics: {
           totalMembers: usersList.length,
           bots: usersList.filter(u => u.isBot).length,
           humans: usersList.filter(u => !u.isBot).length,
           onlineUsers: usersList.filter(u => u.status === 'online').length,
           idleUsers: usersList.filter(u => u.status === 'idle').length,
           dndUsers: usersList.filter(u => u.status === 'dnd').length,
           offlineUsers: usersList.filter(u => u.status === 'offline').length
         },
         users: usersList
       };

       // Créer le nom du fichier avec timestamp
       const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
       const fileName = `users_${guild.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
       const filePath = path.join('/data', fileName);

       // Écrire le fichier JSON
       fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

       // Créer l'attachment pour le webhook
       const fileBuffer = fs.readFileSync(filePath);
       const attachment = new AttachmentBuilder(fileBuffer, { name: fileName });

       // Préparer les données pour le webhook
       const webhookData = {
         username: 'DSU Bot - Export Utilisateurs',
         avatar_url: interaction.client.user.displayAvatarURL(),
         embeds: [{
           title: '📊 Export des utilisateurs terminé',
           description: `**Serveur:** ${guild.name}\n**Total d'utilisateurs:** ${usersList.length}\n\n**Statistiques:**\n• Membres totaux: ${usersList.length}\n• Bots: ${jsonData.statistics.bots}\n• Humains: ${jsonData.statistics.humans}\n• En ligne: ${jsonData.statistics.onlineUsers}\n• Inactif: ${jsonData.statistics.idleUsers}\n• Ne pas déranger: ${jsonData.statistics.dndUsers}\n• Hors ligne: ${jsonData.statistics.offlineUsers}`,
           color: 0x00BFFF,
           footer: {
             text: `Exporté le ${new Date().toLocaleString('fr-FR')}`
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
           .setTitle('✅ Export terminé')
           .setDescription(`Fichier JSON avec **${usersList.length}** utilisateurs envoyé via webhook.\n\n**Fichier:** \`${fileName}\`\n**Taille:** ${(fileBuffer.length / 1024).toFixed(2)} KB\n\n**Statistiques:**\n• Membres totaux: ${usersList.length}\n• Bots: ${jsonData.statistics.bots}\n• Humains: ${jsonData.statistics.humans}\n• En ligne: ${jsonData.statistics.onlineUsers}`)
           .setColor(0x00FF00)
           .setTimestamp();
         
         await interaction.editReply({ embeds: [successEmbed] });
       } else {
         throw new Error(`Erreur webhook: ${webhookResponse.status}`);
       }

    } catch (error) {
      console.error('Erreur dans la commande getusers:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Erreur')
        .setDescription(`Une erreur s'est produite: ${error.message}`)
        .setColor(0xFF0000)
        .setTimestamp();
      
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
}; 