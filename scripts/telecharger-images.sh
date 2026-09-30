#!/usr/bin/env bash
# Rapatrie toutes les photos des réalisations depuis l'ancien site embi.fr
# vers images/realisations/ (à lancer AVANT de fermer l'ancien site).
# Les photos listées dans assets/js/projects.js qui n'existent pas sont ignorées.
# Ensuite, dans assets/js/projects.js, remplacez :
#   const OLD = "https://www.embi.fr/wp-content/uploads/";
# par :
#   const OLD = "images/realisations/";
set -uo pipefail
cd "$(dirname "$0")/.."
BASE="https://www.embi.fr/wp-content/uploads/"
urls=$(node -e 'global.window={};require("./assets/js/projects.js");const s=new Set();for(const p of window.EMBI_PROJECTS)for(const u of p.images)s.add(u);console.log([...s].join("\n"))')
urls="$urls"$'\n'"${BASE}2018/08/FishClub-paris.jpg"
ok=0; ko=0
while IFS= read -r u; do
  [ -z "$u" ] && continue
  f="images/realisations/${u#"$BASE"}"
  mkdir -p "$(dirname "$f")"
  if curl -fsSL "$u" -o "$f"; then ok=$((ok+1)); echo "✓ ${u#"$BASE"}"; else rm -f "$f"; ko=$((ko+1)); fi
done <<< "$urls"
echo "Terminé : $ok photos téléchargées ($ko adresses sans photo, ignorées)."
