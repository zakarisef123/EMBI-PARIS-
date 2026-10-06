/*
 * ─────────────────────────────────────────────────────────────
 *  PAGES RÉNOVATION : /renovation/interieur/ (avec une partie rénovation énergétique) et /renovation/exterieur/
 *  Prestations reprises de la page Savoir-faire ; textes composés à relire (<!-- À RELIRE -->).
 *  RGE : à n'afficher que si l'entreprise (ou les partenaires qui réalisent ces travaux) détient la qualification.
 * ─────────────────────────────────────────────────────────────
 */
module.exports = [
  {
    slug: "interieur",
    nav: "Rénovation intérieure",
    short: "Intérieur",
    title: "Rénovation intérieure et énergétique à Paris | EMBI",
    description: "Plomberie, électricité, revêtements, décoration et rénovation énergétique : EMBI rénove votre intérieur à Paris, de l'embellissement à la rénovation complète, avec un seul interlocuteur.",
    h1: "Rénovation intérieure <em>à Paris.</em>",
    lead: "Aménagement et rénovation d'intérieur, pour votre habitation comme pour votre local professionnel : EMBI coordonne tous les corps de métier, de l'étude à la livraison.",
    card: "Plomberie, électricité, revêtements et décoration, avec un volet rénovation énergétique : isolation, fenêtres, chauffage.",
    services: [
      ["Rénovation complète", "Appartement, hôtel, boutique ou restaurant : redistribution des espaces, réseaux, revêtements et finitions, menés par un interlocuteur unique."],
      ["Plomberie & salles de bain", "Création ou rénovation de salles de bain et de cuisines, remplacement des réseaux, sanitaires aux normes."],
      ["Électricité", "Rénovation et mise aux normes de l'installation, éclairage, tableaux, réseaux pour locaux professionnels."],
      ["Sols & revêtements", "Parquets, carrelages, revêtements muraux : choisis avec vous dans notre showroom du 17e."],
      ["Isolation & cloisons", "Isolation intérieure, cloisons, verrières : un confort retrouvé et des espaces repensés."],
      ["Décoration & sur-mesure", "Peinture, mobilier et rangements dessinés par notre architecte d'intérieur."],
    ],
    categories: ["particulier", "hotel", "boutique", "restaurant"],
    // Partie « Rénovation énergétique » de la page intérieure (ancre #energetique).
    energy: {
      title: "Rénovation énergétique",
      lead: "Moins de pertes de chaleur, plus de confort, des factures maîtrisées : EMBI réalise les travaux qui améliorent la performance énergétique de votre logement ou de vos locaux.",
      rge: true,
      services: [
        ["Isolation des murs", "Isolation par l'intérieur, adaptée aux immeubles parisiens, ou par l'extérieur lors d'un ravalement."],
        ["Combles & toitures", "Isolation des combles et de la toiture, reprise d'étanchéité."],
        ["Fenêtres & menuiseries", "Remplacement des fenêtres et portes pour limiter les déperditions, dans le respect du style de l'immeuble."],
        ["Ventilation", "Une ventilation adaptée, indispensable à un logement mieux isolé et plus sain."],
        ["Chauffage & eau chaude", "Remplacement des équipements par des solutions plus performantes."],
        ["Accompagnement aux aides", "Nous vous orientons vers les dispositifs en vigueur, réservés aux travaux réalisés par des entreprises RGE."],
      ],
    },
    faq: [
      ["Pouvez-vous rénover un appartement entier ?", "Oui. EMBI prend en charge la rénovation complète d'un appartement, de l'étude de faisabilité à la livraison, en coordonnant tous les corps de métier."],
      ["Intervenez-vous sur les locaux professionnels ?", "Oui : hôtels, boutiques, restaurants et bureaux. Les travaux peuvent inclure la remise aux normes en parallèle de la décoration."],
      ["Puis-je choisir mes matériaux sur place ?", "Notre showroom carrelages et parquets du 17e vous permet de voir et toucher les matières avant de décider."],
      ["Qu'est-ce que la qualification RGE ?", "RGE signifie « Reconnu Garant de l'Environnement ». Faire réaliser ses travaux par une entreprise RGE est une condition pour prétendre à la plupart des aides publiques à la rénovation énergétique."],
      ["Par quels travaux commencer ?", "En général, par l'isolation et les menuiseries, puis la ventilation et le chauffage. Un état des lieux permet de prioriser selon votre logement."],
      ["Quelles aides pour mes travaux ?", "Les aides évoluent régulièrement : consultez les conditions en vigueur sur france-renov.gouv.fr. Nous vous orientons lors de l'étude de votre projet."],
    ],
  },
  {
    slug: "exterieur",
    nav: "Rénovation extérieure",
    short: "Extérieur",
    title: "Rénovation extérieure à Paris : façades, toitures, terrasses | EMBI",
    description: "Ravalement de façade, menuiseries, balcons, vérandas, toitures et terrasses : EMBI réalise vos travaux extérieurs à Paris et en Île-de-France, de la fondation jusqu'au toit.",
    h1: "Rénovation extérieure, <em>de la façade au toit.</em>",
    lead: "Ravalement, menuiserie extérieure, balcons, terrasses, toitures et étanchéité : EMBI intervient de la fondation jusqu'au toit, avec un seul interlocuteur.",
    card: "Ravalement, menuiseries, balcons, vérandas, toitures et terrasses.",
    services: [
      ["Ravalement de façade", "Nettoyage, réparation et mise en peinture ou en enduit, dans le respect de l'architecture du bâtiment."],
      ["Menuiserie extérieure", "Portes, fenêtres et devantures, remplacées ou restaurées."],
      ["Balcons, galeries & patios", "Rénovation des balcons, garde-corps, galeries et cours intérieures."],
      ["Vérandas", "Création ou rénovation de vérandas pour gagner en lumière et en surface."],
      ["Toitures & étanchéité", "Réfection de toiture, étanchéité des toits-terrasses."],
      ["Terrasses", "Carrelage et aménagement de terrasses, durables et faciles à vivre."],
    ],
    categories: ["particulier", "hotel", "restaurant"],
    faq: [
      ["Faut-il une autorisation pour un ravalement à Paris ?", "Les travaux qui modifient l'aspect extérieur d'un bâtiment demandent en général une déclaration préalable en mairie. Nous vous aidons à constituer le dossier."],
      ["Intervenez-vous sur les toitures ?", "Oui : toitures, étanchéité et carrelage de terrasse. EMBI intervient de la fondation jusqu'au toit."],
      ["Pouvez-vous combiner ravalement et isolation ?", "Oui, un ravalement est souvent le bon moment pour isoler par l'extérieur. Voir la partie rénovation énergétique de notre page rénovation intérieure."],
      ["Remplacez-vous les fenêtres en respectant le style de l'immeuble ?", "Oui. Portes, fenêtres et devantures sont remplacées ou restaurées dans le respect de l'architecture du bâtiment, ce qui limite aussi les déperditions de chaleur."],
      ["Pouvez-vous créer une véranda ?", "Oui, nous créons ou rénovons des vérandas pour gagner en lumière et en surface. Notre architecte étudie la faisabilité et vous accompagne pour les autorisations de travaux."],
      ["Comment se prépare un ravalement de façade ?", "De la décision en copropriété jusqu'à la dépose de l'échafaudage, les étapes sont détaillées dans notre article sur le [ravalement de façade à Paris](/mag/ravalement-facade-paris-etapes/)."],
    ],
  },
];
