# 🚂 Guide de Déploiement Railway - Données Persistantes

## 🎯 Problème Résolu
Ce guide résout le problème de **perte de données** sur Railway en utilisant des volumes persistants et un système de chemins centralisé.

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

# Environment
NODE_ENV=production
RAILWAY_ENVIRONMENT=production

# GitHub (optionnel)
GITHUB_TOKEN=votre_token_github
```

### 2. Volume Persistant (OBLIGATOIRE)
1. Dans votre projet Railway, allez dans "Settings"
2. Cliquez sur "Volumes"
3. Créez un nouveau volume :
   - **Name**: `bot-data`
   - **Path**: `/data`
   - **Size**: 1GB

## 🚀 Déploiement Automatique

### Option 1 : Script Automatique (Recommandé)
```bash
# Exécutez le script de configuration Railway
npm run setup-railway
```

Ce script va :
- ✅ Mettre à jour tous les chemins de fichiers
- ✅ Migrer les données vers `/data`
- ✅ Créer des sauvegardes
- ✅ Configurer la persistance

### Option 2 : Déploiement Manuel
```bash
# 1. Mettre à jour les chemins
npm run update-paths

# 2. Migrer les données
npm run migrate

# 3. Committer et pousser
git add .
git commit -m "Configure Railway persistence"
git push
```

## 📁 Structure des Données

Après migration, vos données seront stockées dans :
```
/data/
├── settings.json           # Configuration des serveurs
├── coins.json             # Économie des utilisateurs
├── work.json              # Cooldowns de travail
├── funnymsg.json          # Messages drôles
├── warns.json             # Avertissements
├── reaction_roles.json    # Rôles réaction
├── reaction_roles_emoji.json # Rôles réaction avec émojis
├── tickets.json           # Système de tickets
├── automod_actions.json   # Actions d'automodération
├── presets.json           # Presets
├── railway-config.json    # Configuration Railway
└── backup/                # Sauvegardes automatiques
    └── [timestamp]/
```

## 🔄 Système de Chemins Centralisé

Le bot utilise maintenant un système de chemins intelligent :
- **En développement** : `./data/` (local)
- **En production** : `/data/` (Railway volume)

```javascript
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
const dataPath = isProduction ? '/data' : path.join(__dirname, '..');
```

## 🛡️ Sauvegarde Automatique

Le système crée automatiquement des sauvegardes dans `/data/backup/` avec des timestamps.

## 🔍 Vérification du Déploiement

### 1. Vérifier la Connexion
```bash
# Dans les logs Railway
✅ Bot connecté à Discord
✅ Données chargées depuis /data
```

### 2. Tester la Persistance
1. Configurez un rôle réaction
2. Redémarrez le bot sur Railway
3. Vérifiez que la configuration persiste

### 3. Vérifier les Variables
```bash
# Dans Railway > Variables
NODE_ENV=production ✅
RAILWAY_ENVIRONMENT=production ✅
```

## 🆘 Dépannage

### Problème : Données toujours perdues
```bash
# 1. Vérifiez le volume
# Railway > Settings > Volumes
# Le volume doit être monté sur /data

# 2. Vérifiez les variables d'environnement
NODE_ENV=production
RAILWAY_ENVIRONMENT=production

# 3. Restaurez depuis une sauvegarde
node -e "require('./db.js').restoreData('timestamp')"
```

### Problème : Volume non monté
1. Allez dans Railway > Settings > Volumes
2. Vérifiez que le volume est créé et monté sur `/data`
3. Redémarrez le service

### Problème : Chemins incorrects
```bash
# Re-exécutez la mise à jour des chemins
npm run update-paths
```

## 📊 Monitoring

### Logs à Surveiller
```
✅ Dossier /data créé
✅ Données migrées vers /data
✅ Configuration Railway créée
✅ Bot connecté avec persistance
```

### Commandes Utiles
```bash
# Vérifier l'état des données
npm run migrate

# Mettre à jour les chemins
npm run update-paths

# Redéployer les commandes
npm run deploy
```

## 🎉 Résultat Final

Après ce déploiement :
- ✅ **Données persistantes** entre les redémarrages
- ✅ **Sauvegardes automatiques** créées
- ✅ **Système de chemins centralisé** fonctionnel
- ✅ **Configuration Railway** optimisée

Votre bot conserve maintenant toutes ses données même après les redémarrages Railway ! 