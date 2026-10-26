# Maquettes 3D des chantiers (« Du plan à l'appartement »)

Données lues par `assets/js/maquette.js`, dans `assets/maquettes/<id du chantier>/` :
`scene.json` (murs, fenêtres, portes, points lumineux, mobilier, en mètres) et les calques du plan
(`papier`, `demolition`, `electricite`, `sol`, `ombre` en webp).

Préparation, à partir des plans de l'architecte rendus en PNG à 300 dpi (plans au 1:50) :

```sh
python prepare.py <dossier des plans PNG> <travail>          # murs, ouvertures, pièces, calques
python sols.py <travail> <travail>/out hongrie,hongrie,...   # calepinage des sols, une matière par pièce
python export.py <travail> assets/maquettes/<id>             # webp + scene.json (mobilier en mètres)
python ao.py <travail> assets/maquettes/<id>                 # ombre de contact au pied des murs
```

Dépendances : numpy, scipy, opencv-python-headless.
