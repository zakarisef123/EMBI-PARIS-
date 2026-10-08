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
· `/conception-sur-mesure/` · `/savoir-faire/` · `/methode/` · `/showroom/` · `/contact/` · `/urgence/` (+ `/urgence/plomberie/`, `/urgence/electricite/`, `/urgence/assainissement/`, textes dans `src/data/urgences.js`)
· `/projets-specifiques/` · `/qualifications/` · `/faq/` (toutes les questions de `src/data/faq.js`, par thème)
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
Les chantiers listés dans `assets/img/manifest.json` utilisent déjà leurs photos hébergées sur le site, en WebP. Les autres viennent encore de www.embi.fr. Pour héberger les photos sur le site (WebP, 3 tailles, srcset) :
```
cd scripts/photos && npm install
npm run telecharger     # récupère les photos de l'ancien site dans photos-originales/ (avant sa fermeture)
npm run convertir       # crée assets/img/projets/<chantier>/… et assets/img/manifest.json
```
Pour des photos haute définition, déposez-les dans `photos-originales/projets/<id-du-chantier>/` (01.jpg = couverture) et relancez `npm run convertir` : le chantier passe aussitôt sur ses photos locales, les chantiers déjà convertis sont conservés. Un chantier sans photos locales garde celles de l'ancien site. `photos: "local"` dans `site.config.js` signale seulement les chantiers qui n'ont pas encore leurs photos.

## Pages légales
Les champs `[À COMPLÉTER]` des mentions légales (raison sociale, forme juridique, capital, SIRET, RCS, siège, directeur de la publication, TVA, assurance décennale, médiateur) sont surlignés en jaune. Les passages `<!-- À RELIRE -->` sont à relire avant mise en ligne (pages secteur, politique de confidentialité).

## Carte du quartier (page Showroom)
Sous les infos pratiques du showroom, la carte « Autour du showroom » (`assets/js/quartier.js`) : catégories (métro, parkings, restaurants, cafés), recherche de lieux dans un rayon de 1,5 km, fiche du lieu (adresse, site, téléphone, horaires, photos, avis Google), temps de marche et itinéraire à pied depuis le showroom. Elle ne se charge qu'après l'accord « Contenus externes » du bandeau cookies. Sans clé, ou si Google refuse la clé, le plan d'accès simple s'affiche à la place.

Pour l'activer, dans le compte Google Cloud d'EMBI (https://console.cloud.google.com) :
1. **APIs à activer** : Maps JavaScript API, Places API (New), Routes API. Un compte de facturation doit être relié au projet (Google offre un quota gratuit mensuel ; chaque affichage de carte et chaque recherche est décompté).
2. **Créer une clé** (API et services → Identifiants → Créer des identifiants → Clé API), puis la **restreindre** :
   - Restrictions d'application : « Sites web », avec `https://embi.fr/*`, `https://www.embi.fr/*`, `https://embiparis.netlify.app/*` et `https://*--embiparis.netlify.app/*` (aperçus Netlify) ;
   - Restrictions d'API : les trois API ci-dessus.
3. Coller la clé dans `site.config.js` → `mapsApiKey`.

La clé `AIzaSyB41DRU…` présente dans les exemples de Google ne fonctionne que sur JSFiddle : elle ne marche pas sur le site.

## Cookies
`assets/js/consent.js` : bandeau léger (refuser / personnaliser / accepter), Google Consent Mode v2. La carte Google Maps ne se charge qu'après accord ; avant, un plan d'accès dessiné s'affiche avec le bouton « Afficher la carte ». Pour Google Analytics ou Google Ads : renseignez `GA4_ID` / `ADS_ID` en haut du fichier.

## Animation d'intro (accueil)
Jouée une fois par visite, avec un bouton « Passer », désactivée si l'utilisateur a demandé moins d'animations. Sans JavaScript (et pour les robots), la page s'affiche directement et le compteur indique 100.
