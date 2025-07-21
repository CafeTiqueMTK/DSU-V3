const fs = require('fs');
const path = require('path');
const db = require('./db.js');

console.log('🔄 Starting data migration...');

// Create data directory if it doesn't exist
const dataPath = path.join(__dirname, 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
  console.log('📁 Created data directory');
}

const settingsPath = path.join('/data', 'settings.json');
const warnsPath = path.join('/data', 'warns.json');
const coinsPath = path.join('/data', 'coins.json');
const workPath = path.join('/data', 'work.json');
const funnymsgPath = path.join('/data', 'funnymsg.json');

// Migrate settings.json
if (fs.existsSync(settingsPath)) {
  try {
    const oldSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    
    // Convert old format to new format
    Object.keys(oldSettings).forEach(guildId => {
      const settings = oldSettings[guildId];
      db.saveSettings(guildId, settings);
      console.log(`✅ Migrated settings for guild: ${guildId}`);
    });
    
    // Backup old file
    fs.renameSync(settingsPath, 'settings.json.backup');
    console.log('💾 Backed up old settings.json');
  } catch (error) {
    console.error('❌ Error migrating settings:', error);
  }
}

// Migrate coins.json
if (fs.existsSync(coinsPath)) {
  try {
    const oldCoins = JSON.parse(fs.readFileSync(coinsPath, 'utf8'));
    
    Object.keys(oldCoins).forEach(userId => {
      const coins = oldCoins[userId];
      db.saveCoins(userId, coins);
      console.log(`✅ Migrated coins for user: ${userId}`);
    });
    
    fs.renameSync(coinsPath, 'coins.json.backup');
    console.log('💾 Backed up old coins.json');
  } catch (error) {
    console.error('❌ Error migrating coins:', error);
  }
}

// Migrate work.json
if (fs.existsSync(workPath)) {
  try {
    const oldWork = JSON.parse(fs.readFileSync(workPath, 'utf8'));
    
    Object.keys(oldWork).forEach(userId => {
      const cooldown = oldWork[userId];
      db.saveWorkCooldown(userId, cooldown);
      console.log(`✅ Migrated work cooldown for user: ${userId}`);
    });
    
    fs.renameSync(workPath, 'work.json.backup');
    console.log('💾 Backed up old work.json');
  } catch (error) {
    console.error('❌ Error migrating work data:', error);
  }
}

// Migrate warns.json
if (fs.existsSync(warnsPath)) {
  try {
    const oldWarns = JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
    
    Object.keys(oldWarns).forEach(guildId => {
      const warnings = oldWarns[guildId];
      db.saveWarnings(guildId, warnings);
      console.log(`✅ Migrated warnings for guild: ${guildId}`);
    });
    
    fs.renameSync(warnsPath, 'warns.json.backup');
    console.log('💾 Backed up old warns.json');
  } catch (error) {
    console.error('❌ Error migrating warnings:', error);
  }
}

// Create a funnymsg.json if it doesn't exist
if (!fs.existsSync(funnymsgPath)) {
  fs.writeFileSync(funnymsgPath, JSON.stringify({}, null, 2));
  console.log('📝 Created empty funnymsg.json');
}

console.log('🎉 Data migration completed!');
console.log('📁 All data is now stored in the /data directory');
console.log('💾 Old files have been backed up with .backup extension'); 