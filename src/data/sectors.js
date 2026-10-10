/*
 * ─────────────────────────────────────────────────────────────
 *  PAGES SECTEUR : /hotels/, /boutiques/, /restaurants/, /particuliers/
 *  Textes composés uniquement à partir des textes et chantiers existants.
 *  Chaque passage composé est signalé par <!-- À RELIRE --> dans la page générée.
 *  Les chantiers affichés et la liste des travaux viennent de src/data/projects.js.
 * ─────────────────────────────────────────────────────────────
 */
module.exports = [
  {
    category: "hotel",
    path: "/hotels/",
    nav: "Hôtels",
    title: "Rénovation d'hôtels à Paris : embellissement et mise aux normes | EMBI",
    description: "Hôtel Panache, Le Grand Pigalle, Hôtel Paradis et Hôtel Bienvenue : EMBI rénove des hôtels à Paris, de l'embellissement à la remise aux normes, avec un seul interlocuteur.",
    kicker: "Hôtels",
    h1: "Rénovation d'hôtels <em>à Paris.</em>",
    lead: "Hôtel Panache, Le Grand Pigalle, Hôtel Paradis et Hôtel Bienvenue : EMBI mène l'embellissement et la rénovation d'hôtels parisiens, jusqu'à l'ensemble du bâtiment.",
    paragraphs: [
      "Les travaux peuvent comprendre la remise aux normes hôtelières (sanitaires, circulations et accessibilité PMR, sécurité incendie, électricité) en parallèle des travaux de décoration.",
      "Parce que chaque client et chaque projet est différent, EMBI vous conseille et vous guide de l'élaboration à la livraison, avec un interlocuteur dédié pendant toute la durée du chantier.",
    ],
    card: "Embellissement, rénovation de l'ensemble du bâtiment et remise aux normes hôtelières.",
    phare: "hotel-panache", // chantier mis en avant à droite du texte (photo, travaux, lien)
    prestations: [ // « Nos prestations » : [titre, texte, lien]
      ["Chambres et salles de bains", "Embellissement des chambres, des salles de bains et des sanitaires.", "/renovation/interieur/"],
      ["Accueil et parties communes", "Hall, réception et circulations, rénovés avec le reste de l'hôtel.", "/renovation/interieur/"],
      ["Mise aux normes hôtelières", "Accessibilité PMR, sécurité incendie, électricité et sanitaires.", "/mag/mise-aux-normes-electriques-quand-comment/"],
      ["Travaux en site occupé", "Un chantier organisé pour que l'hôtel continue d'accueillir ses clients.", "/mag/travaux-site-occupe-hotel-boutique/"],
      ["Conception sur mesure", "Un architecte et un architecte d'intérieur dans l'équipe.", "/conception-sur-mesure/"],
    ],
  },
  {
    category: "boutique",
    path: "/boutiques/",
    nav: "Boutiques",
    title: "Rénovation et création de boutiques à Paris | EMBI",
    description: "Loro Piana, Byredo au Bon Marché, Colette, Petite Mendigote, Tartine et Chocolat chez Harrods : EMBI crée et rénove des boutiques et des corners en grand magasin, de la conception à la livraison.",
    kicker: "Boutiques",
    h1: "Rénovation de boutiques, <em>de la création au corner.</em>",
    lead: "Loro Piana, Byredo, Colette, Petite Mendigote, Tartine et Chocolat chez Harrods : de la création complète d'une boutique à la mise en place d'un corner en grand magasin, EMBI prend en charge l'ensemble de vos travaux.",
    paragraphs: [
      "Création complète, rénovation complète ou embellissement : EMBI et son réseau de 40 professionnels prennent en charge l'ensemble du chantier, avec un seul interlocuteur.",
      "Parce que chaque client et chaque projet est différent, EMBI vous conseille et vous guide de l'élaboration à la livraison, avec un interlocuteur dédié pendant toute la durée du chantier.",
    ],
    card: "Création complète, rénovation et corners en grand magasin : Loro Piana, Byredo, Colette…",
    phare: "loro-piana",
    prestations: [
      ["Création complète de boutique", "Comme pour Loro Piana : de la conception à la livraison.", "/mag/creation-boutique-loro-piana/"],
      ["Corners en grand magasin", "Byredo au Bon Marché, Tartine et Chocolat chez Harrods.", "/mag/corner-byredo-bon-marche-agencement/"],
      ["Rénovation et embellissement", "Rénovation complète ou embellissement, comme chez Colette et Petite Mendigote.", "/renovation/interieur/"],
      ["Travaux en magasin ouvert", "Un chantier organisé autour de l'activité de la boutique.", "/mag/travaux-site-occupe-hotel-boutique/"],
      ["Conception sur mesure", "Un architecte et un architecte d'intérieur dans l'équipe.", "/conception-sur-mesure/"],
    ],
  },
  {
    category: "restaurant",
    path: "/restaurants/",
    nav: "Restaurants",
    title: "Rénovation de restaurants à Paris : travaux et mise aux normes | EMBI",
    description: "Fish Club, Loustic, Café Pinson, Mojo Kitchen, Triomphe : EMBI rénove et transforme des restaurants à Paris, de la plomberie à la décoration, dans le respect des normes de la restauration.",
    kicker: "Restaurants",
    h1: "Rénovation de restaurants, <em>de la plomberie à la décoration.</em>",
    lead: "Fish Club, Loustic, Café Pinson, Mojo Kitchen, Triomphe : EMBI rénove et transforme des restaurants parisiens, de la plomberie à la décoration, dans le respect de toutes les normes de la restauration.",
    paragraphs: [
      "EMBI a notamment réalisé des chantiers sur des décorations signées Dorothée Meilichzon et Richard Lafond, et transformé un ancien magasin en restaurant (Loustic).",
      "Les travaux peuvent comprendre la mise aux normes : sanitaires, circulations (PMR), sécurité incendie, électricité.",
    ],
    card: "Transformation complète, rénovation, décoration et mise aux normes de la restauration.",
    phare: "cafe-pinson",
    prestations: [
      ["Transformation complète", "Un ancien magasin transformé en restaurant, comme Loustic.", "/realisations/loustic/"],
      ["Plomberie et électricité", "Tous les corps de métier coordonnés, de la plomberie à l'électricité.", "/renovation/interieur/"],
      ["Mise aux normes", "Sanitaires, circulations (PMR), sécurité incendie, électricité.", "/mag/mise-aux-normes-electriques-quand-comment/"],
      ["Décorations signées", "Des chantiers sur des décorations signées Dorothée Meilichzon et Richard Lafond.", "/realisations/"],
      ["Conception sur mesure", "Un architecte et un architecte d'intérieur dans l'équipe.", "/conception-sur-mesure/"],
    ],
  },
  {
    category: "particulier",
    // plus de page à part : la rénovation d'appartement est une partie de la page Rénovation intérieure
    // (l'ancienne adresse /particuliers/ y est redirigée)
    path: "/renovation/interieur/#appartement",
    page: false,
    nav: "Particuliers",
    title: "Rénovation d'appartement à Paris pour les particuliers | EMBI",
    description: "Rénovation et mise aux normes d'appartements à Paris : plomberie, électricité, revêtements, isolation, décoration. EMBI réalise vos travaux avec un seul interlocuteur, de l'étude à la livraison.",
    kicker: "Particuliers",
    h1: "Rénovation d'appartements <em>à Paris.</em>",
    lead: "Aménagement et rénovation d'intérieur pour votre habitation (maison, appartement…) : EMBI rénove et remet aux normes des appartements de particuliers, y compris sur le projet d'un architecte.",
    paragraphs: [
      "L'un de nos chantiers : la rénovation et la mise aux normes d'un appartement, sur un projet de l'architecte Diego Delgado Elias.",
      "Professionnel ou particulier, vous trouverez la prestation qu'il vous faut. Petits ou grands projets, nous sommes à votre écoute.",
    ],
    card: "Rénovation et mise aux normes d'appartements : plomberie, électricité, isolation, décoration.",
    extraWorks: ["Plomberie", "Électricité", "Revêtements muraux", "Isolation", "Décoration"],
  },
];
