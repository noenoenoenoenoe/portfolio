// Islands scattered in an organic S-shaped / archipelago layout
// Min ~14 units between centers to avoid overlap (island ~5 + dock ~5 + margin)

export const islands = [
  {
    id: 'hackathon-payfit',
    name: 'Hackathon PayFit',
    description: 'Hackathon PayFit — conception et developpement d\'une solution lors de cet evenement.',
    techStack: ['JavaScript', 'React'],
    github: 'https://github.com/noenoenoenoenoe',
    demo: null,
    position: [-18, 0, -14],
    dockAngle: 1.2,
    color: '#5b9bd5',
    skills: ['javascript', 'teamwork'],
    scale: 0.8,
  },
  {
    id: 'scrapping-interpol',
    name: 'Scrapers Interpol',
    description:
      "Pipeline Python pour collecter l'intégralité des notices publiques d'Interpol — " +
      "notices rouges (personnes recherchées pour arrestation) et jaunes (personnes disparues). " +
      "Le défi : l'API d'Interpol limite la pagination, donc impossible d'aspirer tout en un coup. " +
      "La parade : une stratégie diviser-pour-régner qui segmente les recherches par pays, sexe " +
      "et tranche d'âge jusqu'à passer sous le seuil de pagination, garantissant une couverture " +
      "100%. Le scraper des notices rouges utilise un ThreadPoolExecutor pour traiter des " +
      "milliers de notices en parallèle ; celui des jaunes intègre une phase d'auto-vérification " +
      "et de rattrapage pour combler les manques. Enrichissement automatique : calcul de l'âge, " +
      "normalisation des codes pays, classification des infractions. Sortie CSV prête pour analyse. " +
      "Projet de groupe avec Hisseiny.",
    techStack: ['Python', 'Requests', 'Multi-threading', 'API Scraping', 'CSV'],
    github: 'https://github.com/Hisseiny/groupe_1_interpol_github',
    demo: null,
    position: [-3, 0, -8],
    dockAngle: -0.5,
    color: '#e8a87c',
    skills: ['python', 'scraping'],
    scale: 1.0,
  },
  {
    id: 'hackathon-dust',
    name: 'Hackathon Dust',
    description: 'Hackathon Dust — developpement d\'une solution innovante autour de l\'IA.',
    techStack: ['Python', 'AI'],
    github: 'https://github.com/noenoenoenoenoe',
    demo: null,
    position: [14, 0, -16],
    dockAngle: 2.8,
    color: '#b5a8d0',
    skills: ['python', 'ai'],
    scale: 0.75,
  },
  {
    id: '1nf-platform',
    name: '1NF — Business OS for Creators',
    description:
      "Plateforme SaaS qui transforme les influenceurs en \"CEOs souverains\" : un seul " +
      "tableau de bord pour piloter toute la partie business d'un creator — pipeline de deals, " +
      "analyse de contrats, relance d'impayés, droits d'usage, fiscalité. Le creator type " +
      "juggle tout ça dans des spreadsheets et des emails ; 1NF centralise et automatise. " +
      "Features clés : pipeline Kanban des deals, parsing de contrat avec détection IA des " +
      "clauses pièges (red flags), \"Ghosting Insurance\" pour automatiser les relances de " +
      "factures impayées, alertes d'expiration des droits d'usage, calculateur fiscal avec " +
      "déductions, et un \"Nego-Engine\" qui propose des contre-propositions IA. Une couche " +
      "\"Agency Tower\" permet aux agences de piloter plusieurs creators à la fois. " +
      "Architecture sérieuse : 3-layer rule (client → api → server), pattern Gatekeeper sur " +
      "toutes les Server Actions, Zod firewall obligatoire sur les outputs LLM avant qu'ils " +
      "touchent la DB, contrat universel Result<T>. Mais le vrai twist : tout le projet est " +
      "coordonné par un système d'agents Claude (PM, CTO, Full-stack, Security, QA, Design, " +
      "Marketing), chacun avec sa skill et son scope, orchestrés par un PM agent qui gère les " +
      "releases versionnées. Un studio dirigé par un PM IA. Pre-launch, roadmap jusqu'au beta " +
      "privé avec 10 creators réels. Projet en duo avec Hisseiny.",
    techStack: ['React 18', 'TypeScript', 'Tailwind', 'shadcn/ui', 'Framer Motion', 'Next.js 14 (target)', 'Supabase (target)', 'Multi-Agent IA'],
    github: null,
    demo: null,
    confidential: true,
    confidentialLabel: '🔒 Pre-launch — accès sur demande',
    position: [5, 0, 12],
    dockAngle: -1.0,
    color: '#d4c07a',
    skills: ['javascript', 'ai', 'teamwork'],
    scale: 1.5,
  },
  {
    id: 'levelo-marseille',
    name: 'Le Velo Marseille — Tracker',
    description:
      "Tracker temps réel du système Le Vélo à Marseille. Toutes les 10 minutes, un workflow " +
      "GitHub Actions se déclenche, interroge l'API GBFS du réseau (norme open-data vélos " +
      "partagés), et collecte le statut des stations : vélos disponibles, places libres, taux " +
      "d'occupation. Les données sont historisées dans Supabase (PostgreSQL) — une table de " +
      "métadonnées pour les infos statiques (nom, adresse, capacité, zone Nord/Centre/Sud), et " +
      "une table d'observations pour l'historique dynamique. Le script calcule aussi un statut " +
      "d'affichage par station (critical/warning/good/excellent) selon le taux de remplissage. " +
      "Export JSON en parallèle pour alimenter un dashboard externe. Stack 100% serverless : " +
      "aucune machine à maintenir, GitHub Actions + Supabase font tout le boulot. Projet de groupe " +
      "avec Hisseiny.",
    techStack: ['Python', 'GBFS API', 'Supabase', 'GitHub Actions', 'PostgreSQL'],
    github: 'https://github.com/Hisseiny/levelo-marseille-tracker',
    demo: null,
    position: [-22, 0, 4],
    dockAngle: 1.5,
    color: '#c5d96c',
    skills: ['python', 'automation'],
    scale: 0.9,
  },
  {
    id: 'la-dalle',
    name: 'LA DALLE — Bons plans food étudiants',
    description:
      "Application mobile React Native (Expo) sur le concept \"Mange comme un roi, paye comme " +
      "un rat\" : une plateforme de bons plans food pour étudiants. L'app combine une carte " +
      "interactive des restaurants partenaires, un feed d'offres en cours, un scanner QR pour " +
      "valider une visite (qui crédite le profil utilisateur), et un système de favoris. " +
      "Stack mobile-first : React Native + Expo Router pour la navigation par onglets, Supabase " +
      "pour la base de données et l'authentification (avec un schéma PostgreSQL riche en " +
      "fonctions PL/pgSQL), react-native-maps pour la carte interactive. Design system brutalist " +
      "assumé : orange vif (#FF6B00), noir, blanc, bordures épaisses, zéro fioriture. Comme pour " +
      "mes autres projets, le développement est cadré par des règles Cursor (.cursor/rules/) qui " +
      "briefent l'IA sur la structure de l'app, le schéma SQL et le design system — vibe coding " +
      "assisté mais avec garde-fous. Projet d'école présenté en jury, v1.0.0 livrée en " +
      "février 2026.",
    techStack: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'PostgreSQL', 'PL/pgSQL', 'Cursor Rules', 'Vibe Coding'],
    github: 'https://github.com/noenoenoenoenoe/la_dalle_v1',
    demo: null,
    position: [20, 0, 20],
    dockAngle: -1.5,
    color: '#ff6b00',
    skills: ['javascript', 'mobile', 'teamwork'],
    scale: 1.1,
  },
  {
    id: 'troov-automation',
    name: 'Automatisations Troov',
    description:
      "Suite de scripts JavaScript pour automatiser le paramétrage du back-office Troov. " +
      "Le problème : configurer un nouveau compte client demande de saisir manuellement des " +
      "dizaines d'éléments (services, guichets, horaires, jours fériés) dans un dashboard — " +
      "environ 30 minutes pour 20 éléments. La solution : un workflow en 3 étapes — diagnostic " +
      "du DOM pour identifier les sélecteurs du formulaire, génération d'un script adapté, puis " +
      "bulk insert depuis la console du navigateur. Le truc malin : un dossier de règles Cursor " +
      "(.mdc) qui briefe l'IA sur la structure de Troov, permettant de générer de nouveaux scripts " +
      "à la demande sans réexpliquer le contexte à chaque fois — l'outil s'agrandit en parlant à " +
      "une IA. Utilisé pour tous les nouveaux clients onboardés depuis janvier 2026, et actuellement " +
      "transmis à une collègue. Migration en cours vers n8n pour transformer cette suite en " +
      "workflow déclenchable, sans plus avoir à passer par la console.",
    techStack: ['JavaScript', 'DOM Scraping', 'Cursor Rules', 'n8n', 'Vibe Coding'],
    github: null,
    demo: null,
    confidential: true,
    position: [-12, 0, 16],
    dockAngle: 0.6,
    color: '#7eb8c9',
    skills: ['javascript', 'automation', 'ai'],
    scale: 1.0,
  },
]

