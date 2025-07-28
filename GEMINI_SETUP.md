# 🤖 Gemini AI Setup Guide

## 📋 **Prérequis**

1. **Compte Google** avec accès à Google AI Studio
2. **Clé API Gemini** générée depuis Google AI Studio

## 🔑 **Obtenir une clé API Gemini**

### **Étapes :**

1. **Aller sur Google AI Studio**
   - Visitez : https://makersuite.google.com/app/apikey

2. **Créer une nouvelle clé API**
   - Cliquez sur "Create API Key"
   - Copiez la clé générée

3. **Configurer la clé**
   - **Local** : Ajoutez `GEMINI_API_KEY=votre_clé_ici` dans votre fichier `.env`
   - **Railway** : Ajoutez la variable d'environnement `GEMINI_API_KEY` dans votre projet Railway

## ⚙️ **Configuration**

### **Variables d'environnement :**

```env
# Obligatoire pour Discord
DISCORD_TOKEN=votre_token_discord
CLIENT_ID=votre_client_id
GUILD_ID=votre_guild_id

# Optionnel pour Gemini AI
GEMINI_API_KEY=votre_clé_gemini
```

### **Configuration locale :**

Si vous utilisez `config.json` en local, ajoutez :

```json
{
  "token": "votre_token_discord",
  "clientId": "votre_client_id", 
  "guildId": "votre_guild_id",
  "geminiApiKey": "votre_clé_gemini"
}
```

## 🚀 **Utilisation**

### **Commande :**
```
/askgemini question:votre_question_ici
```

### **Exemples :**
- `/askgemini question:Qu'est-ce que l'intelligence artificielle ?`
- `/askgemini question:Explique-moi le JavaScript en 3 points`
- `/askgemini question:Comment créer un bot Discord ?`

## 🔧 **Fonctionnalités**

- ✅ **Questions en français** et autres langues
- ✅ **Réponses détaillées** avec embeds Discord
- ✅ **Gestion d'erreurs** robuste
- ✅ **Limitation de caractères** (4000 max)
- ✅ **Logs de performance** dans la console

## ⚠️ **Notes importantes**

1. **Limites API** : Respectez les limites de l'API Gemini
2. **Coûts** : L'API Gemini peut avoir des coûts selon l'utilisation
3. **Sécurité** : Ne partagez jamais votre clé API
4. **Performance** : Les réponses peuvent prendre 2-5 secondes

## 🛠️ **Dépannage**

### **Erreur "Gemini API Not Configured"**
- Vérifiez que `GEMINI_API_KEY` est définie
- Redémarrez le bot après avoir ajouté la variable

### **Erreur "Failed to get response"**
- Vérifiez votre clé API
- Vérifiez votre connexion internet
- Consultez les logs du bot pour plus de détails

## 📚 **Ressources**

- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Documentation Gemini API](https://ai.google.dev/docs)
- [Limites et quotas](https://ai.google.dev/pricing) 