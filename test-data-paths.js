const fs = require('fs');
const path = require('path');

console.log('🔍 Testing data paths in commands...\n');

// Liste des commandes à vérifier
const commandsToCheck = [
  'askgemini.js',
  'botreset.js',
  'dashboard.js',
  'farewell.js',
  'funnymsg.js',
  'log.js',
  'logconfig.js',
  'mod.js',
  'muteconfig.js',
  'reactionrole-emoji.js',
  'reactionrole.js',
  'reloadcommand.js',
  'rps.js',
  'setmoderator.js',
  'ticket.js',
  'unban.js',
  'update.js',
  'userinfo.js',
  'warnconfig.js',
  'work.js'
];

let allGood = true;

commandsToCheck.forEach(commandFile => {
  const filePath = path.join(__dirname, 'commands', commandFile);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${commandFile} - File not found`);
    allGood = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Vérifier les patterns problématiques
  const problematicPatterns = [
    /path\.join\(__dirname, '\.\.',/g,
    /path\.join\(__dirname, '\.\.\/'/g,
    /'\.\/settings\.json'/g,
    /'\.\/warns\.json'/g,
    /'\.\/tickets\.json'/g,
    /'\.\/coins\.json'/g,
    /'\.\/work\.json'/g,
    /'\.\/reaction_roles\.json'/g,
    /'\.\/updates\.json'/g,
    /'\.\/config\.json'/g
  ];
  
  let hasIssues = false;
  
  problematicPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      console.log(`⚠️  ${commandFile} - Still using local paths`);
      hasIssues = true;
      allGood = false;
    }
  });
  
  // Vérifier les patterns corrects
  const correctPatterns = [
    /path\.join\('\/data',/g,
    /'\/data\/settings\.json'/g,
    /'\/data\/warns\.json'/g,
    /'\/data\/tickets\.json'/g,
    /'\/data\/coins\.json'/g,
    /'\/data\/work\.json'/g,
    /'\/data\/reaction_roles\.json'/g,
    /'\/data\/updates\.json'/g,
    /'\/data\/config\.json'/g
  ];
  
  let hasCorrectPaths = false;
  correctPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      hasCorrectPaths = true;
    }
  });
  
  if (hasCorrectPaths && !hasIssues) {
    console.log(`✅ ${commandFile} - Using /data paths correctly`);
  } else if (!hasIssues && !hasCorrectPaths) {
    console.log(`ℹ️  ${commandFile} - No data files used`);
  }
});

console.log('\n📋 Summary:');
if (allGood) {
  console.log('🎉 All commands are using /data paths correctly!');
} else {
  console.log('❌ Some commands still need to be updated.');
}

console.log('\n📁 Checking /data directory...');
const dataDir = '/data';
if (fs.existsSync(dataDir)) {
  const files = fs.readdirSync(dataDir);
  console.log(`✅ /data directory exists with ${files.length} files:`);
  files.forEach(file => {
    const stats = fs.statSync(path.join(dataDir, file));
    console.log(`   📄 ${file} (${stats.size} bytes)`);
  });
} else {
  console.log('❌ /data directory does not exist');
}

console.log('\n🚀 Ready for Railway deployment!'); 