# EMBI : nouveau site

Site vitrine une page, en HTML/CSS/JS pur, sans dépendance ni outil de build.

## Voir le site
Ouvrir `index.html` dans un navigateur. Pour le mettre en ligne, vous pouvez utiliser n'importe quel hébergeur statique (GitHub Pages, Netlify, OVH…).

## Modifier les réalisations
Tout se passe dans `assets/js/projects.js` : un bloc par chantier (titre, catégorie, photos, description facultative).
La liste des réalisations (avec ses filtres), les chantiers signature (`featured: true`), le bandeau défilant, la fiche projet et les suggestions du questionnaire « Votre projet en 3 questions » se mettent à jour tout seuls.

## Photos
Les photos viennent pour l'instant de l'ancien site (embi.fr), en ~480 px de large.
1. **Avant de fermer l'ancien site**, lancez `scripts/telecharger-images.sh` pour les copier dans `images/realisations/`.
2. Dans `assets/js/projects.js`, remplacez `const OLD = "https://www.embi.fr/wp-content/uploads/"` par `const OLD = "images/realisations/"`.
3. Faites de même pour les 2 images d'accueil dans `index.html`.
4. Idéalement, remplacez-les par des photos haute définition (au moins 1600 px) : le rendu sera nettement meilleur.

## Structure
```
index.html             page unique
assets/css/style.css   styles (couleurs en haut du fichier, dans :root)
assets/js/projects.js  liste des réalisations
assets/js/main.js      galerie, filtres, visionneuse, animations, formulaire
scripts/               utilitaires
```

Le formulaire de contact ouvre la messagerie du visiteur avec un e-mail pré-rempli vers sec@embi.fr.
Pour recevoir les demandes sans passer par la messagerie, branchez un service comme Formspree ou Netlify Forms.

## Croquis de l'étape « Livraison » (section Fonctionnement)
Déposez l'image du croquis d'architecte dans `images/methode/livraison.jpg` (format 3:2, idéalement 1800 × 1200 px).
Tant que l'image n'est pas présente, le site affiche automatiquement un dessin de remplacement.
