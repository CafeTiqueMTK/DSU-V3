const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage the ticket system')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Setup the ticket system')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to post the ticket creation message')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('support_role')
            .setDescription('Support role to mention in tickets')
            .setRequired(true))
        .addChannelOption(option =>
          option.setName('tickets_category')
            .setDescription('Category to create tickets in')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Title of the ticket creation message')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Description of the ticket creation message')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('button_text')
            .setDescription('Text for the creation button')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('config')
        .setDescription('Edit ticket configuration')
        .addStringOption(option =>
          option.setName('setting')
            .setDescription('Setting to edit')
            .setRequired(true)
            .addChoices(
              { name: 'Support Role', value: 'support_role' },
              { name: 'Tickets Category', value: 'tickets_category' },
              { name: 'Welcome Message', value: 'welcome_message' },
              { name: 'Ticket Prefix', value: 'ticket_prefix' }
            ))
        .addStringOption(option =>
          option.setName('value')
            .setDescription('New value')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all open tickets'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Close a ticket')
        .addStringOption(option =>
          option.setName('ticket_id')
            .setDescription('ID of the ticket to close')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Reason for closing')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('transcript')
        .setDescription('Generate a transcript of a ticket')
        .addStringOption(option =>
          option.setName('ticket_id')
            .setDescription('ID of the ticket')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('embed')
        .setDescription('Configure the ticket creation embed'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const ticketsPath = path.join(__dirname, '..', 'tickets.json');

    // Load or create config file
    let ticketsConfig = {};
    if (fs.existsSync(ticketsPath)) {
      ticketsConfig = JSON.parse(fs.readFileSync(ticketsPath, 'utf-8'));
    }
    if (!ticketsConfig[guildId]) {
      ticketsConfig[guildId] = {
        setup: false,
        supportRole: null,
        ticketsCategory: null,
        welcomeMessage: "Welcome to your ticket! A support member will assist you soon.",
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
      const buttonText = interaction.options.getString('button_text') || 'Create Ticket';

      // Check that the category is a category
      if (ticketsCategory.type !== 4) {
        return await interaction.reply({ 
          content: '❌ The specified channel for tickets must be a category.', 
          flags: 64 
        });
      }

      // Create the ticket creation embed
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(0x00ff99)
        .setFooter({ text: 'Ticket System' })
        .setTimestamp();

      // Create the button
      const button = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel(buttonText)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎫')
        );

      // Send the message
      const message = await channel.send({
        embeds: [embed],
        components: [button]
      });

      // Save the configuration
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
        content: `✅ Ticket system configured in ${channel} with support role ${supportRole.name}.`, 
        flags: 64 
      });

    } else if (subcommand === 'config') {
      const setting = interaction.options.getString('setting');
      const value = interaction.options.getString('value');

      switch (setting) {
        case 'support_role':
          const role = interaction.guild.roles.cache.get(value);
          if (!role) {
            return await interaction.reply({ content: '❌ Role not found.', flags: 64 });
          }
          ticketsConfig[guildId].supportRole = value;
          break;
        case 'tickets_category':
          const category = interaction.guild.channels.cache.get(value);
          if (!category || category.type !== 4) {
            return await interaction.reply({ content: '❌ Category not found.', flags: 64 });
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
        content: `✅ Configuration updated: ${setting} = ${value}`, 
        flags: 64 
      });

    } else if (subcommand === 'list') {
      const activeTickets = ticketsConfig[guildId].activeTickets;
      
      if (Object.keys(activeTickets).length === 0) {
        return await interaction.reply({ content: '❌ No open tickets.', flags: 64 });
      }

      const embed = new EmbedBuilder()
        .setTitle('📋 Open Tickets')
        .setColor(0x00ff99)
        .setTimestamp();

      for (const [ticketId, ticketData] of Object.entries(activeTickets)) {
        const channel = interaction.guild.channels.cache.get(ticketData.channelId);
        const user = await interaction.client.users.fetch(ticketData.userId).catch(() => null);
        const ticketName = ticketData.ticketName || 'No name';
        
        embed.addFields({
          name: `🎫 ${ticketName}`,
          value: `**ID:** ${ticketId}\n**Channel:** ${channel ? channel.toString() : 'Deleted channel'}\n**User:** ${user ? user.tag : 'Unknown user'}\n**Opened:** <t:${Math.floor(ticketData.createdAt/1000)}:F>`,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed], flags: 64 });

    } else if (subcommand === 'close') {
      const ticketId = interaction.options.getString('ticket_id');
      const reason = interaction.options.getString('reason') || 'No reason specified';

      const ticketData = ticketsConfig[guildId].activeTickets[ticketId];
      if (!ticketData) {
        return await interaction.reply({ content: '❌ Ticket not found.', flags: 64 });
      }

      const channel = interaction.guild.channels.cache.get(ticketData.channelId);
      if (channel) {
        try {
          await channel.delete();
        } catch (error) {
          console.error('Error deleting channel:', error);
        }
      }

      // Remove the ticket from config
      delete ticketsConfig[guildId].activeTickets[ticketId];
      fs.writeFileSync(ticketsPath, JSON.stringify(ticketsConfig, null, 2));

      await interaction.reply({ 
        content: `✅ Ticket ${ticketId} closed. Reason: ${reason}`, 
        flags: 64 
      });

    } else if (subcommand === 'transcript') {
      // Not implemented in this version
      await interaction.reply({ content: '❌ Transcript feature is not implemented yet.', flags: 64 });
    } else if (subcommand === 'embed') {
      await interaction.reply({ content: '❌ Embed configuration is not implemented yet.', flags: 64 });
    }
  }
}; 