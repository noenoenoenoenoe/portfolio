# L'Arche de Noé — Portfolio 3D interactif

Portfolio de Noé Escoffier-Vincent. Une arche en 3D qui navigue entre des îles, chaque île représentant un projet (SaaS, automatisations, apps mobiles, expérimentations IA).

🌐 **En ligne :** https://noenoenoenoenoe.github.io/portfolio/

## Stack

- **React 19** + **Vite 8**
- **Three.js** via `@react-three/fiber` et `@react-three/drei`
- **Tailwind CSS 4**, **GSAP**, **Zustand**, **Howler**
- Système de thèmes visuels : Pokémon / Assassin's Creed / Ghibli

## Développement

```bash
npm install
npm run dev      # serveur local
npm run build    # build de production
npm run preview  # prévisualiser le build
```

## Fonctionnalités

- **3D interactive** : une arche navigue entre les îles-projets (clic/tap sur une île → fiche détaillée).
- **Miniature générée par projet** + **galerie photos** pour le Hackathon Mirakl.
- **Avatar du Capitaine** (profil) visible en permanence dans la barre de navigation.
- **Thèmes visuels** commutables : Pokémon / Assassin's Creed / Ghibli.
- **Responsive** : jouable au doigt sur mobile (rotation 1 doigt, zoom 2 doigts).
- Liens **GitHub** et **LinkedIn** dans la barre de navigation.

### Easter eggs 🥚

- **Code Konami** (`↑ ↑ ↓ ↓ ← → ← → B A`) → pluie de confettis + message.
- **Console** : ouvre la console du navigateur pour un petit mot caché.

## Déploiement

Déploiement automatique sur GitHub Pages via `.github/workflows/deploy.yml` (Node 22) à chaque push sur `main`.