// Exclusion radius around each island (island body + dock + safety margin)
export const ISLAND_RADIUS = 6

// Data rendered by InfoPanel when the user clicks on the Ark itself
export const captainData = {
  id: 'captain',
  name: 'Le Capitaine',
  description:
    "Bienvenue à bord. Moi c'est Noé, 26 ans, basé à Marseille — et " +
    "assez fier de l'être.\n\n" +
    "Après un Master en droit du numérique, j'avais envie de mettre les " +
    "mains dans le cambouis plutôt que dans le code civil ou la loi de " +
    "1881. Du coup j'enchaîne avec un 2e Master \"Data for Business\" en " +
    "alternance : école à Paris le mercredi, boulot à Marseille le reste " +
    "du temps.\n\n" +
    "Mon entreprise me laisse bidouiller, tester, proposer des trucs. " +
    "Les Automatisations Troov en sont l'exemple le plus abouti — j'ai " +
    "eu carte blanche pour attaquer ce qui me semblait absurdement " +
    "manuel, et j'en ai fait une suite d'outils utilisée au quotidien " +
    "par l'équipe.\n\n" +
    "Ce que j'aime : prendre un problème chiant, le décomposer, et en " +
    "sortir avec une solution qui fait gagner du temps à tout le monde.\n\n" +
    "L'automatisation, c'est de la flemme bien organisée.",
  techStack: ['26 ans', 'Master Droit numérique', 'Master Data for Business (en cours)', 'Alternant', 'Marseille ↔ Paris', 'Bidouilleur'],
  github: 'https://github.com/noenoenoenoenoe',
  demo: 'https://www.linkedin.com/in/escoffiervincentnoe/',
  demoLabel: 'LinkedIn',
  color: '#f0d8a0',
  skills: ['javascript', 'automation', 'ai', 'teamwork'],
}

export const skills = [
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'mobile', name: 'Mobile', icon: '📱' },
  { id: 'ai', name: 'IA', icon: '🤖' },
  { id: 'scraping', name: 'Scraping', icon: '🕷️' },
  { id: 'automation', name: 'Automation', icon: '⚙️' },
  { id: 'teamwork', name: 'Teamwork', icon: '🤝' },
]
