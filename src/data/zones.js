/*
 * ─────────────────────────────────────────────────────────────
 *  ZONES D'INTERVENTION : une page par zone → /zones/<slug>/, et la page /zones/ qui les réunit.
 *  Chaque page relie tous les métiers (src/data/metiers.js) : « plombier Paris 17e », « carreleur Paris 7e »…
 *  sont couverts par le maillage, sans pages en double.
 *
 *  slug · nom (court) · dans (« dans le 17e », « en Île-de-France ») · cp (codes postaux) · quartiers
 *  texte : ["paragraphe", …] propre à la zone (bâti, contraintes, quartiers) · projets : chantiers situés dans la zone
 *  Règle : ne citer un chantier que si son adresse est connue (champ « lieu » de projects.js).
 * ─────────────────────────────────────────────────────────────
 */
const A = (n, slug, quartiers, texte, extra = {}) => ({
  slug, nom: `Paris ${n}`, dans: `dans le ${n.replace(/^1er$/, "1er")}`, cp: [`750${slug.replace(/\D/g, "").padStart(2, "0")}`], quartiers, texte, type: "arrondissement", ...extra,
});
module.exports = [
  A("1er", "paris-1er", ["Louvre", "Palais-Royal", "Les Halles", "Place Vendôme", "Saint-Honoré"], [
    "Le 1er réunit des immeubles anciens parmi les plus prestigieux de Paris, des hôtels particuliers et les boutiques de la rue Saint-Honoré et de la place Vendôme. Les travaux y demandent une attention particulière aux façades, aux parties communes et aux horaires de livraison.",
    "Boutiques de luxe, hôtels et appartements de caractère : EMBI y mène des chantiers où la finition compte autant que le planning, souvent en site occupé.",
  ]),
  A("2e", "paris-2e", ["Sentier", "Bourse", "Montorgueil", "Galerie Vivienne"], [
    "Entre la Bourse, le Sentier et Montorgueil, le 2e mêle immeubles de rapport, anciens ateliers et passages couverts du XIXe siècle. Les rues étroites et piétonnes rendent la logistique de chantier décisive : livraisons, évacuation des gravats, stationnement.",
    "Restaurants, hôtels de charme, boutiques et appartements sous les toits : nous adaptons l'organisation du chantier à chaque rue.",
  ]),
  A("3e", "paris-3e", ["Haut-Marais", "Arts-et-Métiers", "Temple"], [
    "Le Haut-Marais est couvert par le plan de sauvegarde et de mise en valeur du Marais : façades, menuiseries extérieures et certains éléments intérieurs y sont protégés, et les travaux passent par l'avis de l'Architecte des Bâtiments de France.",
    "Hôtels particuliers, anciens ateliers transformés, boutiques de créateurs et restaurants : EMBI prépare les dossiers et respecte les prescriptions patrimoniales du secteur.",
  ]),
  A("4e", "paris-4e", ["Marais", "Île Saint-Louis", "Île de la Cité", "Saint-Paul"], [
    "Marais, île Saint-Louis, île de la Cité : le 4e concentre un bâti très ancien, souvent protégé par le plan de sauvegarde du Marais. Poutres, tomettes, escaliers et menuiseries d'origine se conservent et se restaurent plutôt qu'ils ne se remplacent.",
    "Sur les îles, l'accès est un sujet à lui seul : nous organisons les approvisionnements et l'évacuation en conséquence.",
  ]),
  A("5e", "paris-5e", ["Quartier latin", "Panthéon", "Jardin des Plantes", "Mouffetard"], [
    "Le Quartier latin, la Montagne Sainte-Geneviève et le Jardin des Plantes : immeubles anciens et haussmanniens, parquets, moulures et cheminées à préserver dans des appartements souvent très recherchés.",
    "Dans le 5e, EMBI a rénové un appartement haussmannien en gardant son caractère : parquet remis à neuf, moulures, lambris, bibliothèques sur mesure, cuisine en zellige noir.",
  ], { projets: ["appartement-paris-5e"] }),
  A("6e", "paris-6e", ["Saint-Germain-des-Prés", "Odéon", "Luxembourg", "Saint-Sulpice"], [
    "Saint-Germain-des-Prés, Odéon, Luxembourg : le 6e associe appartements de prestige, galeries, maisons d'édition, hôtels et boutiques de luxe. Les copropriétés y sont exigeantes sur les horaires, le bruit et la protection des parties communes.",
    "Nous organisons ces chantiers avec le syndic et le gardien, pour des travaux soignés dans des immeubles anciens.",
  ]),
  A("7e", "paris-7e", ["Faubourg Saint-Germain", "Invalides", "Gros-Caillou", "Sèvres-Babylone"], [
    "Une grande partie du 7e est couverte par le plan de sauvegarde et de mise en valeur du 7e arrondissement : hôtels particuliers du faubourg Saint-Germain, immeubles haussmanniens et grands magasins y sont soumis à des règles patrimoniales strictes.",
    "Rue Saint-Dominique, EMBI a entièrement rénové un appartement avec menuiseries sur mesure vert sauge ; au Bon Marché, nous avons réalisé le corner Byredo.",
  ], { projets: ["appartement-rue-saint-dominique", "byredo"] }),
  A("8e", "paris-8e", ["Champs-Élysées", "Faubourg Saint-Honoré", "Monceau", "Madeleine", "Avenue Montaigne"], [
    "Avenue Montaigne, faubourg Saint-Honoré, Monceau, Madeleine : le 8e réunit maisons de luxe, hôtels, bureaux de prestige et grands appartements haussmanniens.",
    "Les boutiques y ouvrent à date fixe : EMBI cale le chantier sur votre calendrier d'ouverture, avec les finitions exigées par les marques.",
  ]),
  A("9e", "paris-9e", ["Opéra", "Grands Boulevards", "Pigalle", "Nouvelle Athènes", "Saint-Georges"], [
    "Opéra, Grands Boulevards, Nouvelle Athènes, Pigalle : le 9e mêle immeubles haussmanniens, hôtels particuliers et une forte concentration d'hôtels et de restaurants, dont beaucoup se sont réinventés ces dernières années.",
    "Hôtels de charme, restaurants et appartements : nous menons les rénovations en site occupé quand l'établissement doit rester ouvert.",
  ]),
  A("10e", "paris-10e", ["Canal Saint-Martin", "Gare du Nord", "Gare de l'Est", "Faubourg Saint-Denis"], [
    "Le long du canal Saint-Martin et autour des gares, le 10e associe immeubles faubouriens, cours, anciens ateliers et passages. Beaucoup de lieux s'y transforment en restaurants, hôtels ou lofts.",
    "Transformer un ancien atelier ou une boutique en restaurant demande de reprendre les réseaux, l'extraction et les normes : c'est le type de chantier que nous menons de bout en bout.",
  ]),
  A("11e", "paris-11e", ["Bastille", "Oberkampf", "République", "Faidherbe"], [
    "Bastille, Oberkampf, Faidherbe : le 11e est l'un des arrondissements les plus denses de Paris, avec ses cours, ses passages et ses anciens ateliers d'artisans devenus logements, cafés ou boutiques.",
    "Ateliers transformés en lofts, cafés et restaurants, appartements d'immeubles faubouriens : nous adaptons les travaux à ces bâtis anciens et souvent atypiques.",
  ]),
  A("12e", "paris-12e", ["Bercy", "Nation", "Daumesnil", "Aligre", "Bel-Air"], [
    "Du marché d'Aligre à Bercy et de Nation au bois de Vincennes, le 12e offre une grande variété de bâti : immeubles haussmanniens, faubouriens et résidences plus récentes.",
    "Rénovations complètes d'appartements, salles de bain, cuisines, commerces de quartier : nous intervenons sur l'ensemble de l'arrondissement.",
  ]),
  A("13e", "paris-13e", ["Butte-aux-Cailles", "Gobelins", "Paris Rive Gauche", "Maison-Blanche"], [
    "Entre la Butte-aux-Cailles et ses petites maisons, les Gobelins et les immeubles de Paris Rive Gauche, le 13e passe de la maison de ville à la tour en quelques rues.",
    "Maisons de ville, appartements anciens ou récents : chaque bâti a ses contraintes, de l'accès au chantier aux règles de la copropriété.",
  ]),
  A("14e", "paris-14e", ["Montparnasse", "Alésia", "Denfert-Rochereau", "Plaisance"], [
    "Montparnasse, Alésia, Denfert-Rochereau : le 14e compte des ateliers d'artistes, des villas et maisons de ville, et de nombreux immeubles anciens.",
    "Ateliers sous verrière, maisons de ville et appartements familiaux : nous menons des rénovations complètes, de la structure aux finitions.",
  ]),
  A("15e", "paris-15e", ["Vaugirard", "Grenelle", "Beaugrenelle", "Convention"], [
    "Le 15e, le plus peuplé de Paris, compte une grande majorité d'appartements familiaux, des immeubles haussmanniens et des résidences des années 1960 à 1980.",
    "Redistribuer un appartement, créer une chambre de plus, rénover une salle de bain ou une cuisine : nous intervenons dans tous les types d'immeubles du 15e.",
  ]),
  A("16e", "paris-16e", ["Passy", "Auteuil", "Trocadéro", "La Muette"], [
    "Passy, Auteuil, Trocadéro : le 16e réunit grands appartements haussmanniens, immeubles Art nouveau et Art déco, hôtels particuliers et villas.",
    "Rénovations d'exception, conception sur mesure avec notre architecte d'intérieur, respect des éléments d'origine : moulures, parquets, cheminées, ferronneries.",
  ]),
  A("17e", "paris-17e", ["Batignolles", "Ternes", "Plaine-Monceau", "Épinettes"], [
    "Le 17e est notre arrondissement : notre bureau et notre showroom carrelages et parquets se trouvent au 5, rue Villebois-Mareuil, aux Ternes. Vous pouvez y voir les matériaux avant de décider.",
    "Des Batignolles à la Plaine-Monceau, l'arrondissement compte de nombreux immeubles haussmanniens. Rue Nollet, nous avons mené le ravalement de la façade en pierre d'un immeuble d'angle.",
  ], { projets: ["ravalement-rue-nollet"] }),
  A("18e", "paris-18e", ["Montmartre", "Abbesses", "Goutte-d'Or", "Clignancourt"], [
    "Montmartre et ses rues en pente, les Abbesses, la Goutte-d'Or : le 18e compte des immeubles anciens, des ateliers d'artistes et des maisons, souvent avec des accès difficiles pour les livraisons.",
    "Nous organisons ces chantiers en conséquence et intervenons aussi sur les toits-terrasses, comme sur une terrasse avec vue sur le Sacré-Cœur.",
  ]),
  A("19e", "paris-19e", ["Buttes-Chaumont", "La Villette", "Jaurès", "Place des Fêtes"], [
    "Des Buttes-Chaumont au bassin de la Villette, le 19e offre des immeubles anciens, des villas et des résidences plus récentes, ainsi que d'anciens locaux industriels transformés.",
    "Appartements, maisons de ville, lofts : nous intervenons sur l'ensemble de l'arrondissement, de la rénovation complète aux travaux ciblés.",
  ]),
  A("20e", "paris-20e", ["Belleville", "Ménilmontant", "Père-Lachaise", "Gambetta"], [
    "Belleville, Ménilmontant, Père-Lachaise : le 20e associe immeubles faubouriens, villas, maisons et anciens ateliers, sur un relief parfois marqué.",
    "Ateliers transformés, maisons de ville, appartements anciens : nous rénovons en tenant compte du bâti et des accès propres à chaque rue.",
  ]),
  {
    slug: "ile-de-france", nom: "Île-de-France", dans: "en Île-de-France", type: "region",
    cp: ["92", "93", "94", "78", "91", "95", "77"],
    quartiers: ["Hauts-de-Seine (92)", "Seine-Saint-Denis (93)", "Val-de-Marne (94)", "Yvelines (78)", "Essonne (91)", "Val-d'Oise (95)", "Seine-et-Marne (77)"],
    texte: [
      "Au-delà de Paris, EMBI intervient dans toute l'Île-de-France : Neuilly-sur-Seine, Levallois-Perret et Boulogne-Billancourt à deux pas de notre showroom du 17e, mais aussi Saint-Germain-en-Laye, Versailles, Vincennes, Saint-Mandé et l'ensemble des départements franciliens.",
      "Maisons, appartements, hôtels, commerces et restaurants : les mêmes équipes, le même interlocuteur et la même exigence qu'à Paris.",
    ],
  },
  {
    slug: "france", nom: "France entière", dans: "partout en France", type: "region",
    cp: [],
    quartiers: ["Bretagne", "Normandie", "Côte d'Azur", "Alpes", "Grandes villes de province"],
    texte: [
      "EMBI suit ses clients partout en France : boutiques et corners de marques, hôtels, maisons de famille et projets spécifiques. À Ploërmel, dans le Morbihan, nous avons aménagé de bout en bout un atelier de haute joaillerie.",
      "Pour un chantier hors d'Île-de-France, l'organisation est la même : un interlocuteur dédié, une étude de faisabilité, un devis détaillé et la coordination de tous les corps de métier jusqu'à la livraison.",
    ],
    projets: ["atelier-joaillerie-ploermel"],
  },
];
