# Système de Tickets - DSU Bot

Un système de tickets complet et moderne pour gérer le support utilisateur sur votre serveur Discord.

## 🎯 Fonctionnalités Principales

### ✅ **Système Complet**
- Formulaire de création personnalisable
- Embeds de bienvenue automatiques
- Rôle support pingable
- Boutons de fermeture
- Logs automatiques
- Transcriptions de tickets

### ✅ **Interface Moderne**
- Boutons interactifs
- Modales de formulaire
- Embeds personnalisés
- Messages éphémères

### ✅ **Gestion Avancée**
- Limite d'un ticket par utilisateur
- Permissions automatiques
- Catégorie dédiée
- Système de priorité

---

## 🚀 Configuration Initiale

### **Étape 1 : Configuration de base**
```
/ticket setup channel:#support support_role:@Support tickets_category:"Tickets" title:"🎫 Système de Support" description:"Cliquez sur le bouton ci-dessous pour créer un ticket de support." button_text:"Créer un ticket"
```

**Paramètres :**
- `channel` : Canal où afficher le message de création
- `support_role` : Rôle qui sera mentionné dans les tickets
- `tickets_category` : Catégorie où créer les tickets
- `title` : Titre du message de création
- `description` : Description du message
- `button_text` : Texte du bouton (optionnel)

### **Étape 2 : Personnalisation (optionnel)**
```
/ticket config setting:welcome_message value:"Bienvenue dans votre ticket ! Notre équipe vous répondra dans les plus brefs délais."
/ticket config setting:ticket_prefix value:"support"
```

---

## 📋 Commandes Disponibles

### **Configuration**
- **`/ticket setup`** - Configuration initiale du système
- **`/ticket config`** - Modifier les paramètres

### **Gestion**
- **`/ticket list`** - Lister tous les tickets ouverts
- **`/ticket close`** - Fermer un ticket spécifique
- **`/ticket transcript`** - Générer une transcription

---

## 🎫 Processus de Création de Ticket

### **1. Clic sur le bouton**
L'utilisateur clique sur le bouton "Créer un ticket" dans le canal configuré.

### **2. Formulaire automatique**
Un formulaire s'ouvre avec les champs :
- **Raison** : Type de problème (Bug, Question, Suggestion...)
- **Description** : Explication détaillée
- **Priorité** : Faible, Moyenne, Haute, Critique (optionnel)

### **3. Création du canal**
Le bot crée automatiquement :
- Un nouveau canal dans la catégorie configurée
- Les permissions appropriées
- Un embed de bienvenue avec les informations

### **4. Notification du support**
Le rôle support est mentionné avec les détails du ticket.

---

## 🔧 Configuration Avancée

### **Paramètres modifiables :**
- `support_role` : Rôle du support
- `tickets_category` : Catégorie des tickets
- `welcome_message` : Message de bienvenue
- `ticket_prefix` : Préfixe des tickets (ex: "support-1234567890")

### **Permissions automatiques :**
- **@everyone** : Accès refusé
- **Utilisateur** : Voir, envoyer des messages, lire l'historique
- **Rôle Support** : Voir, envoyer, lire, gérer les messages

---

## 📊 Système de Logs

### **Logs automatiques :**
- **Création de ticket** : 🟢 Nouveau ticket créé
- **Fermeture de ticket** : 🔴 Ticket fermé

### **Informations enregistrées :**
- ID du ticket
- Utilisateur créateur
- Raison et priorité
- Canal créé
- Horodatage
- Modérateur qui ferme (si applicable)

---

## 📄 Transcriptions

### **Génération de transcription :**
```
/ticket transcript ticket_id:support-1234567890
```

**Contenu de la transcription :**
- Informations du ticket
- Messages chronologiques
- Horodatages
- Fichier texte téléchargeable

---

## 🎨 Personnalisation des Embeds

### **Message de création :**
- Titre et description personnalisables
- Couleur verte (0x00ff99)
- Bouton avec émoji 🎫

