const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play Rock, Paper, Scissors with another member for 100 coins!')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('The member you want to challenge')
        .setRequired(true)),

  async execute(interaction) {
    try {
      const challenger = interaction.user;
      const opponent = interaction.options.getUser('opponent');

      // Check if challenging self
      if (challenger.id === opponent.id) {
        await interaction.reply({
          content: '❌ You cannot challenge yourself!',
          ephemeral: true
        });
        return;
      }

      // Check if opponent is a bot
      if (opponent.bot) {
        await interaction.reply({
          content: '❌ You cannot challenge a bot!',
          ephemeral: true
        });
        return;
      }

      // Load coins data
      const coinsPath = path.join(__dirname, '..', 'coins.json');
      let coinsData = {};
      if (fs.existsSync(coinsPath)) {
        coinsData = JSON.parse(fs.readFileSync(coinsPath, 'utf-8'));
      }

      // Initialize coins for users if they don't exist
      if (!coinsData[challenger.id]) coinsData[challenger.id] = { coins: 0 };
      if (!coinsData[opponent.id]) coinsData[opponent.id] = { coins: 0 };

      // No coin requirement to play - only winner gets coins

      // Create challenge embed
      const challengeEmbed = new EmbedBuilder()
        .setTitle('🎮 Rock, Paper, Scissors Challenge!')
        .setDescription(`${challenger} challenges ${opponent} to a game of Rock, Paper, Scissors!\n\n**Prize:** 100 coins for the winner\n**No entry fee required!**`)
        .addFields(
          { name: '💰 Current Coins', value: `${challenger}: **${coinsData[challenger.id].coins}** coins\n${opponent}: **${coinsData[opponent.id].coins}** coins`, inline: true },
          { name: '⏰ Time Limit', value: '60 seconds to accept', inline: true }
        )
        .setColor(0x00ff99)
        .setTimestamp();

          // Create accept/decline buttons with better styling
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`rps_accept_${challenger.id}_${opponent.id}`)
          .setLabel('✅ Accept Challenge')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId(`rps_decline_${challenger.id}_${opponent.id}`)
          .setLabel('❌ Decline Challenge')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌')
      );

    // Create info buttons row
    const infoButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('rps_prize_info')
          .setLabel('🏆 Prize: 100 coins')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('rps_free_info')
          .setLabel('🎮 Free to play!')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('rps_time_info')
          .setLabel('⏰ 60s to accept')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

      const challengeMessage = await interaction.reply({
        embeds: [challengeEmbed],
        components: [buttons, infoButtons],
        fetchReply: true
      });

      // Create collector for button interactions
      const filter = i => {
        return (i.customId === `rps_accept_${challenger.id}_${opponent.id}` || 
                i.customId === `rps_decline_${challenger.id}_${opponent.id}`) &&
               i.user.id === opponent.id;
      };

      const collector = challengeMessage.createMessageComponentCollector({
        filter,
        time: 60000 // 60 seconds
      });

      collector.on('collect', async (i) => {
        if (i.customId === `rps_decline_${challenger.id}_${opponent.id}`) {
          const declineEmbed = new EmbedBuilder()
            .setTitle('❌ Challenge Declined')
            .setDescription(`${opponent} declined the challenge.`)
            .setColor(0xff5555)
            .setTimestamp();

          await i.update({
            embeds: [declineEmbed],
            components: []
          });
          return;
        }

        if (i.customId === `rps_accept_${challenger.id}_${opponent.id}`) {
          // Start the game
          await startGame(i, challenger, opponent, coinsData, coinsPath);
        }
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          const timeoutEmbed = new EmbedBuilder()
            .setTitle('⏰ Challenge Expired')
            .setDescription(`${opponent} didn't respond in time.`)
            .setColor(0xffa500)
            .setTimestamp();

          await interaction.editReply({
            embeds: [timeoutEmbed],
            components: []
          });
        }
      });

    } catch (error) {
      console.error('Error in RPS command:', error);
      await interaction.reply({
        content: '❌ An error occurred while creating the challenge.',
        ephemeral: true
      });
    }
  },
};

