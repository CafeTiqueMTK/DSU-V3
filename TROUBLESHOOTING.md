# 🔧 Guide de Dépannage - Système de Mariage

## ❌ Erreur SIGTERM / npm error

Si vous rencontrez l'erreur `npm error signal SIGTERM`, voici les solutions :

### 1. Vérifier les Variables d'Environnement

Assurez-vous que votre fichier `.env` contient toutes les variables nécessaires :

```env
DISCORD_TOKEN=votre_token_discord
CLIENT_ID=votre_client_id
GUILD_ID=votre_guild_id
```

### 2. Tester le Démarrage

Utilisez le script de test pour diagnostiquer les problèmes :

```bash
node test-startup.js
```

### 3. Utiliser le Script de Démarrage Simplifié

Si le fichier `index.js` principal pose problème, utilisez le script simplifié :

```bash
node start-bot.js
```

### 4. Vérifier les Dépendances

Assurez-vous que toutes les dépendances sont installées :

```bash
npm install discord.js dotenv
```

### 5. Vérifier les Permissions du Bot

Le bot doit avoir les permissions suivantes :
- `Send Messages`
- `Use Slash Commands`
- `Embed Links`
- `Attach Files`
- `Read Message History`

### 6. Vérifier la Structure des Fichiers

Assurez-vous que tous les fichiers sont présents :
```
DSU-V3/
├── commands/
│   ├── marry.js
│   ├── divorce.js
│   ├── marriageinfo.js
│   ├── marriagestats.js
│   ├── marriagelist.js
│   ├── marrysys.js
│   ├── kiss.js
│   ├── hug.js
│   ├── cuddle.js
│   └── holdhands.js
├── marriage-data.json
├── .env
├── package.json
├── index.js
├── start-bot.js
└── test-startup.js
```

## 🚀 Solutions Rapides

### Solution 1 : Redémarrer avec le Script Simplifié
```bash
node start-bot.js
```

### Solution 2 : Vérifier les Logs
```bash
node test-startup.js
```

### Solution 3 : Réinstaller les Dépendances
```bash
rm -rf node_modules package-lock.json
npm install
```

### Solution 4 : Vérifier le Token Discord
- Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
- Vérifiez que votre bot token est correct
- Assurez-vous que le bot est invité sur votre serveur

## 📋 Checklist de Diagnostic

- [ ] Fichier `.env` existe et contient les bonnes variables
- [ ] Token Discord est valide
- [ ] Bot est invité sur le serveur
- [ ] Bot a les bonnes permissions
- [ ] Tous les fichiers de commandes sont présents
- [ ] Dépendances sont installées
- [ ] Node.js version 16+ est installé

## 🔍 Logs d'Erreur Courants

### "Missing required environment variables"
- Vérifiez votre fichier `.env`
- Assurez-vous qu'il n'y a pas d'espaces autour des `=`

### "Commands directory not found"
- Vérifiez que le dossier `commands/` existe
- Assurez-vous que tous les fichiers `.js` sont présents

### "Failed to load command file"
- Vérifiez la syntaxe du fichier de commande
- Assurez-vous que `module.exports` est correct

### "Discord client error"
- Vérifiez votre token Discord
- Assurez-vous que le bot est en ligne sur le portail développeur

## 💡 Conseils Supplémentaires

1. **Utilisez le script de test** avant de démarrer le bot principal
2. **Vérifiez les logs** pour identifier les problèmes spécifiques
3. **Testez une commande à la fois** si plusieurs commandes posent problème
4. **Sauvegardez vos données** avant de faire des modifications

## 🆘 Support

Si les problèmes persistent :
1. Exécutez `node test-startup.js` et partagez les logs
2. Vérifiez que tous les fichiers sont présents
3. Testez avec le script simplifié `start-bot.js`