### **Embed de bienvenue :**
- Titre avec ID du ticket
- Message de bienvenue configurable
- Informations utilisateur
- Raison et priorité
- Description détaillée
- Avatar de l'utilisateur

### **Embed de fermeture :**
- Titre "Ticket fermé"
- Nom du modérateur
- Couleur rouge (0xff5555)

---

## ⚙️ Configuration Requise

### **Permissions du Bot :**
- `ManageChannels` - Créer/supprimer les canaux
- `ManageRoles` - Gérer les permissions
- `SendMessages` - Envoyer les messages
- `UseExternalEmojis` - Utiliser les émojis
- `ReadMessageHistory` - Lire l'historique pour les transcriptions

### **Permissions Utilisateur :**
- `ManageGuild` - Configurer le système
- `ManageChannels` - Fermer les tickets

### **Structure du serveur :**
- **Catégorie dédiée** pour les tickets
- **Rôle support** avec permissions appropriées
- **Canal de logs** configuré (optionnel)

---

## 🔄 Workflow Typique

### **Pour l'utilisateur :**
1. Clique sur "Créer un ticket"
2. Remplit le formulaire
3. Reçoit confirmation
4. Peut communiquer dans le ticket
5. Le ticket se ferme automatiquement

### **Pour le support :**
1. Reçoit notification de nouveau ticket
2. Peut voir tous les détails
3. Répond dans le canal dédié
4. Peut fermer le ticket quand résolu

### **Pour l'administration :**
1. Configure le système une fois
2. Surveille les logs
3. Gère les tickets si nécessaire
4. Génère des transcriptions si besoin

---

## 🚨 Sécurité et Limitations

### **Protections :**
- **Un seul ticket par utilisateur** à la fois
- **Permissions restreintes** par défaut
- **Vérifications** avant création
- **Logs complets** de toutes les actions

### **Limitations Discord :**
- Maximum 500 canaux par serveur
- Permissions hiérarchiques respectées
- Rate limits de l'API Discord

---

## 📁 Fichiers de Configuration

### **`tickets.json`**
```json
{
  "GUILD_ID": {
    "setup": true,
    "setupChannel": "CHANNEL_ID",
    "setupMessage": "MESSAGE_ID",
    "supportRole": "ROLE_ID",
    "ticketsCategory": "CATEGORY_ID",
    "welcomeMessage": "Message de bienvenue",
    "ticketPrefix": "support",
    "activeTickets": {
      "support-1234567890": {
        "channelId": "CHANNEL_ID",
        "userId": "USER_ID",
        "reason": "Bug",
        "description": "Description...",
        "priority": "Haute",
        "createdAt": 1234567890
      }
    }
  }
}
```

---

## 🔧 Dépannage

### **Problèmes courants :**

**❌ "Système de tickets non configuré"**
- Vérifiez que `/ticket setup` a été exécuté
- Vérifiez le fichier `tickets.json`

**❌ "Catégorie des tickets introuvable"**
- Vérifiez que la catégorie existe
- Vérifiez les permissions du bot

**❌ "Erreur lors de la création du ticket"**
- Vérifiez les permissions du bot
- Vérifiez la hiérarchie des rôles

**❌ "Vous avez déjà un ticket ouvert"**
- Fermez le ticket existant
- Ou supprimez le canal manuellement

---

## 🎯 Exemples d'Utilisation

### **Support technique :**
```
/ticket setup channel:#support support_role:@Tech tickets_category:"Support" title:"🛠️ Support Technique" description:"Besoin d'aide ? Créez un ticket !"
```

### **Signalements :**
```
/ticket setup channel:#reports support_role:@Moderators tickets_category:"Signalements" title:"🚨 Signalements" description:"Signalez un problème ou un utilisateur"
```

### **Suggestions :**
```
/ticket setup channel:#suggestions support_role:@Staff tickets_category:"Suggestions" title:"💡 Suggestions" description:"Proposez vos idées d'amélioration"
```

Le système est maintenant prêt à gérer efficacement le support utilisateur sur votre serveur ! 🎉 