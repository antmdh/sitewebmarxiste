# Instructions de contribution

- Utiliser TypeScript en mode strict.
- Respecter le design system défini dans `src/styles/global.css`.
- Concevoir mobile first et vérifier les paliers mobile, tablette et ordinateur.
- Ne pas ajouter de dépendance sans justification documentée.
- Ne pas introduire de base de données ni de système de comptes.
- Ne jamais exposer un secret dans le code client ou dans le dépôt.
- Conserver la compatibilité avec Cloudflare Workers et Cloudflare Pages.
- Lancer `npm run check`, `npm run lint`, `npm run test` et `npm run build` avant de terminer.
- Ne pas modifier un contenu dans une langue sans vérifier les traductions portant le même `translationKey`.
- Créer et réutiliser des composants plutôt que dupliquer le balisage.
- Respecter l’accessibilité : HTML sémantique, clavier, focus visible, labels et contrastes.
- N’utiliser des contenus fictifs que s’ils sont clairement identifiés comme tels.
