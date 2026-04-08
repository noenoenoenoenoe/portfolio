// 6 islands in a circle, radius 14, docks facing center
const R = 14
const circlePos = (i, total) => {
  const angle = (i / total) * Math.PI * 2
  return [R * Math.sin(angle), 0, R * Math.cos(angle)]
}

export const islands = [
  {
    id: 'hackathon-payfit',
    name: 'Hackathon PayFit',
    description: 'Hackathon PayFit — conception et developpement d\'une solution lors de cet evenement.',
    techStack: ['JavaScript', 'React'],
    github: 'https://github.com/noenoenoenoenoe',
    demo: null,
    position: circlePos(0, 6),
    color: '#5b9bd5',
    skills: ['javascript', 'teamwork'],
  },
  {
    id: 'scrapping-interpol',
    name: 'Scrapping Interpol',
    description: 'Scrapping des donnees d\'Interpol en Python. Extraction et analyse de donnees publiques.',
    techStack: ['Python', 'BeautifulSoup', 'Requests'],
    github: 'https://github.com/noenoenoenoenoe',
    demo: null,
    position: circlePos(1, 6),
    color: '#e8a87c',
    skills: ['python', 'scraping'],
  },
  {
    id: 'hackathon-dust',
    name: 'Hackathon Dust',
    description: 'Hackathon Dust — developpement d\'une solution innovante autour de l\'IA.',
    techStack: ['Python', 'AI'],
    github: 'https://github.com/noenoenoenoenoe',
    demo: null,
    position: circlePos(2, 6),
    color: '#b5a8d0',
    skills: ['python', 'ai'],
  },
  {
    id: 'rag-epstein',
    name: 'RAG Epstein',
    description: 'RAG et chatbot sur l\'affaire Epstein. Retrieval-Augmented Generation pour explorer et interroger les documents de l\'affaire.',
    techStack: ['Python', 'LangChain', 'RAG'],
    github: 'https://github.com/noenoenoenoenoe',
    demo: null,
    position: circlePos(3, 6),
    color: '#85c7a2',
    skills: ['python', 'ai', 'rag'],
  },
  {
    id: '1nf-secret',
    name: '1NF Secret Project',
    description: 'Projet secret 1NF. Details a venir...',
    techStack: ['???'],
    github: null,
    demo: null,
    position: circlePos(4, 6),
    color: '#d4c07a',
    skills: ['secret'],
  },
  {
    id: 'troov-automation',
    name: 'Automatisations Troov',
    description: 'Automatisation des prises de rendez-vous pour Troov. Scripts et workflows automatises.',
    techStack: ['JavaScript', 'Automation'],
    github: 'https://github.com/noenoenoenoenoe',
    demo: null,
    position: circlePos(5, 6),
    color: '#7eb8c9',
    skills: ['javascript', 'automation'],
  },
]

export const skills = [
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'ai', name: 'IA', icon: '🤖' },
  { id: 'rag', name: 'RAG', icon: '📚' },
  { id: 'scraping', name: 'Scraping', icon: '🕷️' },
  { id: 'automation', name: 'Automation', icon: '⚙️' },
  { id: 'teamwork', name: 'Teamwork', icon: '🤝' },
  { id: 'secret', name: '???', icon: '🔒' },
]
