# Plan de migration des contenus

Inventaire initial effectué le 16 juillet 2026 à partir de `marxistsgames.org`, des résultats indexés du site et de `marxistsgames.blogspot.com`. Aucun contenu n’est considéré comme validé tant que le texte, les images, les droits et la date n’ont pas été relus.

## Pages du site actuel identifiées

| URL source       | Contenu                                                                                     | Destination proposée                         | État                                                   |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| `/`              | Présentation de Russia 1917, Florida 1865, Dans la vallée de Sing Sing et courte biographie | `/fr/`, `/fr/jeux/`, `/fr/a-propos/`         | Structure reprise, textes à relire                     |
| `/russia1917`    | Présentation, captures et journaux mensuels jusqu’à juillet 2026                            | `/fr/jeux/russia-1917/` et articles `devlog` | Page de base créée, journaux à découper                |
| `/valeesingsing` | Présentation de Dans la vallée de Sing Sing                                                 | `/fr/jeux/la-vallee-de-sing-sing/`           | Page de base créée                                     |
| `/about-us`      | Association, collectif, objectifs politiques et culturels                                   | `/fr/a-propos/`                              | Adaptation courte créée, statuts à ajouter             |
| `/privacy`       | Politique de confidentialité et adresse de contact                                          | `/fr/confidentialite/`                       | Nouvelle structure créée, validation juridique requise |

Le site actuel présente aussi Florida 1865. Sa page dédiée n’a pas été identifiée lors du premier passage ; il faut vérifier si une URL non indexée existe.

## Articles Blogger identifiés

Première page et archives visibles :

- Journal de développement Russia 1917 — mai 2025 (publié le 5 janvier 2026) ;
- Hommage à l’avant-garde russe — 4 juin 2025 ;
- Mise à jour du 4 mai 2025 pour Russia 1917 ;
- Créer une IA stratégique dans GDevelop — 25 février 2025 ;
- Trouver le graphique idéal pour Russie 1917 — 27 janvier 2025 ;
- Quels sont mes outils — 26 novembre 2024 ;
- Comment faire une carte avec l’IA — 12 octobre 2024 ;
- archives d’octobre 2024 (trois billets) et de juillet 2024 (un billet) à exporter ;
- libellés observés : `Florida1865` (2), `Russia1917` (5), `ValléeSingSing` (3).

Le site principal contient en plus des journaux Russia 1917 de novembre et décembre 2025, février, avril, mai, juin et juillet 2026. Ils doivent devenir des articles individuels avec `relatedGame: "russia-1917"`, dates vérifiées et liens entre mois.

## Méthode d’import

1. Exporter le blog Blogger en XML et conserver une copie immuable.
2. Produire un tableau : URL, titre, date de publication réelle, libellés, images, crédits, statut.
3. Comparer les doublons entre le blog et la page monolithique `/russia1917`.
4. Corriger uniquement après validation éditoriale ; ne pas fusionner silencieusement deux versions divergentes.
5. Convertir chaque contenu validé en Markdown dans `src/content/articles/`.
6. Créer une entrée par langue et conserver un `translationKey` commun.
7. Lancer les vérifications, puis tester chaque ancienne URL redirigée.

## Images manquantes et droits

Les pages indexées signalent de nombreuses captures sans permettre un inventaire fiable des fichiers originaux. Il faut récupérer :

- captures récentes de la carte, des débats, de la Pravda, des rapports et des unités de Russia 1917 ;
- anciens écrans utiles pour montrer l’évolution de l’interface ;
- captures et cartes de Dans la vallée de Sing Sing ;
- visuel de couverture horizontal de Florida 1865 ; six captures du prototype sont désormais intégrées (carte, économie, sécurité, production, législatif et combat) ;
- portrait validé de l’auteur et visuels de l’association ;
- crédits, statut de domaine public et source de chaque affiche ou œuvre historique.

Les trois fichiers `*-placeholder.png` sont des concepts temporaires générés pour la nouvelle maquette. Ils ne doivent pas être présentés comme des captures de jeu.

## Redirections

La base se trouve dans `public/_redirects`. À compléter avec :

- chaque URL exacte de billet Blogger vers son nouvel article ;
- les variantes avec paramètres `?m=1` vers l’URL canonique ;
- les URLs de libellés vers les catégories ou jeux correspondants ;
- les anciennes archives mensuelles vers la liste d’articles filtrée si utile ;
- les éventuelles URLs Wix non indexées.

Conserver les redirections 301 pendant plusieurs années et ne jamais rediriger toutes les pages manquantes vers l’accueil : une destination pertinente ou une vraie 404 est préférable.

## Contenus probablement obsolètes ou à remanier

- pourcentages d’avancement, dates de sortie « été 2026 » et plateformes annoncées ;
- liens de test et invitations Discord anciens ou expirés ;
- descriptions à la première personne alors que le nouveau site parle au nom de l’association ;
- billets sur les outils d’IA qui doivent préciser leurs limites, sources et conditions d’usage actuelles ;
- formulations historiques ou politiques imprécises à faire relire ;
- politique de confidentialité actuelle, trop courte pour les nouveaux formulaires ;
- doublons de journaux entre Blogger et la longue page Russia 1917.

## Préserver le référencement

- garder l’ancien domaine comme domaine canonique du nouveau site ;
- rediriger chaque ancienne URL vers le contenu le plus proche ;
- reprendre les titres, dates et descriptions après relecture ;
- ne changer une seconde fois les nouveaux slugs qu’en cas de nécessité ;
- publier sitemap, RSS, canoniques et `hreflang` ;
- conserver les dates de publication originales et ajouter une date de modification distincte ;
- demander une réindexation après déploiement et suivre les erreurs 404 ;
- conserver l’export Blogger, les images originales et le tableau de correspondance hors du site publié.
