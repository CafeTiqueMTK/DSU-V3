const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testusers')
    .setDescription('Test simple pour vérifier l\'accès aux membres')
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

    try {
      const guild = interaction.guild;
      
      const embed = new EmbedBuilder()
        .setTitle('🔍 Test d\'accès aux membres')
        .setColor(0x00BFFF)
        .addFields(
          { name: 'Serveur', value: guild.name, inline: true },
          { name: 'ID Serveur', value: guild.id, inline: true },
          { name: 'Membres dans le cache', value: guild.members?.cache?.size?.toString() || 'N/A', inline: true },
          { name: 'guild.members existe', value: guild.members ? '✅ Oui' : '❌ Non', inline: true },
          { name: 'guild.members.cache existe', value: guild.members?.cache ? '✅ Oui' : '❌ Non', inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Erreur dans testusers:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Erreur de test')
        .setDescription(`Erreur: ${error.message}`)
        .setColor(0xFF0000)
        .setTimestamp();
      
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
