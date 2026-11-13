# Maquettes 3D des chantiers (« Du plan à l'appartement »)

Données lues par `assets/js/maquette.js`, dans `assets/maquettes/<id du chantier>/` :
`scene.json` (murs, fenêtres, portes, points lumineux, mobilier, calques, en mètres) et les images
(`papier`, `sol`, `ombre` et un webp par calque : démolition, électricité, faux plafonds…).
Les étapes de l'animation se déduisent de ces calques : un chantier sans plan électrique n'a pas d'étape Électricité.

Plans de l'architecte rendus en PNG (300 dpi pour un plan au 1:50 : 236,2 pixels par mètre).

## Chantiers décrits par un fichier de réglages

```sh
python chantier.py chantiers/<id>.json <dossier des plans PNG> <dossier de travail> ../../assets/maquettes/<id>
```

Le fichier `chantiers/<id>.json` donne le plan de base (murs, repère), les autres plans à recaler dessus
(échelle et décalage estimés sur les murs, puis affinés), les calques (`demolition`, `electricite`, `plafonds`,
`existant`, `cotes`, `couleurs`), les sols (couleurs d'un plan des sols, ou une matière par défaut et des zones),
les corrections (ouvertures à effacer, fenêtres en biais, bouchons, zones hors du logement) et le mobilier,
en pixels du plan de base. Le dossier de travail reçoit `_controle.jpg` (murs, ouvertures, sols, meubles
sur un quadrillage) et `_recalage-*.jpg` pour vérifier.

## Lieux ouverts (cafés, boutiques…) décrits à la main

Quand le plan n'a pas de murs fermés que `chantier.py` saurait détecter (un café dans un hall, un plateau ouvert),
les murs, poteaux, zones de sol et le mobilier sont décrits à la main, en pixels du plan de base, et les traits rouges
d'un plan (plan électrique) sont recalés morceau par morceau (échelle et décalage) ; ses points lumineux deviennent
les lumières de la maquette. Mobilier propre aux cafés : `comptoir`, `vitrine`, `meuble_bar`, `table_carree`,
`chaise_bistrot`, `suspension` (voir `assets/js/maquette.js`).

```sh
python espace.py chantiers/cafe-joyeux-canal-plus.json <dossier des plans PNG> <dossier de travail> ../../assets/maquettes/cafe-joyeux-canal-plus
```

Plans PNG du Café Joyeux · Canal+ : pages 1 (plan projet, 1:75) et 11 (plan électrique) du DCE, rendues à 300 dpi
(`pdftoppm -r 300 -png -f 1 -l 1 DCE.pdf p1`).

## Appartement haussmannien (premier prototype)

```sh
python prepare.py <dossier des plans PNG> <travail>/out       # murs, ouvertures, pièces, calques
python sols.py <travail> <travail>/out hongrie,hongrie,...   # calepinage des sols, une matière par pièce
python export.py <travail> ../../assets/maquettes/appartement-haussmannien
python ao.py <travail> ../../assets/maquettes/appartement-haussmannien
```

Dépendances : numpy, scipy, opencv-python-headless.
