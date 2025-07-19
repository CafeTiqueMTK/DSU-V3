const fs = require('fs');
const path = require('path');

// Check if we're in production (Railway) or development
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

class Database {
  constructor() {
    this.dataPath = path.join(__dirname, 'data');
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  // Settings management
  getSettings(guildId) {
    const filePath = path.join(this.dataPath, 'settings.json');
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return data[guildId] || this.getDefaultSettings();
      }
    } catch (error) {
      console.error('Error reading settings:', error);
    }
    return this.getDefaultSettings();
  }

  saveSettings(guildId, settings) {
    const filePath = path.join(this.dataPath, 'settings.json');
    try {
      let data = {};
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      data[guildId] = settings;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  // Economy management
  getCoins(userId) {
    const filePath = path.join(this.dataPath, 'coins.json');
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return data[userId] || 0;
      }
    } catch (error) {
      console.error('Error reading coins:', error);
    }
    return 0;
  }

  saveCoins(userId, amount) {
    const filePath = path.join(this.dataPath, 'coins.json');
    try {
      let data = {};
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      data[userId] = amount;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving coins:', error);
      return false;
    }
  }

  // Work cooldowns management
  getWorkCooldown(userId) {
    const filePath = path.join(this.dataPath, 'work.json');
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return data[userId] || null;
      }
    } catch (error) {
      console.error('Error reading work cooldown:', error);
    }
    return null;
  }

  saveWorkCooldown(userId, timestamp) {
    const filePath = path.join(this.dataPath, 'work.json');
    try {
      let data = {};
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      data[userId] = timestamp;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving work cooldown:', error);
      return false;
    }
  }

  // Funny messages management
  getFunnyMessages(guildId) {
    const filePath = path.join(this.dataPath, 'funnymsg.json');
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return data[guildId] || this.getDefaultFunnyMessages();
      }
    } catch (error) {
      console.error('Error reading funny messages:', error);
    }
    return this.getDefaultFunnyMessages();
  }

  saveFunnyMessages(guildId, config) {
    const filePath = path.join(this.dataPath, 'funnymsg.json');
    try {
      let data = {};
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      data[guildId] = config;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving funny messages:', error);
      return false;
    }
  }

  // Warnings management
  getWarnings(guildId) {
    const filePath = path.join(this.dataPath, 'warns.json');
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return data[guildId] || {};
      }
    } catch (error) {
      console.error('Error reading warnings:', error);
    }
    return {};
  }

  saveWarnings(guildId, warnings) {
    const filePath = path.join(this.dataPath, 'warns.json');
    try {
      let data = {};
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      data[guildId] = warnings;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving warnings:', error);
      return false;
    }
  }

  // Default settings
  getDefaultSettings() {
    return {
      automod: {
        enabled: false,
        actionChannel: null,
        categories: {
          badWords: { enabled: false },
          discordLink: { enabled: false },
          ghostPing: { enabled: false },
          spam: { enabled: false }
        }
      },
      logs: {
        enabled: false,
        channel: null,
        categories: {
          arrived: true,
          farewell: true,
          vocal: true,
          mod: true,
          automod: true,
          commands: true,
          roles: true,
          soundboard: true,
          tickets: true,
          channels: true,
          economy: true,
          bulkdelete: true,
          messages: true,
          invites: true
        }
      },
      level: {
        enabled: false,
        channel: null,
        boosters: {},
        users: {},
        message: true
      },
      autorole: {
        enabled: false,
        roleId: null
      },
      farewell: {
        enabled: false,
        channel: null
      }
    };
  }

  // Default funny messages
  getDefaultFunnyMessages() {
    return {
      enabled: false,
      cooldown: 30000,
      triggers: {
        eat: {
          phrases: ['i am hungry', 'i want to eat', 'food time'],
          responses: ['🍕 Here\'s some pizza!', '🍔 Have a burger!', '🍜 Enjoy your meal!']
        },
        sleep: {
          phrases: ['i am tired', 'i want to sleep', 'bed time'],
          responses: ['😴 Sweet dreams!', '🛏️ Good night!', '💤 Sleep well!']
        },
        game: {
          phrases: ['i want to play', 'game time', 'let\'s play'],
          responses: ['🎮 Let\'s play together!', '🎯 Game on!', '🕹️ Have fun gaming!']
        },
        work: {
          phrases: ['i need to work', 'work time', 'busy with work'],
          responses: ['💼 Good luck with work!', '📊 Stay productive!', '🏢 Work hard!']
        }
      }
    };
  }

  // Backup all data
  backupData() {
    const backupPath = path.join(this.dataPath, 'backup');
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    const files = ['settings.json', 'coins.json', 'work.json', 'funnymsg.json', 'warns.json'];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    files.forEach(file => {
      const sourcePath = path.join(this.dataPath, file);
      if (fs.existsSync(sourcePath)) {
        const backupFile = path.join(backupPath, `${file}.${timestamp}`);
        fs.copyFileSync(sourcePath, backupFile);
      }
    });

    console.log(`Backup created at: ${backupPath}`);
  }

  // Restore data from backup
  restoreData(timestamp) {
    const backupPath = path.join(this.dataPath, 'backup');
    const files = ['settings.json', 'coins.json', 'work.json', 'funnymsg.json', 'warns.json'];

    files.forEach(file => {
      const backupFile = path.join(backupPath, `${file}.${timestamp}`);
      const targetFile = path.join(this.dataPath, file);
      
      if (fs.existsSync(backupFile)) {
        fs.copyFileSync(backupFile, targetFile);
        console.log(`Restored: ${file}`);
      }
    });
  }
}

module.exports = new Database();
