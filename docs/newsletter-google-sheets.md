# Newsletter : raccordement sécurisé à Google Sheets

Le formulaire `/api/newsletter` fonctionne côté serveur dans le Worker Cloudflare. Le navigateur
ne reçoit jamais les identifiants Google. Le tableur doit rester privé et n’être partagé qu’avec les
personnes autorisées et le compte de service.

## 1. Préparer le compte de service Google

1. Dans Google Cloud Console, créer ou sélectionner un projet dédié à Marxist Games.
2. Activer **Google Sheets API** pour ce projet.
3. Ouvrir **IAM et administration → Comptes de service** et créer un compte de service, par exemple
   `newsletter-marxists-games`.
4. Ne lui attribuer aucun rôle général dans le projet et ne pas activer la délégation à l’échelle du
   domaine.
5. Créer une clé JSON pour ce compte. Relever uniquement les valeurs `client_email` et
   `private_key`.
6. Dans Google Sheets, partager uniquement le tableur des inscriptions avec l’adresse
   `client_email`, en rôle **Éditeur**.

Le fichier JSON téléchargé est un secret. Après avoir enregistré ses deux valeurs dans Cloudflare,
le supprimer de l’ordinateur et de la corbeille. Il ne doit jamais être placé dans le dépôt.

## 2. Créer le widget Cloudflare Turnstile

1. Dans le tableau de bord Cloudflare, créer un widget Turnstile pour les domaines de production.
2. Enregistrer sa clé publique comme variable de compilation
   `PUBLIC_TURNSTILE_SITE_KEY`.
3. Enregistrer sa clé secrète comme secret Worker `TURNSTILE_SECRET_KEY`.

La validation serveur Turnstile est obligatoire. Le formulaire ne stocke pas l’adresse si le jeton
est absent, expiré ou invalide.

## 3. Enregistrer les secrets du Worker

Dans **Workers & Pages → sitewebmarxiste → Settings → Variables and Secrets**, ajouter comme
secrets chiffrés :

- `TURNSTILE_SECRET_KEY`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `NEWSLETTER_HASH_SECRET`

`NEWSLETTER_HASH_SECRET` doit être une valeur aléatoire longue et unique. Par exemple :

```sh
openssl rand -base64 48
```

Les valeurs non secrètes `GOOGLE_SHEET_RANGE` et `NEWSLETTER_CONSENT_VERSION`, ainsi que la
limitation à cinq tentatives par minute, sont définies dans `wrangler.jsonc`.

Pour un déploiement manuel, les secrets peuvent aussi être saisis sans les afficher dans
l’historique du terminal :

```sh
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
npx wrangler secret put GOOGLE_SHEET_ID
npx wrangler secret put NEWSLETTER_HASH_SECRET
```

## 4. Structure du tableur

L’onglet doit s’appeler `subscriptions` et sa première ligne doit rester :

```text
subscriber_id,email,locale,consent_at,consent_version,source,status
```

Le Worker ajoute les valeurs avec `valueInputOption=RAW` afin qu’un contenu commençant par `=`,
`+`, `-` ou `@` ne soit pas exécuté comme une formule. Aucune adresse IP n’est enregistrée.

La colonne `status` reçoit d’abord `pending`. Le futur scénario n8n pourra vérifier l’adresse,
envoyer le message de confirmation, puis passer ce statut à `confirmed`, `unsubscribed` ou
`invalid`.

## 5. Développement local

Copier `.dev.vars.example` vers `.dev.vars`, compléter les valeurs Google et conserver ce fichier
hors de Git. La clé Turnstile fournie dans l’exemple est la clé de test officielle et ne doit pas
être utilisée en production.

Le fichier `.env.example` indique la variable publique Turnstile lue pendant la compilation. En
développement, le composant utilise automatiquement la clé publique de test si aucune clé n’est
définie.
