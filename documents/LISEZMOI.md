# Documents PDF

Déposez ici les fichiers, avec exactement ces noms :

```
documents/EMBI-CGV.pdf
documents/catalogues/Azulev_catalogue_2015-2016.pdf
documents/catalogues/CIFRE_catalogue.pdf
documents/catalogues/Novaceram_catalogue_2015.pdf
documents/catalogues/RECER_catalogue.pdf
```

Puis, dans `site.config.js`, remplacez `documents: "embi.fr"` par `documents: "local"`.
Tous les liens du site (page CGV, pied de page, showroom) basculent d'un coup.
La génération (`node scripts/build.js`) signale tout fichier manquant.
