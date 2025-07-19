# 🚂 Railway Deployment Guide

## 📋 Prérequis
- Compte Railway
- Bot Discord configuré
- Repository GitHub

## 🔧 Configuration Railway

### 1. Variables d'environnement
Dans Railway, ajoutez ces variables d'environnement :

```env
# Discord Bot
DISCORD_TOKEN=votre_token_discord
CLIENT_ID=votre_client_id
GUILD_ID=votre_guild_id

# GitHub (optionnel)
GITHUB_TOKEN=votre_token_github

# Environment
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
```

### 2. Volumes persistants (Recommandé)
Railway offre des volumes persistants pour stocker les données :

1. Dans votre projet Railway, allez dans "Settings"
2. Cliquez sur "Volumes"
3. Créez un nouveau volume :
   - **Name**: `bot-data`
   - **Path**: `/app/data`
   - **Size**: 1GB (suffisant pour un bot)

### 3. Configuration du volume
Ajoutez cette variable d'environnement :
```env
DATA_PATH=/app/data
```

## 📁 Structure des données

Après migration, vos données seront stockées dans :
```
/data/
├── settings.json      # Configuration des serveurs
├── coins.json         # Économie des utilisateurs
├── work.json          # Cooldowns de travail
├── funnymsg.json      # Messages drôles
├── warns.json         # Avertissements
└── backup/            # Sauvegardes automatiques
```

## 🚀 Déploiement

### 1. Première fois
```bash
# Clonez votre repo
git clone votre-repo

# Installez les dépendances
npm install

# Migrez les données existantes
node migrate-data.js

# Committez les changements
git add .
git commit -m "Add Railway support"
git push
```

### 2. Mises à jour
```bash
# Faites vos modifications
git add .
git commit -m "Update bot"
git push
```

Railway redéploiera automatiquement !

## 🔄 Migration des données existantes

Si vous avez déjà des données, exécutez :
```bash
node migrate-data.js
```

Cela va :
- ✅ Créer le dossier `/data`
- ✅ Migrer tous vos fichiers JSON
- ✅ Créer des sauvegardes
- ✅ Préserver toutes vos configurations

## 🛡️ Sauvegarde automatique

Le bot crée automatiquement des sauvegardes dans `/data/backup/` avec des timestamps.

## 🔍 Vérification

Après déploiement, vérifiez que :
1. Le bot se connecte correctement
2. Les commandes fonctionnent
3. Les données persistent entre les redémarrages

## 🆘 Dépannage

### Problème : Données perdues
```bash
# Restaurez depuis une sauvegarde
node -e "require('./db.js').restoreData('timestamp')"
```

### Problème : Variables d'environnement
- Vérifiez que toutes les variables sont définies dans Railway
- Redémarrez le service après modification

### Problème : Volume non monté
- Vérifiez que le volume est correctement configuré
- Le chemin doit être `/app/data`

## 📞 Support

Si vous avez des problèmes :
1. Vérifiez les logs Railway
2. Testez en local d'abord
3. Vérifiez la configuration des variables d'environnement 