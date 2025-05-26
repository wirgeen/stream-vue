
# StreamVue

**StreamVue** est un module Foundry VTT (v13) permettant de **partager et streamer en temps réel** ce que voient les joueurs, le groupe ou le MJ.  
Idéal pour le streaming en ligne ou pour projeter sur un écran sans exposer d’informations confidentielles du MJ.

---

## 🎬 Fonctionnalités

✅ **Vue joueur** : Partage l'écran d'un joueur spécifique (sa caméra, ses journaux ouverts).  
✅ **Vue groupe** : Affiche la position de tous les personnages joueurs sur la scène.  
✅ **Vue MJ** : Montre la vue du MJ **sans** les notes ni les journaux ouverts.  
✅ **Capture visuelle** de la scène en temps réel (image mise à jour toutes les secondes).  
✅ Interface HTML propre et lisible pour le rendu du flux.  
✅ **Boutons de contrôle** : Démarrer, arrêter le stream, et configurer la vue.

---

## 🚀 Installation

1. Télécharge le module :
   - [Dernière version](https://github.com/ton-github/stream-vue/releases/latest/download/stream-vue.zip)

2. Installe-le dans le dossier `modules` de Foundry VTT.  
3. Active le module dans **Configuration du monde > Modules activés**.

---

## 🎛️ Utilisation

1. Dans la scène, clique sur le bouton **StreamVue** (icône 🎥 dans la barre d’outils de la scène).  
2. Configure le mode :
   - **Vue joueur** : Sélectionne le joueur dont tu veux diffuser la vue.
   - **Vue groupe** : Affiche les tokens des PJ sur la scène.
   - **Vue MJ** : Vue du MJ, sans notes ni journaux.
3. Démarre le stream (bouton ▶️).
4. Ouvre le flux dans une fenêtre séparée qui affiche l’interface de streaming.
5. Arrête le stream avec le bouton ⏹️.

---

## 📂 Structure du projet

```
stream-vue/
├── stream-vue.js
├── styles.css
├── module.json
└── README.md
```

---

## 📝 Licence

MIT License
