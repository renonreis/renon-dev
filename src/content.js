// Every word on the page. Mirrors CONTENT.md (the source of truth): update both together.

export const DISCLAIMER = 'Fan-made GTA VI-style portfolio. Not affiliated with Rockstar Games.'

export const LINKS = {
  top: '#top',
  hireMe: 'mailto:hello@renon.dev',
  email: 'mailto:hello@renon.dev',
  linkedin: 'https://www.linkedin.com/in/renonreis',
  github: 'https://github.com/renonreis',
  triquetra: 'https://triquetra.renon.dev',
  zeroDawn: 'https://github.com/renonreis/project-zero-dawn',
  resume: '#',
  privacy: '#',
  buildYourOwn: '#',
  meetTheDeveloper: '#',
  rideAlong: '#',
  projects: ['#', '#', '#'],
  servicesIncluded: '#',
  startProject: 'mailto:hello@renon.dev',
  afterHours: '#',
  caseStudy: '#',
  aboutMe: '#',
  clients: '#',
  review: '#',
  blog: '#',
  posts: ['#', '#', '#'],
}

export const PAGE = {
  title: 'Grand Theft Developer · Renon Reis, Senior Software Engineer & Tech Lead',
  description: `Portfolio of Renon Reis, a senior software engineer and tech lead in Curitiba, Brazil. ${DISCLAIMER}`,
  logoAlt: 'Grand Theft Developer',
}

export const NAVBAR = {
  monogramLabel: 'GTD, back to top',
  menuLabel: 'Menu',
  hireMe: 'Hire Me',
}

export const HERO = {
  tagline: ['Senior Engineer & Tech Lead', 'Curitiba, Brazil · Remote'],
  button: 'Hire Me',
  tags: ['TypeScript', 'React', 'Node.js'],
  disclaimer: DISCLAIMER,
}

export const MEET_THE_DEVELOPER = {
  scene: { eyebrow: 'Watch', title: 'Meet the Developer', play: 'Play' },
  featured: { eyebrow: 'Watch', title: 'Ride Along', button: 'Play' },
  // Sample work: titles are painted into the art.
  projects: [
    { eyebrow: 'AI', title: 'AI Book Assistant', sample: true },
    { eyebrow: '3D Web', title: '3D Basketball Website', sample: true },
    { eyebrow: 'Mobile', title: 'React Native Language App', sample: true },
  ],
}

export const SERVICES = {
  cards: [
    {
      title: 'Frontend Rescue',
      text: 'For existing products: slow pages, accessibility gaps or a codebase nobody wants to touch. I find the problems, fix them and leave it documented.',
      button: "See What's Included",
    },
    {
      eyebrow: 'For new products',
      title: 'Full Product / Builds',
      text: 'Next.js and Node.js products, designed and shipped end to end, from the first sketch to production. I lead the squad, set the standards and bring AI-assisted workflows.',
      button: 'Start a Project',
    },
  ],
}

export const CITY = {
  title: 'Curitiba, Brazil.',
  bio: "I'm Renon Reis, a senior software engineer and tech lead with ten years in web development. I build with TypeScript, React, Next.js and Node.js, from banking to e-commerce: design systems, micro frontends and accessible interfaces that hold up at scale. Today I lead the frontend of Sicredi's Internet Banking at Raio, and I care about code the next developer will thank me for.",
}

export const HIGHLIGHTS = [
  {
    eyebrow: 'Status',
    title: 'Open to Work',
    text: 'Tech lead at Raio today, open to new opportunities and freelance work, remote from Curitiba.',
    button: 'Hire Me',
  },
  {
    eyebrow: 'Community',
    title: 'After Hours',
    text: 'Off the clock I build in the open: Triquetra, my accessible React design system, and Project Zero Dawn, my agentic engineering workflow.',
    button: 'View All',
  },
  {
    eyebrow: 'Case Study',
    title: 'The Heist: Banking at Full Scale',
    text: "How I led Sicredi's transaction history micro frontend to the full retail user base in October 2026.",
    button: 'Read the Case Study',
  },
  {
    eyebrow: 'Personal',
    title: 'Off the Clock',
    text: 'TBD: a personal line from Renon (supplied in the content review).',
    button: 'More About Me',
  },
]

export const CLIENTS = {
  header: 'Clients',
  link: 'View All',
  cards: [
    { eyebrow: 'Sample Clients', title: 'Sicredi, Printi, Contabilizei and More', button: 'See All Clients' },
    {
      eyebrow: 'Sample Review',
      title: '“Incredibly fast, detail-oriented, and easy to work with.”',
      button: 'Read the Review',
      sample: true,
    },
  ],
}

export const BLOG = {
  header: 'Blog',
  link: 'View all',
  // Sample posts: titles are painted into the covers.
  posts: [
    { title: '700 AI Agents Escaped and Became Hackers', date: 'November 3, 2026', sample: true },
    { title: 'Agentic Engineering in 2026', date: 'October 21, 2026', sample: true },
    { title: 'Think System Design & Architecture', date: 'October 8, 2026', sample: true },
  ],
}

export const FOOTER = {
  logoAlt: 'Grand Theft Developer',
  pill: { title: 'Build Your Own', text: "Want a portfolio like this? Here's how it was built, step by step." },
  socials: [
    { label: 'GitHub', href: LINKS.github },
    { label: 'LinkedIn', href: LINKS.linkedin },
  ],
  links: [
    { label: 'Email', href: LINKS.email },
    { label: 'Résumé', href: LINKS.resume },
    { label: 'Privacy', href: LINKS.privacy },
  ],
  badge: { title: 'Rated D for Developer', text: 'Clean Code, Mild Refactoring, Frequent Coffee.' },
  copyright: '© 2026 Renon Reis.',
  disclaimer: DISCLAIMER,
}
