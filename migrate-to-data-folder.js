const fs = require('fs');
const path = require('path');

// Créer le dossier /data s'il n'existe pas
const dataDir = '/data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created /data directory');
}

// Liste des fichiers à migrer
const filesToMigrate = [
  'settings.json',
  'warns.json',
  'coins.json',
  'work.json',
  'tickets.json',
  'reaction_roles.json',
  'reaction_roles_emoji.json',
  'updates.json',
  'automod_actions.json',
  'funnymsg.json',
  'presets.json'
];

console.log('🔄 Starting migration to /data folder...');

// Migrer chaque fichier
filesToMigrate.forEach(filename => {
  const sourcePath = path.join(__dirname, filename);
  const targetPath = path.join(dataDir, filename);
  
  if (fs.existsSync(sourcePath)) {
    try {
      // Lire le contenu du fichier source
      const content = fs.readFileSync(sourcePath, 'utf-8');
      
      // Écrire dans le dossier /data
      fs.writeFileSync(targetPath, content);
      
      console.log(`✅ Migrated ${filename} to /data`);
      
      // Optionnel : supprimer le fichier source après migration
      // fs.unlinkSync(sourcePath);
      // console.log(`🗑️ Removed original ${filename}`);
      
    } catch (error) {
      console.error(`❌ Error migrating ${filename}:`, error.message);
    }
  } else {
    // Créer un fichier vide dans /data s'il n'existe pas
    try {
      fs.writeFileSync(targetPath, '{}');
      console.log(`📄 Created empty ${filename} in /data`);
    } catch (error) {
      console.error(`❌ Error creating ${filename}:`, error.message);
    }
  }
});

console.log('✅ Migration completed!');
console.log('📁 All data files are now in /data folder');
console.log('🚀 Ready for Railway persistent volume'); 