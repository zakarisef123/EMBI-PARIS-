/*
 * ─────────────────────────────────────────────────────────────
 *  URGENCES & DÉPANNAGE : /urgence/plomberie/, /urgence/electricite/, /urgence/assainissement/
 *  (la page /urgence/ reste la page d'ensemble, src/pages/urgence.html).
 *  Textes repris de la page Urgence : pas de délai d'intervention, de prix
 *  ni de disponibilité qui n'y figurent pas déjà. À RELIRE.
 * ─────────────────────────────────────────────────────────────
 */
const TEL = "01 45 72 65 24";
const URG = "06 31 60 01 35";

module.exports = [
  {
    slug: "plomberie",
    nav: "Plomberie",
    title: "Urgence plomberie à Paris : fuite d'eau, dégât des eaux | EMBI",
    description: `Fuite d'eau, dégât des eaux, chauffe-eau en panne ? Ligne d'urgence plomberie EMBI en dehors des heures de bureau : ${URG}. Recherche de la cause et réparation à Paris.`,
    h1: "Urgence plomberie, <em>fuite et dégât des eaux.</em>",
    lead: "Une fuite, un dégât des eaux, un chauffe-eau qui lâche : appelez la ligne d'urgence EMBI, nous recherchons la cause et réparons.",
    call: "Appeler un plombier",
    services: [
      ["Fuite d'eau", "Recherche de la cause de la fuite, apparente ou encastrée, puis réparation."],
      ["Dégât des eaux", "Mise en sécurité des lieux, réparation de l'origine du sinistre, puis remise en état des pièces touchées."],
      ["Chauffe-eau en panne", "Diagnostic du chauffe-eau et de son installation, réparation ou remplacement."],
      ["Robinetterie et sanitaires", "Robinet qui fuit, chasse d'eau, raccords, sanitaires endommagés : réparation ou remplacement."],
    ],
    tip: ["Fuite d'eau", "Coupez l'arrivée d'eau générale et l'électricité des pièces touchées, puis prévenez vos voisins du dessous."],
    after: "Après l'urgence, nos équipes peuvent reprendre durablement la plomberie : réseaux, salle de bains, cuisine, dans le cadre d'une [rénovation intérieure](/renovation/interieur/).",
    faq: [
      ["Quand appeler la ligne d'urgence plomberie ?", `En dehors des heures d'ouverture du bureau, pour une fuite, un dégât des eaux ou un chauffe-eau en panne : ${URG}. Pendant les heures de bureau, appelez le ${TEL}.`],
      ["Que faire en attendant le plombier ?", "Coupez l'arrivée d'eau générale et l'électricité des pièces touchées, puis prévenez vos voisins du dessous. Au téléphone, nous vous disons comment sécuriser les lieux. Lire aussi notre article [fuite d'eau, panne, canalisation bouchée](/mag/fuite-eau-urgence-paris-que-faire/)."],
      ["Pouvez-vous remettre en état après un dégât des eaux ?", "Oui. Une fois l'origine réparée, nos équipes remettent en état les pièces touchées : peinture, revêtements, menuiseries. Le devis est gratuit."],
    ],
  },
  {
    slug: "electricite",
    nav: "Électricité",
    title: "Urgence électricien à Paris : panne de courant, disjoncteur | EMBI",
    description: `Panne de courant, disjoncteur qui saute, tableau endommagé ? Ligne d'urgence électricité EMBI en dehors des heures de bureau : ${URG}. Diagnostic et remise en sécurité à Paris.`,
    h1: "Urgence électricité, <em>panne et remise en sécurité.</em>",
    lead: "Une panne de courant, un disjoncteur qui saute, une prise ou un tableau endommagé : appelez la ligne d'urgence EMBI pour un diagnostic et une remise en sécurité de l'installation.",
    call: "Appeler un électricien",
    services: [
      ["Panne de courant", "Recherche de l'origine de la panne, sur une pièce ou sur toute l'installation."],
      ["Disjoncteur qui saute", "Diagnostic du circuit en défaut et réparation, sans réarmer à l'aveugle."],
      ["Prise ou tableau endommagé", "Remplacement des éléments abîmés et remise en sécurité de l'installation."],
      ["Chantier électrique", "Après l'urgence, la remise à niveau : mise aux normes, rénovation complète de l'installation, tableaux et réseaux de locaux professionnels."],
    ],
    tip: ["Panne électrique", "Ne touchez à rien d'humide, abaissez le disjoncteur général et ne réarmez pas un disjoncteur qui saute aussitôt."],
    after: "Une installation ancienne ou qui disjoncte souvent mérite d'être reprise : lire notre article sur la [mise aux normes électriques](/mag/mise-aux-normes-electriques-quand-comment/).",
    faq: [
      ["Quand appeler la ligne d'urgence électricité ?", `En dehors des heures d'ouverture du bureau, pour une panne de courant, un disjoncteur qui saute ou un tableau endommagé : ${URG}. Pendant les heures de bureau, appelez le ${TEL}.`],
      ["Que faire en attendant l'électricien ?", "Ne touchez à rien d'humide, abaissez le disjoncteur général et ne réarmez pas un disjoncteur qui saute aussitôt. Au téléphone, nous vous disons comment sécuriser les lieux."],
      ["Faites-vous aussi la mise aux normes ?", "Oui : mise aux normes, rénovation complète de l'installation, tableaux et réseaux de locaux professionnels. Le devis est gratuit."],
    ],
  },
  {
    slug: "assainissement",
    nav: "Assainissement",
    title: "Urgence assainissement à Paris : canalisation bouchée, débouchage | EMBI",
    description: `Canalisation bouchée, évacuation qui refoule, mauvaises odeurs ? Ligne d'urgence assainissement EMBI en dehors des heures de bureau : ${URG}. Débouchage et remise en état à Paris.`,
    h1: "Urgence assainissement, <em>débouchage et évacuations.</em>",
    lead: "Une canalisation bouchée, une évacuation qui refoule, de mauvaises odeurs : appelez la ligne d'urgence EMBI pour le débouchage et la remise en état des évacuations.",
    call: "Appeler pour un débouchage",
    services: [
      ["Canalisation bouchée", "Débouchage des éviers, lavabos, douches, WC et colonnes d'évacuation."],
      ["Évacuation qui refoule", "Recherche de l'obstruction et remise en service de l'évacuation."],
      ["Mauvaises odeurs", "Recherche de l'origine : siphon, ventilation, raccord ou canalisation."],
      ["Remise en état", "Réparation ou remplacement des évacuations abîmées, après l'urgence."],
    ],
    tip: ["Canalisation bouchée", "Cessez d'utiliser l'évacuation concernée et évitez les produits chimiques agressifs, qui abîment les canalisations."],
    after: "Chez les particuliers comme dans les locaux professionnels : hôtels, restaurants, boutiques et bureaux.",
    faq: [
      ["Quand appeler la ligne d'urgence assainissement ?", `En dehors des heures d'ouverture du bureau, pour une canalisation bouchée ou une évacuation qui refoule : ${URG}. Pendant les heures de bureau, appelez le ${TEL}.`],
      ["Faut-il utiliser un déboucheur chimique ?", "Mieux vaut l'éviter : les produits agressifs abîment les canalisations. Cessez d'utiliser l'évacuation concernée et appelez-nous."],
      ["Intervenez-vous dans les restaurants et les hôtels ?", "Oui, chez les particuliers comme dans les locaux professionnels : hôtels, restaurants, boutiques et bureaux."],
    ],
  },
];
