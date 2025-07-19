const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const settingsPath = './settings.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName('funnymsg')
    .setDescription('Configure funny bot responses')
    .addSubcommand(sub =>
      sub.setName('eat')
        .setDescription('Configure eat detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable eat detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('sleep')
        .setDescription('Configure sleep detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable sleep detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('game')
        .setDescription('Configure game detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable game detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('work')
        .setDescription('Configure work detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable work detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('study')
        .setDescription('Configure study detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable study detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('sport')
        .setDescription('Configure sport detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable sport detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('travel')
        .setDescription('Configure travel detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable travel detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('happy')
        .setDescription('Configure happy detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable happy detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('tired')
        .setDescription('Configure tired detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable tired detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('stress')
        .setDescription('Configure stress detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable stress detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('pizza')
        .setDescription('Configure pizza detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable pizza detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('coffee')
        .setDescription('Configure coffee detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable coffee detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('music')
        .setDescription('Configure music detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable music detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('concert')
        .setDescription('Configure concert detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable concert detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('movie')
        .setDescription('Configure movie detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable movie detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('series')
        .setDescription('Configure series detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable series detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('birthday')
        .setDescription('Configure birthday detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable birthday detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('weekend')
        .setDescription('Configure weekend detection and response')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Enable or disable weekend detection')
            .addChoices(
              { name: 'Enable', value: 'enable' },
              { name: 'Disable', value: 'disable' }
            )
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
    }
    // Check if user is admin
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ Only administrators can configure funny message detection for this server.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // Load settings
    let settings = {};
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }

    if (!settings[guildId]) settings[guildId] = {};
    if (!settings[guildId].funny) {
      settings[guildId].funny = {
        eat: { enabled: false },
        sleep: { enabled: false },
        game: { enabled: false },
        work: { enabled: false },
        study: { enabled: false },
        sport: { enabled: false },
        travel: { enabled: false },
        happy: { enabled: false },
        tired: { enabled: false },
        stress: { enabled: false },
        pizza: { enabled: false },
        coffee: { enabled: false },
        music: { enabled: false },
        concert: { enabled: false },
        movie: { enabled: false },
        series: { enabled: false },
        birthday: { enabled: false },
        weekend: { enabled: false }
      };
    }

    try {
      if (sub === 'eat') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.eat.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Eat Detection Enabled' : '❌ Eat Detection Disabled')
          .setDescription(`Eat detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"je mange" / "I eat"', inline: true },
            { name: 'Response', value: 'Bon appétit! / Enjoy your meal!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'sleep') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.sleep.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Sleep Detection Enabled' : '❌ Sleep Detection Disabled')
          .setDescription(`Sleep detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m going to sleep" / "I\'m going to bed"', inline: true },
            { name: 'Response', value: 'Bonne nuit! / Good night!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'game') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.game.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Game Detection Enabled' : '❌ Game Detection Disabled')
          .setDescription(`Game detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m playing" / "I\'m gaming"', inline: true },
            { name: 'Response', value: 'Have fun gaming! Good luck!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'work') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.work.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Work Detection Enabled' : '❌ Work Detection Disabled')
          .setDescription(`Work detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m working" / "I\'m at work"', inline: true },
            { name: 'Response', value: 'Good luck with work! Stay productive!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'study') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.study.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Study Detection Enabled' : '❌ Study Detection Disabled')
          .setDescription(`Study detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m studying" / "I\'m learning"', inline: true },
            { name: 'Response', value: 'Good luck studying! You got this!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'sport') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.sport.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Sport Detection Enabled' : '❌ Sport Detection Disabled')
          .setDescription(`Sport detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m exercising" / "I\'m working out"', inline: true },
            { name: 'Response', value: 'Keep it up! Stay strong!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'travel') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.travel.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Travel Detection Enabled' : '❌ Travel Detection Disabled')
          .setDescription(`Travel detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m traveling" / "I\'m on a trip"', inline: true },
            { name: 'Response', value: 'Safe travels! Have a great trip!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'happy') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.happy.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Happy Detection Enabled' : '❌ Happy Detection Disabled')
          .setDescription(`Happy detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m happy" / "I\'m glad"', inline: true },
            { name: 'Response', value: 'That\'s great! Keep smiling!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'tired') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.tired.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Tired Detection Enabled' : '❌ Tired Detection Disabled')
          .setDescription(`Tired detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m tired" / "I\'m exhausted"', inline: true },
            { name: 'Response', value: 'Take a rest! You deserve it!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'stress') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.stress.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Stress Detection Enabled' : '❌ Stress Detection Disabled')
          .setDescription(`Stress detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m stressed" / "I\'m worried"', inline: true },
            { name: 'Response', value: 'Take a deep breath! You\'ll be okay!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'pizza') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.pizza.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Pizza Detection Enabled' : '❌ Pizza Detection Disabled')
          .setDescription(`Pizza detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m eating pizza" / "pizza time"', inline: true },
            { name: 'Response', value: 'Pizza time! Enjoy your slice!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'coffee') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.coffee.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Coffee Detection Enabled' : '❌ Coffee Detection Disabled')
          .setDescription(`Coffee detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m drinking coffee" / "coffee time"', inline: true },
            { name: 'Response', value: 'Coffee time! Stay awake!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'music') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.music.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Music Detection Enabled' : '❌ Music Detection Disabled')
          .setDescription(`Music detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m listening to music"', inline: true },
            { name: 'Response', value: 'Great music! Rock on!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'concert') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.concert.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Concert Detection Enabled' : '❌ Concert Detection Disabled')
          .setDescription(`Concert detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m at a concert"', inline: true },
            { name: 'Response', value: 'Have fun at the concert! Rock the night!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'movie') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.movie.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Movie Detection Enabled' : '❌ Movie Detection Disabled')
          .setDescription(`Movie detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m watching a movie"', inline: true },
            { name: 'Response', value: 'Enjoy the movie! Don\'t forget the popcorn!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'series') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.series.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Series Detection Enabled' : '❌ Series Detection Disabled')
          .setDescription(`Series detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"I\'m watching a series"', inline: true },
            { name: 'Response', value: 'Binge time! Don\'t forget to sleep!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'birthday') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.birthday.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Birthday Detection Enabled' : '❌ Birthday Detection Disabled')
          .setDescription(`Birthday detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"It\'s my birthday"', inline: true },
            { name: 'Response', value: 'Happy Birthday! Have an amazing day!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (sub === 'weekend') {
        const action = interaction.options.getString('action');
        const enabled = action === 'enable';
        
        settings[guildId].funny.weekend.enabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const embed = new EmbedBuilder()
          .setTitle(enabled ? '✅ Weekend Detection Enabled' : '❌ Weekend Detection Disabled')
          .setDescription(`Weekend detection and response is now ${enabled ? 'active' : 'inactive'}.`)
          .addFields(
            { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Trigger', value: '"It\'s weekend" / "TGIF"', inline: true },
            { name: 'Response', value: 'Weekend vibes! Have fun!', inline: true }
          )
          .setColor(enabled ? 0x00ff99 : 0xff5555)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

      }

    } catch (error) {
      console.error('Error in funny command:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while configuring funny responses.', 
        ephemeral: true 
      });
    }
  }
}; 