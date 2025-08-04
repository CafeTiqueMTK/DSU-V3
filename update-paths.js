const fs = require('fs');
const path = require('path');

console.log('🔄 Mise à jour des chemins pour Railway...');

// Fonction pour mettre à jour un fichier
function updateFilePaths(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Patterns à remplacer
    const patterns = [
      // Remplacer les chemins locaux par des chemins centralisés
      {
        from: /path\.join\(__dirname, '\.\.', '([^']+)\.json'\)/g,
        to: (match, fileName) => {
          updated = true;
          return `(process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT ? path.join('/data', '${fileName}.json') : path.join(__dirname, '..', '${fileName}.json'))`;
        }
      },
      {
        from: /path\.join\(__dirname, '\.\.', '([^']+)\.json'\)/g,
        to: (match, fileName) => {
          updated = true;
          return `(process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT ? path.join('/data', '${fileName}.json') : path.join(__dirname, '..', '${fileName}.json'))`;
        }
      },
      // Remplacer les chemins directs
      {
        from: /path\.join\(__dirname, '\.\.', '([^']+)\.json'\)/g,
        to: (match, fileName) => {
          updated = true;
          return `(process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT ? path.join('/data', '${fileName}.json') : path.join(__dirname, '..', '${fileName}.json'))`;
        }
      }
    ];

    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.from, pattern.to);
      if (newContent !== content) {
        content = newContent;
        updated = true;
      }
    });

    // Ajouter la logique de chemin centralisé si nécessaire
    if (updated && !content.includes('isProduction')) {
      const isProductionCheck = `
    // Utiliser le chemin de données centralisé
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
    const dataPath = isProduction ? '/data' : path.join(__dirname, '..');`;
      
      // Insérer après les imports
      content = content.replace(
        /(const.*require.*\n)/,
        `$1${isProductionCheck}\n`
      );
    }

    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Mis à jour: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
  }
}

// Mettre à jour les fichiers principaux
const mainFiles = [
  'index.js',
  'db.js',
  'config.js'
];

mainFiles.forEach(file => {
  if (fs.existsSync(file)) {
    updateFilePaths(file);
  }
});

// Mettre à jour les commandes
const commandsDir = path.join(__dirname, 'commands');
if (fs.existsSync(commandsDir)) {
  const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
  
  commandFiles.forEach(file => {
    updateFilePaths(path.join(commandsDir, file));
  });
}

console.log('🎉 Mise à jour des chemins terminée !');
console.log('📝 Tous les fichiers utilisent maintenant le système de chemins centralisé pour Railway'); 