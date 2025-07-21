const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const OWNER_ID = '1233390879742492692';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('own')
    .setDescription('Owner-only commands')
    .addSubcommand(sub =>
      sub.setName('guild')
        .setDescription('Liste les serveurs du bot')
    )
    .addSubcommand(sub =>
      sub.setName('geninvite')
        .setDescription('Génère une invitation pour un serveur')
        .addStringOption(opt =>
          opt.setName('guild')
            .setDescription('ID du serveur')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('ban')
        .setDescription('Ban un utilisateur dans un serveur')
        .addStringOption(opt =>
          opt.setName('guild')
            .setDescription('ID du serveur')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('user')
            .setDescription('ID de l\'utilisateur à bannir')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('unban')
        .setDescription('Unban un utilisateur dans un serveur')
        .addStringOption(opt =>
          opt.setName('guild')
            .setDescription('ID du serveur')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('user')
            .setDescription('ID de l\'utilisateur à unban')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Cette commande est réservée au propriétaire du bot.',
        ephemeral: true
      });
    }

    const sub = interaction.options.getSubcommand();
    const client = interaction.client;

    if (sub === 'guild') {
      const guilds = client.guilds.cache.map(g => g);
      if (guilds.length === 0) {
        return interaction.reply({
          content: 'Le bot n\'est dans aucun serveur.',
          ephemeral: true
        });
      }
      let description = '';
      for (const guild of guilds) {
        description += `**${guild.name}** (ID: \`${guild.id}\`)\nMembres: ${guild.memberCount}\n`;
      }
      const embed = new EmbedBuilder()
        .setTitle('Liste des serveurs du bot')
        .setDescription(description)
        .setColor(0x5865F2)
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'geninvite') {
      const guildId = interaction.options.getString('guild');
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        return interaction.reply({ content: '❌ Serveur introuvable.', ephemeral: true });
      }
      let invite = 'Aucune permission';
      try {
        const channel = guild.channels.cache.find(
          c => c.type === 0 && c.permissionsFor(guild.members.me).has(PermissionFlagsBits.CreateInstantInvite)
        );
        if (channel) {
          const inviteObj = await channel.createInvite({ maxAge: 600, maxUses: 1, unique: true, reason: 'Owner request' });
          invite = `[Lien d'invitation](${inviteObj.url})`;
        } else {
          invite = 'Aucun salon accessible';
        }
      } catch {
        invite = 'Erreur lors de la génération';
      }
      const embed = new EmbedBuilder()
        .setTitle(`Invitation pour ${guild.name}`)
        .setDescription(invite)
        .setColor(0x5865F2)
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'ban') {
      const guildId = interaction.options.getString('guild');
      const userId = interaction.options.getString('user');
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        return interaction.reply({ content: '❌ Serveur introuvable.', ephemeral: true });
      }
      try {
        await guild.members.ban(userId, { reason: `Ban via /own par ${interaction.user.tag}` });
        const embed = new EmbedBuilder()
          .setTitle('Utilisateur banni')
          .setDescription(`L'utilisateur \`${userId}\` a été banni du serveur **${guild.name}**.`)
          .setColor(0xff0000)
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (e) {
        await interaction.reply({ content: `❌ Erreur lors du ban : ${e.message}`, ephemeral: true });
      }
    }

    if (sub === 'unban') {
      const guildId = interaction.options.getString('guild');
      const userId = interaction.options.getString('user');
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        return interaction.reply({ content: '❌ Serveur introuvable.', ephemeral: true });
      }
      try {
        await guild.members.unban(userId, `Unban via /own par ${interaction.user.tag}`);
        const embed = new EmbedBuilder()
          .setTitle('Utilisateur débanni')
          .setDescription(`L'utilisateur \`${userId}\` a été débanni du serveur **${guild.name}**.`)
          .setColor(0x00ff00)
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (e) {
        await interaction.reply({ content: `❌ Erreur lors du unban : ${e.message}`, ephemeral: true });
      }
    }
  }
}; 