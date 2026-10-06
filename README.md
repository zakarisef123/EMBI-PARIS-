# EMBI : site vitrine multipage

Site statique en HTML/CSS/JS, généré par un petit script Node.js sans dépendance (`scripts/build.js`).
Netlify lance la génération à chaque publication (`netlify.toml`) et publie le dossier `dist/`.

## Voir le site en local
```
node scripts/build.js
cd dist && python3 -m http.server 8000     # puis http://localhost:8000
```
Les liens sont absolus (`/contact/`…) : ouvrez le site via un petit serveur, pas en double-cliquant sur un fichier.

## Où modifier quoi
| Quoi | Où |
|---|---|
| Réglages (adresse du site, PDF, photos, formulaires, réseaux sociaux) | `site.config.js` |
| Chantiers (textes, photos, mise en avant) | `src/data/projects.js` |
| Textes des pages secteur (hôtels, boutiques, restaurants, particuliers) | `src/data/sectors.js` |
| Questions fréquentes (FAQ en bas de chaque page) | `src/data/faq.js` (pages Rénovation : `src/data/services.js`, articles : `src/data/articles.js`) |
| Pages (accueil, contact, showroom, légal…) | `src/pages/*.html` (titre et description dans l'en-tête JSON) |
| Gabarits page chantier / page secteur | `src/templates/` |
| En-tête, pied de page, animation d'intro | `src/layout/` |
| Styles, scripts, polices, icônes | `assets/` |

Ne modifiez jamais `dist/` : il est recréé à chaque génération.

## Les adresses
`/` · `/hotels/` · `/boutiques/` · `/restaurants/` · `/particuliers/` · `/realisations/` · `/realisations/<chantier>/` (17 pages)
· `/conception-sur-mesure/` · `/savoir-faire/` · `/methode/` · `/showroom/` · `/contact/` · `/urgence/`
· `/mentions-legales/` · `/politique-de-confidentialite/` · `/cgv/` · `/merci/` · `/404.html`

Les anciennes adresses (`/contact.html`, `/projet.html?p=…`, `/realisations/panache.html`…) sont redirigées (301) grâce au fichier `_redirects` généré.

## Contrôles automatiques
La génération vérifie : un seul H1 par page, un texte alt sur chaque image, titres et descriptions uniques, liens internes existants, fichiers PDF / photos présents en mode local. Les points à vérifier s'affichent à la fin de `node scripts/build.js`.

## Formulaires (FormSubmit)
Le formulaire de devis et le questionnaire « Votre projet en 3 questions » sont envoyés par [FormSubmit](https://formsubmit.co) à l'adresse de `site.config.js` (`formsubmit`, par défaut sec@embi.fr).
1. **Activation (une seule fois)** : une fois le site en ligne, envoyez une demande test depuis `/contact/`. FormSubmit envoie un e-mail « Confirm your email » à sec@embi.fr : cliquez sur le lien d'activation. Les demandes suivantes arrivent directement dans la boîte mail.
2. *(Facultatif)* FormSubmit fournit ensuite un identifiant aléatoire : remplacez l'e-mail par cet identifiant dans `site.config.js` pour ne plus l'afficher dans le code.
Chaque formulaire a une case de consentement obligatoire, un piège anti-spam invisible et, en secours, le téléphone et l'e-mail.

## PDF (CGV + catalogues)
Déposez les fichiers dans `documents/` (noms dans `documents/LISEZMOI.md`), puis mettez `documents: "local"` dans `site.config.js`. En attendant, les liens pointent vers l'ancien site www.embi.fr.

## Photos
Toutes les photos viennent encore de www.embi.fr. Pour les héberger sur le site (WebP, 3 tailles, srcset) :
```
cd scripts/photos && npm install
npm run telecharger     # récupère les photos de l'ancien site dans photos-originales/ (avant sa fermeture)
npm run convertir       # crée assets/img/projets/<chantier>/… et assets/img/manifest.json
```
Pour des photos haute définition, déposez-les dans `photos-originales/projets/<id-du-chantier>/` (01.jpg = couverture), relancez `npm run convertir`, puis passez `photos: "local"` dans `site.config.js`. Un chantier sans photos locales garde celles de l'ancien site.

## Pages légales
Les champs `[À COMPLÉTER]` des mentions légales (raison sociale, forme juridique, capital, SIRET, RCS, siège, directeur de la publication, TVA, assurance décennale, médiateur) sont surlignés en jaune. Les passages `<!-- À RELIRE -->` sont à relire avant mise en ligne (pages secteur, politique de confidentialité).

## Cookies
`assets/js/consent.js` : bandeau léger (refuser / personnaliser / accepter), Google Consent Mode v2. La carte Google Maps ne se charge qu'après accord ; avant, un plan d'accès dessiné s'affiche avec le bouton « Afficher la carte ». Pour Google Analytics ou Google Ads : renseignez `GA4_ID` / `ADS_ID` en haut du fichier.

## Animation d'intro (accueil)
Jouée une fois par visite, avec un bouton « Passer », désactivée si l'utilisateur a demandé moins d'animations. Sans JavaScript (et pour les robots), la page s'affiche directement et le compteur indique 100.
