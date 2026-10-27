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

## Appartement haussmannien (premier prototype)

```sh
python prepare.py <dossier des plans PNG> <travail>/out       # murs, ouvertures, pièces, calques
python sols.py <travail> <travail>/out hongrie,hongrie,...   # calepinage des sols, une matière par pièce
python export.py <travail> ../../assets/maquettes/appartement-haussmannien
python ao.py <travail> ../../assets/maquettes/appartement-haussmannien
```

Dépendances : numpy, scipy, opencv-python-headless.
