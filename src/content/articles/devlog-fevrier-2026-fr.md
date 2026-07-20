---
title: 'RUSSIA 1917 : Journal de développement — février 2026'
slug: 'russia-1917-journal-fevrier-2026'
locale: 'fr'
translationKey: 'russia-devlog-2026-02'
description: 'Le point de février 2026 sur les 43 débats politiques, le rythme de la campagne et l’expérience des premiers testeurs.'
publishedAt: '2026-02-01'
heroImage: '../../assets/images/russia-1917-placeholder.png'
heroAlt: 'Carte ferroviaire de Russia 1917 inspirée de l’avant-garde soviétique'
category: 'devlog'
relatedGame: 'russia-1917'
author: 'antoine-moens'
draft: false
featured: false
---

Bonjour,

Voici l’état d’avancement du jeu **Russia 1917**, réalisé pendant les mois de **janvier et février**.

Comme la **carte stratégique** fonctionne désormais bien, j’ai voulu commencer à travailler sur la **dynamique des scénarios**. L’idée est de proposer au joueur de participer aux débats internes du **parti bolchevik**, à travers une série de décisions politiques. En fonction des choix effectués, on retrouve ensuite leur impact sur la carte stratégique.

Par exemple, si l’on reconnaît l’indépendance de la **Finlande** (comme dans la réalité), les troupes finlandaises n’attaqueront plus la jeune URSS. Si, au contraire, on décide de ne pas créer d’**Armée rouge** et de se contenter de la **Garde rouge**, on se retrouve ensuite dans l’impossibilité de constituer une véritable armée, etc.

Pour construire ces débats, je me suis appuyé sur trois documents importants :

- _Dix jours qui ébranlèrent le monde_ de **John Reed** (1919), en français
- _The History of the Civil War in the U.S.S.R._ (1937), en anglais
- _Histoire du Parti communiste (bolchévik) de l’URSS_ (1938), en français
- ainsi que les **Œuvres complètes de Lénine** pour la période **1917-1922** (tomes 26 à 45, en russe)

À partir de ces sources, j’ai construit **43 débats** qui ont lieu entre **novembre 1917** et **décembre 1922**.

Voici la liste :

1. Faire_la_revolution
2. Decret_sur_la_terre
3. Decret_sur_la_paix
4. Droit_autodetermination_peuples
5. Decret_controle_ouvrier
6. Creation_tcheka
7. Independance_finlande
8. Mariage_civil_egalite_hf
9. Nationalisation_banques_dettes
10. Dissolution_assemblee_constituante
11. Creation_armee_rouge
12. Calendrier_gregorien
13. Accord_brest_litovsk_1
14. Accord_brest_litovsk_2
15. Monopole_commerce_exterieur
16. Dictature_alimentaire
17. Nationalisation_grande_industrie
18. Comites_paysans_pauvres
19. Constitution_RSFSR
20. Execution_tsar
21. Terreur_rouge
22. Code_famille
23. Journee_8_heures
24. Prodrazviorstka
25. Creation_komintern
26. Creation_politburo
27. Creation_jenotdel
28. Lutte_analphabetisme_likbez
29. Traite_tartu_estonie
30. Plan_goelro
31. Militarisation_travail
32. 21_conditions_komintern
33. Congres_peuples_orient
34. Legalisation_avortement
35. Debat_syndicats
36. Adoption_NEP
37. Interdiction_fractions
38. Front_unique_komintern
39. Accord_ARA_famine
40. Congres_extreme_orient
41. Conference_genes
42. Traite_rapallo
43. Creation_URSS

À l’heure actuelle, j’ai réalisé **5 débats sur 43**.

Pour mettre en scène ces débats, je fais discuter **deux personnages**. Par exemple, voici une vidéo qui montre la discussion entre **Lénine** et **Zinoviev** sur l’opportunité de faire la révolution avant l’ouverture du **Congrès des soviets**.

[Voir la vidéo sur YouTube](https://www.youtube.com/watch?v=VbIDXrxW6R4)

## Problèmes de structure dynamique et de rythme

La mise en place de ces **43 scénarios** a fait apparaître deux gros problèmes.

### 1. Une structure réellement dynamique

Chaque scénario a un effet sur la partie, et cet effet est généralement assez simple à mettre en place. Par exemple, l’instauration du **communisme de guerre** conduit à faire remonter le nombre de troupes disponibles à créer. En soi, c’est assez facile, car il s’agit simplement de modifier une valeur.

En revanche, pour des raisons de cohérence, chaque décision passée peut rendre certains débats suivants **caducs** ou au contraire en faire émerger de nouveaux. Par exemple, si vous donnez l’indépendance à chaque peuple qui la demande, vous aurez besoin de moins de troupes, et automatiquement certaines mesures politiques comme le communisme de guerre deviennent moins nécessaires. De même, le fait de ne pas mettre en place la **police politique** peut avoir pour conséquence de ne pas voir apparaître certaines révoltes comme **Kronstadt**.

Cela signifie que certains débats ne doivent apparaître que sous certaines conditions. On passe donc d’un chemin balisé, où les débats ont lieu à des dates connues si l’on suit les décisions historiques, à un chemin beaucoup plus ouvert, où les débats peuvent ne pas avoir lieu du tout, ou apparaître à d’autres moments selon la réalité du terrain.

C’est un travail auquel je dois encore m’atteler, mais que je devais déjà prendre en compte dans l’élaboration de la **structure de données** du jeu.

### 2. Le problème du rythme

Je voudrais que le jeu dure environ **1 heure minimum**. Or, sachant qu’il y a **62 mois** entre **novembre 1917** et **décembre 1922** (date de création de l’URSS et fin du jeu), chaque mois ne peut durer qu’environ **60 secondes**.

Le problème, c’est que beaucoup de débats ont lieu au tout début de la partie :

- **5 en novembre 1917**
- **3 en décembre 1917**
- **3 en janvier 1918**

Sachant que chaque débat dure environ **1 minute**, cela donne, du point de vue du joueur :

- 1 minute sur la carte stratégique en novembre 1917
- puis 5 minutes pour résoudre les 5 débats de novembre 1917 (qu’on peut éventuellement skipper)
- puis 1 minute sur la carte stratégique en décembre 1917
- puis 3 minutes pour résoudre les débats de décembre 1917
- etc.

Bref, le rythme est complètement cassé.

J’essaie de trouver une solution en rendant les débats **facultatifs**, avec une simple notification au lieu d’obliger le joueur à se positionner immédiatement. Mais comme les débats les plus importants ont lieu durant les premiers mois, on perd malgré tout quelque chose. C’est un point que j’essaie encore de résoudre.

## Expérience joueur

J’ai aussi eu l’occasion de faire tester mon jeu, en conditions réelles, à **deux personnes**. Plusieurs points sont ressortis :

- **Un problème de maniabilité** : ce n’est pas facile, au début, de sélectionner les soldats. Pour le zoom, je dois installer un système de type **pincer/tirer**, au lieu de garder des boutons de zoom.
- **Un problème de scénario / d’objectif** : le joueur n’a pas assez d’informations sur ce qu’il doit faire.
- **Un problème de lisibilité** : il y a beaucoup trop d’informations à l’écran, au lieu de mieux les répartir sur plusieurs interfaces.

Surtout, l’écran est occupé par des **affiches de propagande** et par une **œuvre artistique** qui se construit pendant le jeu (j’en parle dans cet article), mais qui prend presque **15 % de l’écran en permanence** sans apporter grand-chose à l’expérience.

Bref, je dois retravailler de manière importante **l’expérience utilisateur** et mettre en place un **bon tutoriel**.
