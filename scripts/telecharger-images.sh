#!/usr/bin/env bash
# Rapatrie les photos des réalisations depuis l'ancien site embi.fr
# vers images/realisations/ (à lancer AVANT de fermer l'ancien site).
# Ensuite, dans assets/js/projects.js, remplacez :
#   const OLD = "https://www.embi.fr/wp-content/uploads/";
# par :
#   const OLD = "images/realisations/";
set -euo pipefail
cd "$(dirname "$0")/.."
BASE="https://www.embi.fr/wp-content/uploads"
FILES=(
  2018/01/Hotel-Panache-012.jpg 2018/01/COLETTE-5.jpg
  2017/11/Hotel-ambassadeur-9.jpg 2017/11/PETITE-MENDIGOTE-01.jpg
  2017/11/BYREDO-01.jpg 2017/11/HOTEL-BIENVENUE-09.jpg
  2017/11/LORO-PIANA-03.jpg 2017/11/boutique-harrods-tartine-et-chocolat-04.jpg
  2017/11/renovation-appartement-particulier-4.jpg 2017/09/FishClub_03.jpg
  2017/09/Loustic_01.jpg 2017/09/HotelParadis_01.jpg 2017/09/midi2.jpg
  2017/09/Pinson_01.jpg 2017/09/appartement-particulier-renovation-03.jpg
  2017/09/Triomphe_01.jpg 2017/09/Grandpigalle_01.jpg
  2018/08/FishClub-paris.jpg
)
for f in "${FILES[@]}"; do
  mkdir -p "images/realisations/$(dirname "$f")"
  echo "↓ $f"
  curl -fsSL "$BASE/$f" -o "images/realisations/$f"
done
echo "✓ Images téléchargées dans images/realisations/"
