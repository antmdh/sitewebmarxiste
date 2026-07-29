# Marxist Games

Nouveau site unifié de l’association Marxist Games : catalogue de jeux, studio de commande, revue éditoriale et passerelle vers la communauté Discord.

## Stack

- Astro 5 et TypeScript strict ;
- collections de contenus Markdown ;
- rendu statique pour toutes les pages éditoriales ;
- deux endpoints serveur isolés pour les formulaires ;
- adaptateur Cloudflare Workers / Pages ;
- CSS mobile first sans framework JavaScript.

## Démarrage

```bash
npm install
npm run dev
```

Le site démarre sur `http://localhost:4321` et redirige vers `/fr/`.

## Vérifications

```bash
npm run check
npm run lint
npm run test
npm run build
```

`npm run format` applique Prettier aux fichiers sources.

## Contenus

Les collections se trouvent dans :

```text
src/content/
├── games/
├── articles/
├── pages/
└── authors/
```

Une traduction partage le même `translationKey` que le contenu d’origine. Elle peut garder un slug localisé différent. Le sélecteur de langue d’une page de contenu ne propose directement que les traductions présentes ; les autres langues renvoient à leur accueil.

Pour publier un contenu, définir `draft: false`. Les images de collection sont importées depuis `src/assets/images/` et optimisées par Astro.

## Formulaires et e-mail

Les formulaires envoient vers `/api/contact` et `/api/newsletter`. La validation serveur, le honeypot et les limites de longueur sont déjà actifs. La livraison est isolée dans `src/lib/contact-adapter.ts`.

Définir le secret Cloudflare suivant pour connecter un webhook HTTPS :

```bash
npx wrangler secret put CONTACT_WEBHOOK_URL
```

Le webhook reçoit un objet JSON normalisé. Tant que le secret est absent, l’endpoint répond clairement avec un statut 503 et aucune donnée n’est enregistrée. Pour un prestataire d’e-mail disposant d’une API spécifique, remplacer uniquement `deliverMessage()` et conserver le secret côté serveur.

## Déploiement Cloudflare

La configuration Astro utilise le mode serveur, mais toutes les pages de contenu portent `prerender = true`. Seuls les endpoints de formulaires restent dynamiques.

```bash
npm run build
npx wrangler deploy
```

Vérifier le domaine dans `astro.config.mjs`, le nom du Worker et la date de compatibilité dans `wrangler.jsonc`. Les fichiers `_headers` et `_redirects` sont copiés depuis `public/`.

## Avant la mise en ligne

Consulter [docs/todo-content.md](docs/todo-content.md) pour les visuels, traductions, coordonnées, liens Discord et textes juridiques à valider. Le plan de reprise des anciens sites est dans [docs/content-migration.md](docs/content-migration.md).
