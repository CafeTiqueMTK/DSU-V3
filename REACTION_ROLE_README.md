# Système de Rôle Réaction - DSU Bot

Ce bot Discord propose deux systèmes de rôle réaction différents pour permettre aux utilisateurs d'obtenir des rôles facilement.

## 🎯 Système 1 : Rôles Réaction avec Boutons

### Commande : `/reactionrole`

Ce système utilise des boutons interactifs pour attribuer/retirer des rôles.

#### Sous-commandes disponibles :

- **`setup`** - Créer un nouveau message de rôle réaction
- **`list`** - Lister tous les messages de rôle réaction configurés
- **`delete`** - Supprimer un message de rôle réaction

#### Utilisation de la commande setup :

```
/reactionrole setup channel:#canal-rôles title:"Choisissez vos rôles" description:"Cliquez sur les boutons pour obtenir vos rôles" role1:@Gamer label1:"Gamer" role2:@Music label2:"Music" role3:@News label3:"News"
```

**Paramètres :**
- `channel` : Le canal où envoyer le message (obligatoire)
- `title` : Titre du message (obligatoire)
- `description` : Description du message (obligatoire)
- `role1-5` : Rôles à attribuer (au moins 1 obligatoire)
- `label1-5` : Labels des boutons correspondants (obligatoire pour chaque rôle)

**Fonctionnalités :**
- ✅ Jusqu'à 5 rôles par message
- ✅ Boutons organisés en rangées de 3 maximum
- ✅ Toggle automatique (ajoute/retire le rôle)
- ✅ Logs automatiques des actions
- ✅ Messages éphémères de confirmation

---

## 🎨 Système 2 : Rôles Réaction avec Émojis

### Commande : `/reactionrole-emoji`

Ce système utilise des réactions d'émojis classiques pour attribuer/retirer des rôles.

#### Sous-commandes disponibles :

- **`setup`** - Créer un nouveau message de rôle réaction avec émojis
- **`list`** - Lister tous les messages de rôle réaction avec émojis
- **`delete`** - Supprimer un message de rôle réaction avec émojis

#### Utilisation de la commande setup :

```
/reactionrole-emoji setup channel:#canal-rôles title:"Choisissez vos rôles" description:"Réagissez avec les émojis pour obtenir vos rôles" role1:@Gamer emoji1:"🎮" role2:@Music emoji2:"🎵" role3:@News emoji3:"📰"
```

**Paramètres :**
- `channel` : Le canal où envoyer le message (obligatoire)
- `title` : Titre du message (obligatoire)
- `description` : Description du message (obligatoire)
- `role1-5` : Rôles à attribuer (au moins 1 obligatoire)
- `emoji1-5` : Émojis correspondants (obligatoire pour chaque rôle)

**Fonctionnalités :**
- ✅ Jusqu'à 5 rôles par message
- ✅ Émojis automatiquement ajoutés au message
- ✅ Ajout/retrait automatique des rôles
- ✅ Logs automatiques des actions
- ✅ Support des émojis Unicode et personnalisés

---

## 📋 Gestion des Logs

Les deux systèmes enregistrent automatiquement les actions dans le canal de logs configuré :

- **Ajout de rôle** : 🟢 Rôle ajouté
- **Retrait de rôle** : 🔴 Rôle retiré

Les logs incluent :
- Nom et ID de l'utilisateur
- Nom et ID du rôle
- Méthode utilisée (Bouton réaction ou Réaction émoji)
- Horodatage

---

## 🔧 Configuration Requise

### Permissions du Bot :
- `ManageRoles` - Pour attribuer/retirer des rôles
- `SendMessages` - Pour envoyer les messages
- `AddReactions` - Pour le système avec émojis
- `UseExternalEmojis` - Pour les émojis personnalisés
- `ReadMessageHistory` - Pour récupérer les messages

### Permissions Utilisateur :
- `ManageRoles` - Pour utiliser les commandes de configuration

---

## 📁 Fichiers de Configuration

Le système crée automatiquement deux fichiers de configuration :

- `reaction_roles.json` - Configuration des rôles réaction avec boutons
- `reaction_roles_emoji.json` - Configuration des rôles réaction avec émojis

**Structure des fichiers :**
```json
{
  "GUILD_ID": {
    "MESSAGE_ID": {
      "channelId": "CHANNEL_ID",
      "roles": [
        {
          "id": "ROLE_ID",
          "name": "Role Name"
        }
      ],
      "labels": ["Label 1", "Label 2"],
      "emojis": ["🎮", "🎵"]
    }
  }
}
```

---

## 🚀 Exemples d'Utilisation

### Exemple 1 : Rôles de jeux
```
/reactionrole setup channel:#rôles title:"🎮 Rôles de Jeux" description:"Choisissez vos jeux préférés" role1:@Minecraft label1:"Minecraft" role2:@Fortnite label2:"Fortnite" role3:@Valorant label3:"Valorant"
```

### Exemple 2 : Rôles de notifications
```
/reactionrole-emoji setup channel:#notifications title:"🔔 Notifications" description:"Choisissez vos notifications" role1:@Annonces emoji1:"📢" role2:@Events emoji2:"🎉" role3:@Updates emoji3:"🔄"
```

---

## ⚠️ Notes Importantes

1. **Ordre des rôles** : Assurez-vous que le bot a un rôle plus élevé que les rôles qu'il doit gérer
2. **Limites Discord** : Maximum 5 rôles par message pour éviter la surcharge
3. **Émojis personnalisés** : Utilisez l'ID de l'émoji pour les émojis personnalisés du serveur
4. **Suppression** : La suppression d'un message supprime également sa configuration
5. **Permissions** : Vérifiez que le bot a les permissions nécessaires dans le canal cible

---

## 🔄 Migration et Maintenance

- Les configurations sont sauvegardées par serveur
- Les messages supprimés manuellement peuvent être nettoyés avec la commande `list` puis `delete`
- Les rôles supprimés ne causent pas d'erreur (ils sont simplement ignorés)
- Le système est compatible avec les redémarrages du bot 