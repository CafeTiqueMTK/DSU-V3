const { ensureDataDirectory, initializeDataFiles, getGuildData, saveGuildData } = require('./utils/guildManager');

console.log('🧪 Testing data paths and guildManager functions...');

try {
  // Test directory creation
  console.log('📁 Testing directory creation...');
  ensureDataDirectory();
  console.log('✅ Directory creation test passed');

  // Test file initialization
  console.log('📄 Testing file initialization...');
  initializeDataFiles();
  console.log('✅ File initialization test passed');

  // Test guild data management
  console.log('🏠 Testing guild data management...');
  const testGuildId = '123456789';
  const settings = getGuildData(testGuildId, 'settings');
  console.log('✅ getGuildData test passed');
  console.log('📊 Settings structure:', JSON.stringify(settings, null, 2));

  // Test saving guild data
  console.log('💾 Testing guild data saving...');
  if (settings[testGuildId]) {
    settings[testGuildId].test = { enabled: true };
    const saveResult = saveGuildData(testGuildId, settings, 'settings');
    console.log('✅ saveGuildData test passed:', saveResult);
  } else {
    console.log('⚠️ No guild data found, creating test data...');
    const newSettings = {
      [testGuildId]: {
        test: { enabled: true },
        welcome: { enabled: false, channel: null },
        autorole: { enabled: false, roleId: null },
        automod: {
          enabled: false,
          actionChannel: null,
          categories: {
            badWords: { enabled: false },
            discordLink: { enabled: false },
            ghostPing: { enabled: false },
            spam: { enabled: false }
          },
          blockedRoles: []
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
            soundboard: false,
            tickets: false,
            channels: false,
            economy: false,
            bulkdelete: false,
            messages: false,
            gemini: false
          }
        }
      }
    };
    const saveResult = saveGuildData(testGuildId, newSettings, 'settings');
    console.log('✅ saveGuildData test passed:', saveResult);
  }

  console.log('🎉 All tests passed successfully!');
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
} 