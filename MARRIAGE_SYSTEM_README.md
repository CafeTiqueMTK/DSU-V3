# 💒 Marriage System

Un système de mariage complet pour Discord avec des commandes d'interaction romantique !

## 🎯 Fonctionnalités

### 💍 Commandes de Mariage
- **`/marry @user`** - Proposer le mariage à quelqu'un
- **`/divorce`** - Divorcer de son partenaire actuel
- **`/marriageinfo [@user]`** - Voir les informations de mariage
- **`/marriagestats`** - Voir les statistiques de mariage
- **`/marriagelist`** - Lister tous les mariages actifs

### 💕 Commandes d'Interaction Romantique
- **`/kiss @user`** - Embrasser quelqu'un
- **`/hug @user`** - Faire un câlin à quelqu'un
- **`/cuddle @user`** - Faire des câlins avec quelqu'un
- **`/holdhands @user`** - Tenir la main de quelqu'un

## 🚀 Comment Utiliser

### 1. Proposer le Mariage
```
/marry @utilisateur
```
- Un embed avec des boutons apparaîtra
- Seule la personne ciblée peut accepter ou refuser
- La proposition expire après 1 minute

### 2. Interactions Romantiques
```
/kiss @utilisateur
/hug @utilisateur
/cuddle @utilisateur
/holdhands @utilisateur
```
- Messages différents selon le statut marital
- Couleurs spéciales pour les couples mariés

### 3. Gestion du Mariage
```
/divorce - Divorcer (avec confirmation)
/marriageinfo - Voir son statut marital
/marriageinfo @utilisateur - Voir le statut d'un autre utilisateur
```

## 📊 Statistiques

Le système garde des statistiques détaillées :
- Nombre de mariages actifs
- Total des mariages
- Total des divorces
- Taux de réussite
- Taux de divorce

## 🎨 Fonctionnalités Spéciales

### Couleurs et Messages
- **Couleurs différentes** selon le statut marital
- **Messages aléatoires** pour chaque interaction
- **Emojis thématiques** pour une expérience immersive

### Sécurité
- **Vérifications multiples** pour éviter les erreurs
- **Gestion d'erreurs** complète
- **Messages d'erreur** informatifs

### Personnalisation
- **Messages d'annonce** pour les mariages et divorces
- **Durée de mariage** calculée automatiquement
- **Historique des divorces** conservé

## 📁 Structure des Données

Les données sont stockées dans `marriage-data.json` :
```json
{
  "marriages": {
    "user1_user2": {
      "user1": "ID_utilisateur1",
      "user2": "ID_utilisateur2",
      "proposer": "ID_proposeur",
      "date": "2024-01-01T00:00:00.000Z",
      "guild": "ID_serveur"
    }
  },
  "divorces": {
    "divorce_timestamp": {
      "user1": "ID_utilisateur1",
      "user2": "ID_utilisateur2",
      "divorceDate": "2024-01-01T00:00:00.000Z",
      "marriageDate": "2024-01-01T00:00:00.000Z",
      "guild": "ID_serveur"
    }
  },
  "stats": {
    "total_marriages": 0,
    "total_divorces": 0
  }
}
```

## 🔧 Installation

1. Assurez-vous que tous les fichiers de commandes sont dans le dossier `commands/`
2. Le fichier `marriage-data.json` sera créé automatiquement
3. Redémarrez votre bot pour charger les nouvelles commandes

## 💡 Conseils d'Utilisation

- **Encouragez l'utilisation** des commandes d'interaction pour créer de l'ambiance
- **Surveillez les statistiques** pour voir l'engagement de votre communauté
- **Personnalisez les messages** selon votre serveur si nécessaire

## 🎉 Amusez-vous bien !

Ce système de mariage est conçu pour être amusant et engageant. Profitez de l'expérience romantique ! 💕
