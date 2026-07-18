export const locales = ['fr', 'en', 'es', 'de'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
};

export const ui = {
  fr: {
    nav: ['Jeux', 'Commander un jeu', 'Articles', 'Communauté', 'À propos'],
    paths: ['jeux', 'commander-un-jeu', 'articles', 'communaute', 'a-propos'],
    newsletter: 'Newsletter',
    discord: 'Discord',
    menu: 'Menu',
    close: 'Fermer',
    skip: 'Aller au contenu',
    allGames: 'Tous les jeux',
    allArticles: 'Tous les articles',
    read: 'Lire l’article',
    viewGame: 'Voir le jeu',
    devlog: 'Journal de développement',
    unavailable: 'Cette traduction n’est pas encore disponible.',
  },
  en: {
    nav: ['Games', 'Commission a game', 'Articles', 'Community', 'About'],
    paths: ['jeux', 'commander-un-jeu', 'articles', 'communaute', 'a-propos'],
    newsletter: 'Newsletter',
    discord: 'Discord',
    menu: 'Menu',
    close: 'Close',
    skip: 'Skip to content',
    allGames: 'All games',
    allArticles: 'All articles',
    read: 'Read article',
    viewGame: 'View game',
    devlog: 'Development journal',
    unavailable: 'This translation is not available yet.',
  },
  es: {
    nav: ['Juegos', 'Encargar un juego', 'Artículos', 'Comunidad', 'Quiénes somos'],
    paths: ['jeux', 'commander-un-jeu', 'articles', 'communaute', 'a-propos'],
    newsletter: 'Boletín',
    discord: 'Discord',
    menu: 'Menú',
    close: 'Cerrar',
    skip: 'Ir al contenido',
    allGames: 'Todos los juegos',
    allArticles: 'Todos los artículos',
    read: 'Leer el artículo',
    viewGame: 'Ver el juego',
    devlog: 'Diario de desarrollo',
    unavailable: 'Esta traducción aún no está disponible.',
  },
  de: {
    nav: ['Spiele', 'Spiel beauftragen', 'Artikel', 'Community', 'Über uns'],
    paths: ['jeux', 'commander-un-jeu', 'articles', 'communaute', 'a-propos'],
    newsletter: 'Newsletter',
    discord: 'Discord',
    menu: 'Menü',
    close: 'Schließen',
    skip: 'Zum Inhalt',
    allGames: 'Alle Spiele',
    allArticles: 'Alle Artikel',
    read: 'Artikel lesen',
    viewGame: 'Spiel ansehen',
    devlog: 'Entwicklungstagebuch',
    unavailable: 'Diese Übersetzung ist noch nicht verfügbar.',
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export const categoryLabels: Record<Locale, Record<string, string>> = {
  fr: {
    devlog: 'Journal de développement',
    'marxist-games': 'Jeux marxistes à découvrir',
    'marxism-games': 'Marxisme et jeu vidéo',
    history: 'Histoire',
    tutorials: 'Tutoriels',
    'association-news': 'Actualités de l’association',
  },
  en: {
    devlog: 'Development journal',
    'marxist-games': 'Marxist games to discover',
    'marxism-games': 'Marxism and video games',
    history: 'History',
    tutorials: 'Tutorials',
    'association-news': 'Association news',
  },
  es: {
    devlog: 'Diario de desarrollo',
    'marxist-games': 'Juegos marxistas por descubrir',
    'marxism-games': 'Marxismo y videojuegos',
    history: 'Historia',
    tutorials: 'Tutoriales',
    'association-news': 'Noticias de la asociación',
  },
  de: {
    devlog: 'Entwicklungstagebuch',
    'marxist-games': 'Marxistische Spiele entdecken',
    'marxism-games': 'Marxismus und Videospiele',
    history: 'Geschichte',
    tutorials: 'Tutorials',
    'association-news': 'Vereinsnachrichten',
  },
};

export function localizedDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
    date,
  );
}