async function startGame(interaction, challenger, opponent, coinsData, coinsPath) {
  try {
    // No coins deducted - winner will get 100 coins

    // Create game embed
    const gameEmbed = new EmbedBuilder()
      .setTitle('🎮 Rock, Paper, Scissors - Game Started!')
      .setDescription(`**${challenger}** vs **${opponent}**\n\nBoth players, choose your move!\n\n**Rules:**\n🪨 Rock beats ✂️ Scissors\n📄 Paper beats 🪨 Rock\n✂️ Scissors beats 📄 Paper`)
      .addFields(
        { name: '🏆 Prize', value: '100 coins', inline: true },
        { name: '⏰ Time', value: '30 seconds', inline: true },
        { name: '🎯 Status', value: 'Waiting for choices...', inline: true }
      )
      .setColor(0x00ff99)
      .setTimestamp();

    // Create RPS buttons with better styling
    const rpsButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`rps_rock_${challenger.id}_${opponent.id}`)
          .setLabel('🪨 Rock')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🪨'),
        new ButtonBuilder()
          .setCustomId(`rps_paper_${challenger.id}_${opponent.id}`)
          .setLabel('📄 Paper')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📄'),
        new ButtonBuilder()
          .setCustomId(`rps_scissors_${challenger.id}_${opponent.id}`)
          .setLabel('✂️ Scissors')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('✂️')
      );

    // Create info row
    const infoRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('rps_rules')
          .setLabel('📖 Rules')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('rps_prize')
          .setLabel(`🏆 Prize: 100 coins`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('rps_time')
          .setLabel('⏰ 30s')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

    await interaction.update({
      embeds: [gameEmbed],
      components: [rpsButtons, infoRow]
    });

    // Store game state
    const gameState = {
      challenger: { id: challenger.id, choice: null },
      opponent: { id: opponent.id, choice: null },
      coinsData,
      coinsPath
    };

    // Create collectors for both players
    const challengerFilter = i => {
      return (i.customId === `rps_rock_${challenger.id}_${opponent.id}` ||
              i.customId === `rps_paper_${challenger.id}_${opponent.id}` ||
              i.customId === `rps_scissors_${challenger.id}_${opponent.id}`) &&
             i.user.id === challenger.id;
    };

    const opponentFilter = i => {
      return (i.customId === `rps_rock_${challenger.id}_${opponent.id}` ||
              i.customId === `rps_paper_${challenger.id}_${opponent.id}` ||
              i.customId === `rps_scissors_${challenger.id}_${opponent.id}`) &&
             i.user.id === opponent.id;
    };

    const challengerCollector = interaction.message.createMessageComponentCollector({
      filter: challengerFilter,
      time: 30000
    });

    const opponentCollector = interaction.message.createMessageComponentCollector({
      filter: opponentFilter,
      time: 30000
    });

    challengerCollector.on('collect', async (i) => {
      const choice = i.customId.split('_')[1];
      gameState.challenger.choice = choice;
      
      // Update button to show choice
      const updatedButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`rps_rock_${challenger.id}_${opponent.id}`)
            .setLabel('🪨 Rock')
            .setStyle(choice === 'rock' ? ButtonStyle.Success : ButtonStyle.Secondary)
            .setEmoji('🪨')
            .setDisabled(choice === 'rock'),
          new ButtonBuilder()
            .setCustomId(`rps_paper_${challenger.id}_${opponent.id}`)
            .setLabel('📄 Paper')
            .setStyle(choice === 'paper' ? ButtonStyle.Success : ButtonStyle.Secondary)
            .setEmoji('📄')
            .setDisabled(choice === 'paper'),
          new ButtonBuilder()
            .setCustomId(`rps_scissors_${challenger.id}_${opponent.id}`)
            .setLabel('✂️ Scissors')
            .setStyle(choice === 'scissors' ? ButtonStyle.Success : ButtonStyle.Secondary)
            .setEmoji('✂️')
            .setDisabled(choice === 'scissors')
        );

      await i.update({
        components: [updatedButtons, infoRow]
      });
      
      await i.followUp({ content: '✅ Your choice has been recorded! Waiting for opponent...', ephemeral: true });
      
      if (gameState.opponent.choice) {
        await determineWinner(interaction, challenger, opponent, gameState);
      }
    });

    opponentCollector.on('collect', async (i) => {
      const choice = i.customId.split('_')[1];
      gameState.opponent.choice = choice;
      
      // Update button to show choice
      const updatedButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`rps_rock_${challenger.id}_${opponent.id}`)
            .setLabel('🪨 Rock')
            .setStyle(choice === 'rock' ? ButtonStyle.Success : ButtonStyle.Secondary)
            .setEmoji('🪨')
            .setDisabled(choice === 'rock'),
          new ButtonBuilder()
            .setCustomId(`rps_paper_${challenger.id}_${opponent.id}`)
            .setLabel('📄 Paper')
            .setStyle(choice === 'paper' ? ButtonStyle.Success : ButtonStyle.Secondary)
            .setEmoji('📄')
            .setDisabled(choice === 'paper'),
          new ButtonBuilder()
            .setCustomId(`rps_scissors_${challenger.id}_${opponent.id}`)
            .setLabel('✂️ Scissors')
            .setStyle(choice === 'scissors' ? ButtonStyle.Success : ButtonStyle.Secondary)
            .setEmoji('✂️')
            .setDisabled(choice === 'scissors')
        );

      await i.update({
        components: [updatedButtons, infoRow]
      });
      
      await i.followUp({ content: '✅ Your choice has been recorded! Waiting for opponent...', ephemeral: true });
      
      if (gameState.challenger.choice) {
        await determineWinner(interaction, challenger, opponent, gameState);
      }
    });

    // Handle timeouts
    challengerCollector.on('end', async (collected) => {
      if (collected.size === 0) {
        await handleTimeout(interaction, challenger, opponent, gameState, 'challenger');
      }
    });

    opponentCollector.on('end', async (collected) => {
      if (collected.size === 0) {
        await handleTimeout(interaction, challenger, opponent, gameState, 'opponent');
      }
    });

  } catch (error) {
    console.error('Error starting RPS game:', error);
  }
}

