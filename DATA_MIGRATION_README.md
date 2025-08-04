# Migration des données vers le dossier `/data`

Ce document explique comment migrer toutes les données du bot vers le dossier `/data` pour utiliser le volume persistant Railway.

## 🎯 Objectif

Toutes les commandes du bot utilisent maintenant le dossier `/data` pour stocker leurs données, ce qui permet :
- **Persistance des données** : Les données ne sont pas perdues lors des redémarrages
- **Volume Railway** : Utilisation du volume persistant Railway pour le stockage
- **Centralisation** : Tous les fichiers de données sont dans un seul dossier

## 📁 Fichiers migrés

Les fichiers suivants sont maintenant stockés dans `/data` :

- `settings.json` - Configuration générale du bot
- `warns.json` - Système d'avertissements
- `coins.json` - Système d'économie
- `work.json` - Système de travail
- `tickets.json` - Système de tickets
- `reaction_roles.json` - Rôles réaction
- `reaction_roles_emoji.json` - Rôles réaction avec émojis
- `updates.json` - Notifications de mises à jour
- `automod_actions.json` - Actions Automod
- `funnymsg.json` - Messages amusants
- `presets.json` - Presets de configuration
- `config.json` - Configuration du bot

## 🚀 Migration automatique

### Pour Railway

1. **Déployer le bot** : Le script de migration s'exécute automatiquement
2. **Vérifier les logs** : Les données sont migrées vers `/data`
3. **Volume persistant** : Les données sont maintenant persistantes

### Pour le développement local

```bash
# Exécuter la migration manuellement
npm run migrate-data

# Ou exécuter toute la configuration Railway
npm run setup-railway
```

## 🔧 Commandes modifiées

Toutes les commandes suivantes utilisent maintenant `/data` :

### Commandes de modération
- `/mod` - Système de modération
- `/warnconfig` - Configuration des avertissements
- `/muteconfig` - Configuration des mutes

### Commandes de configuration
- `/logconfig` - Configuration des logs
- `/farewell` - Messages de départ
- `/dashboard` - Tableau de bord
- `/setmoderator` - Définir les modérateurs

### Commandes de systèmes
- `/ticket` - Système de tickets
- `/reactionrole` - Rôles réaction
- `/reactionrole-emoji` - Rôles réaction avec émojis
- `/update` - Notifications de mises à jour

### Commandes d'économie
- `/work` - Système de travail
- `/rps` - Pierre-papier-ciseaux
- `/mycoins` - Voir ses coins

### Commandes d'utilitaires
- `/userinfo` - Informations utilisateur
- `/reloadcommand` - Recharger les commandes
- `/botreset` - Reset du bot

## 📋 Vérification

Après la migration, vérifiez que :

1. **Le dossier `/data` existe** et contient tous les fichiers
2. **Les commandes fonctionnent** normalement
3. **Les données sont persistantes** après redémarrage

## 🔍 Dépannage

### Problème : Dossier `/data` non accessible
```bash
# Créer le dossier manuellement
mkdir -p /data
chmod 755 /data
```

### Problème : Permissions insuffisantes
```bash
# Vérifier les permissions
ls -la /data
```

### Problème : Fichiers manquants
```bash
# Recréer les fichiers vides
echo '{}' > /data/settings.json
echo '{}' > /data/warns.json
# ... etc pour chaque fichier
```

## 📝 Notes importantes

- **Backup** : Faites une sauvegarde avant la migration
- **Test** : Testez en environnement de développement d'abord
- **Logs** : Surveillez les logs pour détecter les erreurs
- **Permissions** : Assurez-vous que le bot a les permissions d'écriture

## 🎉 Avantages

✅ **Persistance** : Les données survivent aux redémarrages  
✅ **Performance** : Accès direct aux fichiers  
✅ **Simplicité** : Structure centralisée  
✅ **Railway** : Compatible avec les volumes persistants  
✅ **Sécurité** : Isolation des données  

---

*Migration créée pour optimiser le stockage des données sur Railway* 