# EMBI : nouveau site

Site vitrine multipage en HTML/CSS/JS pur. Un petit script Node.js (`scripts/build.js`, sans dépendance) génère les pages des chantiers et le plan du site.

## Voir le site
Ouvrir `index.html` dans un navigateur. Pour le mettre en ligne, vous pouvez utiliser n'importe quel hébergeur statique (Netlify, OVH, GitHub Pages…), à la racine du domaine.

## Les pages
| Adresse | Contenu |
|---|---|
| `index.html` | Accueil : présentation, chantiers signature, accès aux autres pages |
| `realisations.html` | Toutes les réalisations, avec filtres |
| `realisations/<id>.html` | Une page par chantier (générée, ne pas modifier à la main) |
| `conception.html` | Conception sur mesure (architecte + architecte d'intérieur) |
| `savoir-faire.html` | Métiers : de la fondation jusqu'au toit, engagements |
| `methode.html` | Les 5 étapes d'un chantier |
| `showroom.html` | Showroom carrelages & parquets |
| `contact.html` | Formulaire, « Votre projet en 3 questions », urgence, plan d'accès |
| `mentions-legales.html`, `confidentialite.html` | Pages légales |
| `projet.html` | Ancienne adresse des chantiers : redirige vers la nouvelle page |

## Après chaque modification : `node scripts/build.js`
Le script :
- insère l'en-tête et le pied de page communs (`partials/header.html`, `partials/footer.html`) dans toutes les pages, entre les repères `<!-- @header -->` et `<!-- @footer -->` ;
- crée une vraie page HTML par chantier dans `realisations/` à partir de `partials/projet.html` (meilleur référencement : titre, description, fil d'Ariane et données structurées propres à chaque chantier) ;
- écrit la liste des réalisations directement dans `realisations.html` ;
- ajoute l'adresse canonique de chaque page et génère `sitemap.xml` et `robots.txt`.

L'adresse du site utilisée pour le référencement est `SITE` en haut de `scripts/build.js` (`https://www.embi.fr/`). Une fois le site en ligne, déclarez `https://www.embi.fr/sitemap.xml` dans Google Search Console.

## Modifier les réalisations
Tout se passe dans `assets/js/projects.js` : un bloc par chantier (titre, catégorie, photos, description facultative). Le mode d'emploi détaillé est en haut du fichier. Relancez ensuite `node scripts/build.js`.

## Photos
Les photos viennent pour l'instant de l'ancien site (embi.fr), en ~480 px de large.
1. **Avant de fermer l'ancien site**, lancez `scripts/telecharger-images.sh` pour les copier dans `images/realisations/`.
2. Dans `assets/js/projects.js`, remplacez `const OLD = "https://www.embi.fr/wp-content/uploads/"` par `const OLD = IMG;`, puis lancez `node scripts/build.js`.
3. Faites de même pour l'image d'accueil dans `index.html`.
4. Idéalement, remplacez-les par des photos haute définition (au moins 1600 px) : le rendu sera nettement meilleur.

## Pages légales : à compléter avant la mise en ligne
Les informations surlignées en jaune dans `mentions-legales.html` sont à renseigner : forme juridique, capital, RCS, SIRET, TVA, directeur de la publication, hébergeur, assurance décennale et médiateur de la consommation.

## Cookies (bandeau + Google Consent Mode v2)
`assets/js/consent.js` affiche le bandeau (Tout refuser / Personnaliser / Tout accepter) et envoie les signaux Google Consent Mode v2. Le choix est gardé 6 mois ; le lien « Gérer les cookies » en bas de page permet d'en changer.
- La carte Google Maps ne se charge qu'après accord.
- Pour ajouter Google Analytics ou Google Ads, renseignez `GA4_ID` ou `ADS_ID` en haut du fichier : la catégorie apparaît alors dans le bandeau et l'outil n'est chargé qu'après accord. Pensez à mettre à jour le tableau des cookies dans `confidentialite.html`.
- Les polices sont hébergées sur le site (`assets/fonts/`) : aucun appel à Google Fonts.

## Structure
```
*.html                 pages principales
realisations/          pages des chantiers (générées)
partials/              en-tête, pied de page et modèle de page chantier
assets/css/style.css   styles (couleurs en haut du fichier, dans :root)
assets/css/fonts.css   polices hébergées localement
assets/js/projects.js  liste des réalisations
assets/js/main.js      animations, filtres, questionnaire, formulaire
assets/js/consent.js   bandeau cookies
assets/js/cta.js       boutons « Appeler / Devis gratuit » flottants
scripts/               build.js, telecharger-images.sh
```

Le formulaire de contact ouvre la messagerie du visiteur avec un e-mail pré-rempli vers sec@embi.fr.
Pour recevoir les demandes sans passer par la messagerie, branchez un service comme Formspree ou Netlify Forms (et mettez à jour la politique de confidentialité).

## Croquis de l'étape « Livraison » (page Méthode)
Déposez l'image du croquis d'architecte dans `images/methode/livraison.jpg` (format 3:2, idéalement 1800 × 1200 px).
Tant que l'image n'est pas présente, le site affiche automatiquement un dessin de remplacement.

## Page « Showroom »
- **Photos du showroom** : ajoutez-les en haut de `assets/js/showroom.js`, dans `SHOWROOM_PHOTOS` (ex. `"images/showroom/showroom-1.jpg"`). La section « Le showroom en vrai » s'affiche automatiquement dès qu'une photo est présente.
- **Catalogues** : liste `SHOWROOM_CATALOGUES` dans le même fichier (couverture + lien PDF).