async function determineWinner(interaction, challenger, opponent, gameState) {
  try {
    const challengerChoice = gameState.challenger.choice;
    const opponentChoice = gameState.opponent.choice;

    // Determine winner
    let winner = null;
    let result = '';

    if (challengerChoice === opponentChoice) {
      result = 'tie';
    } else if (
      (challengerChoice === 'rock' && opponentChoice === 'scissors') ||
      (challengerChoice === 'paper' && opponentChoice === 'rock') ||
      (challengerChoice === 'scissors' && opponentChoice === 'paper')
    ) {
      winner = challenger;
      result = 'challenger';
    } else {
      winner = opponent;
      result = 'opponent';
    }

    // Update coins
    if (result === 'tie') {
      // No coins given in case of tie
    } else {
      // Winner gets 100 coins
      gameState.coinsData[winner.id].coins += 100;
    }

    fs.writeFileSync(gameState.coinsPath, JSON.stringify(gameState.coinsData, null, 2));

    // Create result embed
    const resultEmbed = new EmbedBuilder()
      .setTitle('🎮 Rock, Paper, Scissors - Game Result!')
      .setColor(result === 'tie' ? 0xffa500 : 0x00ff99)
      .setTimestamp();

    if (result === 'tie') {
      resultEmbed
        .setDescription(`**It's a tie!**\n\n${challenger}: ${getEmoji(challengerChoice)} ${challengerChoice.toUpperCase()}\n${opponent}: ${getEmoji(opponentChoice)} ${opponentChoice.toUpperCase()}\n\n🤝 No coins awarded for a tie!`)
        .addFields(
          { name: '💰 Current Balances', value: `${challenger}: **${gameState.coinsData[challenger.id].coins}** coins\n${opponent}: **${gameState.coinsData[opponent.id].coins}** coins`, inline: true }
        );
    } else {
      const loser = winner.id === challenger.id ? opponent : challenger;
      resultEmbed
        .setDescription(`**${winner} wins!** 🎉\n\n${challenger}: ${getEmoji(challengerChoice)} ${challengerChoice.toUpperCase()}\n${opponent}: ${getEmoji(opponentChoice)} ${opponentChoice.toUpperCase()}\n\n💰 ${winner} wins 100 coins!`)
        .addFields(
          { name: '💰 New Balances', value: `${winner}: **${gameState.coinsData[winner.id].coins}** coins\n${loser}: **${gameState.coinsData[loser.id].coins}** coins`, inline: true }
        );
    }

    await interaction.editReply({
      embeds: [resultEmbed],
      components: []
    });

  } catch (error) {
    console.error('Error determining winner:', error);
  }
}

async function handleTimeout(interaction, challenger, opponent, gameState, timeoutPlayer) {
  try {
    // No coins to return since no entry fee was paid
    const timeoutEmbed = new EmbedBuilder()
      .setTitle('⏰ Game Timeout')
      .setDescription(`${timeoutPlayer === 'challenger' ? challenger : opponent} didn't make a choice in time.\n\n⏰ Game cancelled due to timeout!`)
      .setColor(0xffa500)
      .setTimestamp();

    await interaction.editReply({
      embeds: [timeoutEmbed],
      components: []
    });

  } catch (error) {
    console.error('Error handling timeout:', error);
  }
}

function getEmoji(choice) {
  switch (choice) {
    case 'rock': return '🪨';
    case 'paper': return '📄';
    case 'scissors': return '✂️';
    default: return '❓';
  }
} 