const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whatisit')
    .setDescription('Explains what the different bot features do')
    .addStringOption(option =>
      option.setName('feature')
        .setDescription('The feature to explain')
        .setRequired(true)
        .addChoices(
          { name: '🛡️ Anti', value: 'anti' },
          { name: '🤖 Automod', value: 'automod' },
          { name: '😄 FunnyMsg', value: 'funnymsg' },
          { name: '💰 Economy', value: 'economy' },
          { name: '🎫 Ticket', value: 'ticket' },
          { name: '⚖️ Mod', value: 'mod' },
          { name: '📊 Rater', value: 'rater' },
          { name: '📝 Log', value: 'log' }
        )
    ),

  async execute(interaction) {
    const feature = interaction.options.getString('feature');

    let embed;

    switch (feature) {
      case 'anti':
        embed = new EmbedBuilder()
          .setTitle('🛡️ Anti System')
          .setDescription('The anti system protects your server against different types of attacks and unwanted behaviors.')
          .addFields(
            { 
              name: '🔒 Anti-Raid Protection', 
              value: 'Detects and prevents mass raids on your server', 
              inline: false 
            },
            { 
              name: '🚫 Anti-Bot', 
              value: 'Prevents unauthorized bots from joining the server', 
              inline: false 
            },
            { 
              name: '🛡️ Anti-Spam', 
              value: 'Blocks spam messages and users who send too many messages', 
              inline: false 
            },
            { 
              name: '🔗 Anti-Link', 
              value: 'Prevents sending unauthorized links', 
              inline: false 
            },
            { 
              name: '⚡ Anti-Mass Mention', 
              value: 'Prevents mass mentions that can be used for harassment', 
              inline: false 
            },
            { 
              name: '🖼️ Anti-Mass Emoji', 
              value: 'Limits excessive emoji usage in messages', 
              inline: false 
            }
          )
          .setColor(0xff0000)
          .setFooter({ 
            text: 'Configuration: /anti [type] [enable/disable]', 
            iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();
        break;

      case 'automod':
        embed = new EmbedBuilder()
          .setTitle('🤖 Automod System')
          .setDescription('Automod is an automatic moderation system that monitors and acts on messages according to predefined rules.')
          .addFields(
            { 
              name: '⚙️ How it Works', 
              value: 'Automatically analyzes all messages and applies actions according to configured rules', 
              inline: false 
            },
            { 
              name: '🎯 Automatic Actions', 
              value: '• Message deletion\n• Automatic warnings\n• Temporary mute\n• Automatic kick/ban', 
              inline: false 
            },
            { 
              name: '📊 Detailed Logs', 
              value: 'Records all actions taken by automod in a dedicated channel', 
              inline: false 
            },
            { 
              name: '🔧 Customization', 
              value: 'Each rule can be enabled/disabled and configured individually', 
              inline: false 
            }
          )
          .setColor(0x00ff00)
          .setFooter({ 
            text: 'Configuration: /automod [enable/disable/status]', 
            iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();
        break;

      case 'funnymsg':
        embed = new EmbedBuilder()
          .setTitle('😄 FunnyMsg System')
          .setDescription('The FunnyMsg system adds humor and interactivity to your server with automatic funny messages.')
          .addFields(
            { 
              name: '🎭 Automatic Messages', 
              value: 'Sends humorous messages automatically based on different triggers', 
              inline: false 
            },
            { 
              name: '🎪 Message Types', 
              value: '• Funny welcome messages\n• Event reactions\n• Automatic jokes\n• Birthday messages', 
              inline: false 
            },
            { 
              name: '⚡ Customization', 
              value: 'Ability to configure messages, their frequency, and broadcast channels', 
              inline: false 
            },
            { 
              name: '🎯 Purpose', 
              value: 'Improve server atmosphere and encourage interaction between members', 
              inline: false 
            }
          )
          .setColor(0xffa500)
          .setFooter({ 
            text: 'Configuration: /funnymsg [enable/disable/set]', 
            iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();
        break;

      case 'economy':
        embed = new EmbedBuilder()
          .setTitle('💰 Economy System')
          .setDescription('The economy system allows members to earn, spend, and manage virtual currency on the server.')
          .addFields(
            { 
              name: '🪙 Virtual Currency', 
              value: 'Coin system that members can earn and spend', 
              inline: false 
            },
            { 
              name: '💼 Available Commands', 
              value: '• /work - Work to earn coins\n• /daily - Daily reward\n• /balance - Check your balance\n• /transfer - Transfer coins\n• /shop - Item shop', 
              inline: false 
            },
            { 
              name: '🏆 Level System', 
              value: 'Earn XP by being active and unlock rewards', 
              inline: false 
            },
            { 
              name: '🎁 Rewards', 
              value: 'Buy roles, special items, or perks with your coins', 
              inline: false 
            }
          )
          .setColor(0xffd700)
          .setFooter({ 
            text: 'Commands: /work, /daily, /balance, /transfer', 
            iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();
        break;

      case 'ticket':
        embed = new EmbedBuilder()
          .setTitle('🎫 Ticket System')
          .setDescription('The ticket system allows members to create private requests for help or report issues.')
          .addFields(
            { 
              name: '🎫 Ticket Creation', 
              value: 'Members can create private tickets to contact the moderation team', 
              inline: false 
            },
            { 
              name: '🔒 Privacy', 
              value: 'Each ticket is private and visible only to the creator and moderators', 
              inline: false 
            },
            { 
              name: '📋 Management', 
              value: '• Category system (Support, Bug Report, etc.)\n• Automatic transcripts\n• Closure system\n• Logs of all actions', 
              inline: false 
            },
            { 
              name: '⚙️ Configuration', 
              value: 'Customization of categories, permissions, and automatic messages', 
              inline: false 
            }
          )
          .setColor(0x0099ff)
          .setFooter({ 
            text: 'Usage: Click the "Create Ticket" button', 
            iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();
        break;

      case 'mod':
        embed = new EmbedBuilder()
          .setTitle('⚖️ Moderation System')
          .setDescription('The moderation system provides comprehensive tools to manage and maintain order on your server.')
          .addFields(
            { 
              name: '🛡️ Moderation Actions', 
              value: '• /mod ban - Ban a user\n• /mod kick - Kick a user\n• /mod warn - Warn a user\n• /mod mute - Mute a user', 
              inline: false 
            },
            { 
              name: '📊 Warning System', 
              value: 'Warning system with automatic actions based on warning count', 
              inline: false 
            },
            { 
              name: '🔍 Investigation Tools', 
              value: '• Action history\n• Detailed user information\n• Complete moderation logs', 
              inline: false 
            },
            { 
              name: '⚡ Quick Actions', 
              value: '• /unban - Unban a user\n• /unmute - Unmute a user\n• /clearwarn - Clear warnings', 
              inline: false 
            }
          )
          .setColor(0xff6b35)
          .setFooter({ 
            text: 'Commands: /mod [action] [user] [reason]', 
            iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();
        break;

      case 'rater':
        embed = new EmbedBuilder()
          .setTitle('📊 Rater System')
          .setDescription('The rater system offers fun commands to evaluate different aspects in a humorous way.')
          .addFields(
            { 
              name: '🎯 Available Commands', 
              value: '• /gayrater - Evaluates "gay" level humorously\n• /hotrater - Evaluates attractiveness\n• /poorrater - Evaluates poverty level\n• /smartrater - Evaluates intelligence\n• /chadrater - Evaluates "chad" level', 
              inline: false 
            },
            { 
              name: '🎪 How it Works', 
              value: 'Uses random algorithms to generate funny scores and humorous comments', 
              inline: false 
            },
            { 
              name: '😄 Purpose', 
              value: 'Add humor and interactivity to the server with fun evaluations', 
              inline: false 
            },
            { 
              name: '🎨 Customization', 
              value: 'Each rater can be configured with custom messages and different thresholds', 
              inline: false 
            }
          )
          .setColor(0xff69b4)
          .setFooter({ 
            text: 'Commands: /gayrater, /hotrater, /poorrater, /smartrater, /chadrater', 
            iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();
        break;

      case 'log':
        embed = new EmbedBuilder()
          .setTitle('📝 Log System')
          .setDescription('The log system records all important actions on the server for transparency and security.')
          .addFields(
            { 
              name: '📋 Log Types', 
              value: '• Moderation logs (bans, kicks, warns)\n• Message logs (deletion, modification)\n• Member logs (joins, leaves)\n• Role logs (assignment, removal)\n• Channel logs (creation, modification)', 
              inline: false 
            },
            { 
              name: '🔍 Transparency', 
              value: 'All actions are recorded with timestamp, responsible user, and complete details', 
              inline: false 
            },
            { 
              name: '⚙️ Configuration', 
              value: '• Choice of log channels\n• Enable/disable by type\n• Message customization\n• Access permissions', 
              inline: false 
            },
            { 
              name: '🛡️ Security', 
              value: 'Helps detect abuse and maintain server security', 
              inline: false 
            }
          )
          .setColor(0x4CAF50)
          .setFooter({ 
            text: 'Configuration: /logconfig [type] [channel] [enable/disable]', 
            iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) 
          })
          .setTimestamp();
        break;
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
}; 