const fs = require('fs');
const path = require('path');

// Chemins des fichiers de données
const settingsPath = path.join(__dirname, '..', 'settings.json');
const warnsPath = path.join(__dirname, '..', 'warns.json');
const coinsPath = path.join(__dirname, '..', 'coins.json');
const workPath = path.join(__dirname, '..', 'work.json');

// Fonction pour charger les données d'un fichier
function loadData(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
  }
  return {};
}

// Fonction pour sauvegarder les données
function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
    return false;
  }
}

// Fonction pour initialiser les données d'une guild
function initializeGuildData(guildId, dataType = 'all') {
  const guildIdStr = guildId.toString();
  
  if (dataType === 'all' || dataType === 'settings') {
    const settings = loadData(settingsPath);
    if (!settings[guildIdStr]) {
      settings[guildIdStr] = {
        welcome: {
          enabled: false,
          channel: null
        },
        autorole: {
          enabled: false,
          roleId: null
        },
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
            arrived: false,
            farewell: false,
            vocal: false,
            mod: false,
            automod: false,
            commands: false,
            roles: false,
            soundboard: false,
            tickets: false,
            channels: false,
            economy: false,
            bulkdelete: false,
            messages: false,
            invites: false
          }
        },
        level: {
          enabled: false,
          channel: null,
          boosters: {},
          users: {},
          message: true
        },
        farewell: {
          enabled: false,
          channel: null
        },
        warnActions: {}
      };
      saveData(settingsPath, settings);
    }
  }
  
  if (dataType === 'all' || dataType === 'warns') {
    const warns = loadData(warnsPath);
    if (!warns[guildIdStr]) {
      warns[guildIdStr] = {};
      saveData(warnsPath, warns);
    }
  }
  
  if (dataType === 'all' || dataType === 'coins') {
    const coins = loadData(coinsPath);
    // Les coins sont par utilisateur, pas par guild, donc pas besoin d'initialiser
  }
  
  if (dataType === 'all' || dataType === 'work') {
    const work = loadData(workPath);
    // Les données de travail sont par utilisateur, pas par guild, donc pas besoin d'initialiser
  }
}

// Fonction pour obtenir les données d'une guild
function getGuildData(guildId, dataType = 'settings') {
  const guildIdStr = guildId.toString();
  
  // Initialiser les données si elles n'existent pas
  initializeGuildData(guildId, dataType);
  
  switch (dataType) {
    case 'settings':
      return loadData(settingsPath);
    case 'warns':
      return loadData(warnsPath);
    case 'coins':
      return loadData(coinsPath);
    case 'work':
      return loadData(workPath);
    default:
      return null;
  }
}

// Fonction pour obtenir les données d'un utilisateur
function getUserData(userId, dataType = 'coins') {
  const userIdStr = userId.toString();
  const data = loadData(dataType === 'coins' ? coinsPath : workPath);
  
  if (dataType === 'coins') {
    if (!data[userIdStr]) {
      data[userIdStr] = { coins: 0 };
      saveData(coinsPath, data);
    }
  } else if (dataType === 'work') {
    if (!data[userIdStr]) {
      data[userIdStr] = { lastWork: 0, streak: 0 };
      saveData(workPath, data);
    }
  }
  
  return data;
}

// Fonction pour sauvegarder les données d'une guild
function saveGuildData(guildId, data, dataType = 'settings') {
  const guildIdStr = guildId.toString();
  
  switch (dataType) {
    case 'settings':
      return saveData(settingsPath, data);
    case 'warns':
      return saveData(warnsPath, data);
    case 'coins':
      return saveData(coinsPath, data);
    case 'work':
      return saveData(workPath, data);
    default:
      return false;
  }
}

// Fonction pour sauvegarder les données d'un utilisateur
function saveUserData(userId, data, dataType = 'coins') {
  const userIdStr = userId.toString();
  const allData = loadData(dataType === 'coins' ? coinsPath : workPath);
  
  allData[userIdStr] = data;
  
  return saveData(dataType === 'coins' ? coinsPath : workPath, allData);
}

module.exports = {
  initializeGuildData,
  getGuildData,
  getUserData,
  saveGuildData,
  saveUserData,
  loadData,
  saveData
}; 