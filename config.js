// utils/config.js
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '..', 'settings.json');

// Initialise le fichier s'il n'existe pas
function ensureSettingsFile() {
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, '{}');
  }
}

// Lit les paramètres d’un serveur
function getGuildSettings(guildId) {
  ensureSettingsFile();
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  if (!settings[guildId]) {
    settings[guildId] = {
      level: {
        enabled: false,
        message: true,
        channel: null,
        boosters: {},
        users: {}
      }
    };
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }
  return settings[guildId];
}

// Modifie les paramètres d’un serveur
function updateGuildSettings(guildId, data) {
  ensureSettingsFile();
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  settings[guildId] = {
    ...settings[guildId],
    ...data
  };
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

// Sauvegarde directe complète
function writeAllSettings(newSettings) {
  fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
}

// Accès brut (à éviter sauf cas rare)
function getAllSettings() {
  ensureSettingsFile();
  return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
}

module.exports = {
  getGuildSettings,
  updateGuildSettings,
  getAllSettings,
  writeAllSettings,
};
