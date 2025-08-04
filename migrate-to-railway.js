const fs = require('fs');
const path = require('path');

console.log('🚂 Migration Railway - Déplacement des données vers /data');

// Créer le dossier /data s'il n'existe pas
const dataPath = '/data';
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
  console.log('✅ Dossier /data créé');
}

// Liste des fichiers à migrer
const filesToMigrate = [
  'settings.json',
  'coins.json', 
  'work.json',
  'funnymsg.json',
  'warns.json',
  'reaction_roles.json',
  'reaction_roles_emoji.json',
  'tickets.json',
  'automod_actions.json',
  'presets.json'
];

// Créer le dossier backup
const backupPath = path.join(dataPath, 'backup');
if (!fs.existsSync(backupPath)) {
  fs.mkdirSync(backupPath, { recursive: true });
  console.log('✅ Dossier backup créé');
}

// Timestamp pour la sauvegarde
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(backupPath, timestamp);
fs.mkdirSync(backupDir, { recursive: true });

console.log(`📦 Sauvegarde créée: ${backupDir}`);

// Migrer chaque fichier
filesToMigrate.forEach(fileName => {
  const sourcePath = path.join(__dirname, fileName);
  const targetPath = path.join(dataPath, fileName);
  const backupFilePath = path.join(backupDir, fileName);

  try {
    // Si le fichier source existe
    if (fs.existsSync(sourcePath)) {
      // Créer une sauvegarde
      fs.copyFileSync(sourcePath, backupFilePath);
      console.log(`💾 Sauvegarde: ${fileName}`);

      // Déplacer vers /data
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Migré: ${fileName} -> /data/${fileName}`);

      // Supprimer l'ancien fichier
      fs.unlinkSync(sourcePath);
      console.log(`🗑️ Supprimé: ${fileName} (ancien emplacement)`);
    } else if (fs.existsSync(targetPath)) {
      // Le fichier est déjà dans /data
      console.log(`ℹ️ Déjà présent: ${fileName} dans /data`);
    } else {
      // Créer un fichier vide
      fs.writeFileSync(targetPath, '{}');
      console.log(`📝 Créé: ${fileName} vide dans /data`);
    }
  } catch (error) {
    console.error(`❌ Erreur avec ${fileName}:`, error.message);
  }
});

// Créer un fichier de configuration pour Railway
const railwayConfig = {
  migrated: true,
  timestamp: timestamp,
  dataPath: dataPath,
  files: filesToMigrate
};

fs.writeFileSync(path.join(dataPath, 'railway-config.json'), JSON.stringify(railwayConfig, null, 2));
console.log('✅ Configuration Railway créée');

console.log('\n🎉 Migration terminée !');
console.log('📁 Toutes les données sont maintenant dans /data');
console.log('💾 Sauvegarde disponible dans /data/backup/' + timestamp);
console.log('\n🚀 Votre bot est maintenant prêt pour Railway !'); 