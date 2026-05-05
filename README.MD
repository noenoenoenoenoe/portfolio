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

## Déploiement

Déploiement automatique sur GitHub Pages via `.github/workflows/deploy.yml` (Node 22) à chaque push sur `main`.
