/*
 * ─────────────────────────────────────────────────────────────
 *  QUESTIONS FRÉQUENTES : une FAQ en bas de chaque page, juste avant le devis.
 *  Clé = adresse de la page. Chaque entrée : ["Question ?", "Réponse."]
 *  Dans une réponse, [texte](/adresse/) devient un lien (et du texte simple
 *  dans les données structurées FAQPage pour Google).
 *  Les FAQ des pages Rénovation intérieure / extérieure sont dans services.js,
 *  celles des articles du Mag dans articles.js.
 *  Réponses composées à partir des textes du site : pas de prix, de délais
 *  chiffrés ni de garanties qui n'y figurent pas déjà. À RELIRE.
 * ─────────────────────────────────────────────────────────────
 */
const TEL = "01 45 72 65 24";
const URG = "06 31 60 01 35";

const PAGES = {
  "/": [
    ["Quels types de lieux rénovez-vous ?", "Hôtels, boutiques, restaurants, bureaux, appartements et maisons de particuliers. Professionnel ou particulier, petits ou grands projets : vous trouverez la prestation qu'il vous faut. Voir nos [réalisations](/realisations/)."],
    ["Que veut dire « rénovation clé en main » ?", "EMBI prend en charge tout le projet, de l'étude de faisabilité à la livraison : conception, devis poste par poste, coordination des 40 professionnels de tous corps de métier, suivi du chantier. Vous n'avez qu'un seul interlocuteur dédié."],
    ["Où intervenez-vous ?", "À Paris et en Île-de-France. Notre bureau et notre showroom se trouvent au 5, rue Villebois-Mareuil, dans le 17e arrondissement."],
    ["Le devis est-il gratuit ?", `Oui. Décrivez votre projet en 3 questions ou appelez le ${TEL} : après l'étude de faisabilité, nous établissons avec vous un devis gratuit et transparent, poste par poste.`],
    ["Avez-vous un architecte dans l'équipe ?", "Oui, un architecte et un architecte d'intérieur dessinent les projets que nos équipes réalisent ensuite. Voir la [conception sur mesure](/conception-sur-mesure/)."],
    ["Que faire en cas d'urgence ?", `En dehors des heures d'ouverture du bureau, une ligne dédiée répond pour la plomberie, l'électricité et l'assainissement : ${URG}. Voir la page [Urgence](/urgence/).`],
  ],

  "/hotels/": [
    ["Pouvez-vous rénover l'ensemble d'un hôtel ?", "Oui. À l'Hôtel Panache, au Grand Pigalle ou à l'Hôtel Bienvenue, EMBI a mené l'embellissement et la rénovation de l'ensemble du bâtiment, avec un seul interlocuteur du début à la fin."],
    ["Quelles mises aux normes hôtelières prenez-vous en charge ?", "Les sanitaires, les circulations et l'accessibilité PMR, la sécurité incendie et l'électricité. Ces travaux sont menés en parallèle de la décoration, dans le même chantier."],
    ["Peut-on rénover un hôtel sans le fermer ?", "Les travaux en site occupé sont possibles, à condition d'être pensés comme tels dès le départ : phasage, protections, circulations des clients. Nous en parlons dès l'étude de faisabilité. Lire notre article sur les [travaux en site occupé](/mag/travaux-site-occupe-hotel-boutique/)."],
    ["Travaillez-vous avec le décorateur de l'hôtel ?", "Oui. À l'Hôtel Paradis, nous avons réalisé les travaux sur une décoration imaginée par Dorothée Meilichzon. Si vous n'avez pas de décorateur, notre architecte d'intérieur peut dessiner le projet."],
    ["Qui suit le chantier au quotidien ?", "Un interlocuteur dédié, pendant toute la durée du chantier. Il coordonne les corps de métier, suit le planning et répond à vos questions, jusqu'à la livraison."],
  ],

  "/boutiques/": [
    ["Pouvez-vous créer une boutique de A à Z ?", "Oui. Pour Loro Piana, EMBI a pris en charge la création complète de la boutique. Nous réalisons aussi des rénovations complètes (Colette) et des embellissements (Petite Mendigote)."],
    ["Intervenez-vous dans les grands magasins ?", "Oui : corner Byredo au Bon Marché, boutique Tartine et Chocolat chez Harrods. On y travaille au sein d'un magasin en activité, avec ses règles et ses horaires. Lire notre article sur le [corner Byredo](/mag/corner-byredo-bon-marche-agencement/)."],
    ["Respectez-vous le cahier des charges d'une marque ?", "C'est le cœur de nos chantiers Signature : l'interlocuteur dédié, l'architecte, l'architecte d'intérieur et nos professionnels sont coordonnés pour tenir le niveau d'exigence de chaque marque. Voir [Signature](/signature/)."],
    ["Pouvez-vous dessiner l'agencement de la boutique ?", "Oui. Notre architecte d'intérieur conçoit l'agencement et le mobilier sur mesure, puis nos équipes le réalisent. Voir la [conception sur mesure](/conception-sur-mesure/)."],
    ["Peut-on rénover sans fermer la boutique ?", "C'est possible si le chantier est organisé pour cela dès le départ. Nous étudions le phasage avec vous lors de l'étude de faisabilité. Lire notre article sur les [travaux en site occupé](/mag/travaux-site-occupe-hotel-boutique/)."],
  ],

  "/restaurants/": [
    ["Pouvez-vous transformer un local en restaurant ?", "Oui. Loustic était à l'origine un magasin : EMBI a entièrement transformé le lieu et pris en charge tout le chantier, de la plomberie à la décoration."],
    ["Les normes de la restauration sont-elles prises en compte ?", "Oui. Les travaux peuvent comprendre la mise aux normes des sanitaires, des circulations (PMR), de la sécurité incendie et de l'électricité, comme au Café Pinson, rénové dans le respect de toutes les normes de la restauration."],
    ["Travaillez-vous avec des décorateurs ?", "Oui. Nous avons réalisé des chantiers sur des décorations signées Dorothée Meilichzon (Fish Club, Loustic, Café Pinson, Mojo Kitchen) et Richard Lafond (Triomphe)."],
    ["Vous occupez-vous de la plomberie et de l'électricité ?", "Oui. Plomberie, électricité, revêtements, menuiserie, peinture : tous les corps de métier sont coordonnés par votre interlocuteur dédié."],
    ["Peut-on rester ouvert pendant les travaux ?", "Selon les travaux, c'est possible si le chantier est pensé pour cela dès le départ. Lire notre article sur les [travaux en site occupé](/mag/travaux-site-occupe-hotel-boutique/)."],
  ],

  "/particuliers/": [
    ["Acceptez-vous les petits projets ?", "Oui. Petits ou grands projets, nous sommes à votre écoute : de la salle de bain à la rénovation complète d'un appartement."],
    ["Rénovez-vous aussi les maisons ?", "Oui. EMBI réalise l'aménagement et la rénovation d'intérieur de votre habitation, maison ou appartement, et intervient aussi sur les façades et les toitures. Voir la [rénovation extérieure](/renovation/exterieur/)."],
    ["J'ai déjà un architecte : pouvez-vous réaliser son projet ?", "Oui. Nous avons par exemple rénové et remis aux normes un appartement sur un projet de l'architecte Diego Delgado Elias. Sinon, notre propre architecte et notre architecte d'intérieur peuvent concevoir le projet."],
    ["Pouvez-vous remettre l'électricité aux normes ?", "Oui, la mise aux normes électriques fait partie de nos rénovations intérieures. Lire notre article : [mise aux normes électriques](/mag/mise-aux-normes-electriques-quand-comment/)."],
    ["Rénovez-vous les appartements haussmanniens ?", "Oui, en respectant ce qui fait leur charme : moulures, parquets, cheminées. Lire nos conseils pour [rénover un appartement haussmannien](/mag/renovation-appartement-haussmannien-paris/)."],
    ["Où choisir mon carrelage ou mon parquet ?", "Dans notre [showroom](/showroom/) du 17e, du lundi au vendredi de 10h à 18h : vous voyez les vraies couleurs et touchez les matières avant de décider."],
  ],

  "/renovation/": [
    ["Quelle différence entre rénovation intérieure et extérieure ?", "L'intérieur couvre la plomberie, l'électricité, les sols et revêtements, l'isolation, la décoration et la rénovation énergétique. L'extérieur couvre le ravalement, les menuiseries, les balcons, les vérandas, les toitures et les terrasses."],
    ["Où trouver la rénovation énergétique ?", "Elle fait partie de la [rénovation intérieure](/renovation/interieur/#energetique) : isolation, fenêtres, ventilation, chauffage et eau chaude."],
    ["Pouvez-vous mener l'intérieur et l'extérieur dans le même chantier ?", "Oui. EMBI intervient de la fondation jusqu'au toit et coordonne tous les corps de métier, avec un seul interlocuteur pour l'ensemble des travaux."],
    ["Combien coûte une rénovation ?", "Chaque projet est différent : le prix dépend du lieu, de la surface et des travaux. Après l'étude de faisabilité, nous établissons avec vous un devis gratuit, poste par poste."],
    ["Faut-il une autorisation pour mes travaux ?", "Les travaux qui modifient l'aspect extérieur d'un bâtiment demandent en général une déclaration préalable en mairie. Notre architecte vous accompagne pour les autorisations de travaux."],
  ],

  "/conception-sur-mesure/": [
    ["Quelle différence entre l'architecte et l'architecte d'intérieur ?", "L'architecte pense les volumes, la structure et les plans. L'architecte d'intérieur pense l'usage, la lumière, les matières et le mobilier. Chez EMBI, ils travaillent ensemble, avec les équipes qui construisent."],
    ["Comment se passe le premier rendez-vous ?", "Nous découvrons votre lieu, vos usages, vos envies et votre budget. L'architecte et l'architecte d'intérieur vous proposent ensuite un projet, en plans et en croquis."],
    ["Pourrai-je voir le projet avant les travaux ?", "Oui : plans, croquis et perspectives, puis une planche de matières composée avec vous, notamment à partir des échantillons de notre showroom."],
    ["Quels aménagements sur mesure réalisez-vous ?", "Dressings, bibliothèques, cuisines, salles de bain, verrières et cloisons, ainsi que l'agencement de boutiques et d'hôtels."],
    ["Ceux qui dessinent suivent-ils le chantier ?", "Oui. Nos équipes réalisent les travaux, suivies par ceux qui ont dessiné le projet. Le projet et le chantier restent entre les mêmes mains."],
    ["Vous occupez-vous des autorisations ?", "L'architecte étudie la faisabilité technique et réglementaire de votre projet et vous accompagne pour les autorisations de travaux."],
  ],

  "/savoir-faire/": [
    ["Quels corps de métier coordonnez-vous ?", "Quatre grands domaines : gros œuvre et grands chantiers, rénovations intérieures, façades et extérieurs, toitures et terrasses. Soit 40 professionnels qualifiés, coordonnés par un seul interlocuteur."],
    ["Intervenez-vous sur le gros œuvre ?", "Oui : structure métallique ou bois, ouvertures de baies, normes coupe-feu, construction de maison ou rénovation totale de locaux professionnels."],
    ["Faites-vous aussi les petits travaux ?", "Oui. Professionnel ou particulier, petits ou grands projets, nous sommes à votre écoute."],
    ["Que contient votre contrat de rénovation ?", "Nos engagements : un interlocuteur unique dédié, le respect des délais, la réactivité, la sécurité à tous les niveaux, un rapport qualité-prix optimisé, des professionnels qualifiés et le respect de l'environnement."],
    ["Faut-il plusieurs devis pour plusieurs corps de métier ?", "Non. Vous recevez un seul devis, détaillé poste par poste, et un seul interlocuteur coordonne l'ensemble des équipes."],
  ],

  "/methode/": [
    ["Comment se déroule un chantier EMBI ?", "En 5 étapes : étude de faisabilité, chiffrage, mise en place, réalisation, livraison. Un interlocuteur dédié vous accompagne de la première à la dernière."],
    ["À quel moment reçoit-on le devis ?", "Après l'étude de faisabilité et avant la phase de travaux. Il est réalisé ensemble, en toute transparence, poste par poste, et il est gratuit."],
    ["Que se passe-t-il avant le premier jour de travaux ?", "Nous définissons et signons ensemble les termes qui guideront tout le chantier, puis nous installons et protégeons les lieux."],
    ["Qui coordonne les équipes pendant les travaux ?", "Votre interlocuteur dédié. Il coordonne nos équipes spécialisées (électricité, sols, peinture…) et vous tient informé."],
    ["Comment se passe la livraison ?", "Un expert EMBI vous présente l'intégralité des travaux et répond à toutes vos questions."],
  ],

  "/showroom/": [
    ["Quand et où se trouve le showroom ?", `Au 5, rue Villebois-Mareuil, 75017 Paris, du lundi au vendredi de 10h à 18h. Une question avant de venir ? Appelez le ${TEL}.`],
    ["Quelles marques peut-on y voir ?", "Les carrelages Azulev, Cifre, Novaceram, Recer et Boxer, ainsi que nos parquets. Les catalogues sont aussi consultables en ligne sur cette page."],
    ["Que faut-il apporter ?", "Vos mesures, des photos de la pièce et une idée du style recherché : plus nous en savons, mieux nous vous conseillons."],
    ["Pouvez-vous poser le carrelage ou le parquet choisi ?", "Oui. Votre sélection est intégrée au devis de vos travaux, puis posée par nos équipes : un seul interlocuteur, du showroom au chantier."],
    ["Peut-on venir sans projet de travaux avec EMBI ?", "Le showroom est ouvert à tous ceux qui veulent voir et toucher les matières. Nos experts vous conseillent selon la pièce, l'usage et le style recherché."],
  ],

  "/contact/": [
    ["Le devis est-il gratuit ?", "Oui, toujours. Il est établi après l'étude de faisabilité, poste par poste et en toute transparence."],
    ["Que se passe-t-il après l'envoi de ma demande ?", "Votre interlocuteur dédié vous recontacte pour parler de votre projet, puis nous réalisons l'étude de faisabilité et le devis."],
    ["Quelles informations donner dans ma demande ?", "Le type de lieu, la surface approximative, l'échéance souhaitée et les travaux envisagés. Si un de nos chantiers ressemble à votre projet, citez-le."],
    ["Quels sont vos horaires ?", `Le bureau et le showroom vous accueillent du lundi au vendredi, de 10h à 18h. Téléphone : ${TEL}, e-mail : sec@embi.fr.`],
    ["Et en dehors des horaires du bureau ?", `Pour une urgence de plomberie, d'électricité ou d'assainissement, appelez la ligne dédiée : ${URG}. Voir la page [Urgence](/urgence/).`],
  ],

  "/urgence/": [
    ["Quand appeler la ligne d'urgence ?", `En dehors des heures d'ouverture du bureau, pour un imprévu de plomberie, d'électricité ou d'assainissement : ${URG}. Pendant les heures de bureau, appelez le ${TEL}.`],
    ["Quelles urgences prenez-vous en charge ?", "Fuite d'eau et dégât des eaux, chauffe-eau en panne, panne de courant ou disjoncteur qui saute, canalisation bouchée ou évacuation qui refoule."],
    ["Que faire en attendant l'intervention ?", "Au téléphone, nous vous disons tout de suite comment sécuriser les lieux. Les bons réflexes sont rappelés plus haut sur cette page et dans notre article [fuite d'eau, panne, canalisation bouchée](/mag/fuite-eau-urgence-paris-que-faire/)."],
    ["Après l'urgence, pouvez-vous réparer durablement ?", "Oui : mise aux normes, rénovation complète de l'installation électrique, remise en état des évacuations. Le devis est gratuit."],
    ["Intervenez-vous pour les professionnels ?", "Oui, chez les particuliers comme dans les locaux professionnels : hôtels, restaurants, boutiques et bureaux."],
  ],

  "/signature/": [
    ["Qu'est-ce qu'un chantier Signature ?", "Les projets où chaque détail compte : maisons de luxe, corners en grand magasin, hôtels rénovés de fond en comble, décors signés par de grands designers."],
    ["Travaillez-vous en grand magasin ?", "Oui : corner Byredo au Bon Marché, boutique Tartine et Chocolat chez Harrods. Ces chantiers se mènent au sein d'un magasin en activité, avec ses règles et ses horaires."],
    ["Pouvez-vous réaliser le décor d'un designer ?", "Oui. Nous avons réalisé clé en main des décorations signées Dorothée Meilichzon ou Richard Lafond, en donnant corps au dessin dans le respect de chaque intention."],
    ["Qui mène un chantier Signature ?", "La même équipe que pour tous nos chantiers : un interlocuteur dédié, un architecte, un architecte d'intérieur et 40 professionnels de tous corps de métier."],
    ["Pouvez-vous respecter les standards d'une marque de luxe ?", "C'est notre exigence : chez Loro Piana, Colette ou Byredo, la marque devait se lire dans chaque finition."],
  ],

  "/projets-specifiques/": [
    ["Qu'appelez-vous un projet spécifique ?", "Un lieu ou une contrainte qui sort du cadre d'une rénovation classique : corner en grand magasin, boutique de luxe, atelier, agencement dessiné sur mesure, travaux dans un lieu qui reste ouvert."],
    ["Travaillez-vous dans les grands magasins ?", "Oui : corner Byredo au Bon Marché, boutique Tartine et Chocolat chez Harrods. On y travaille au sein d'un magasin en activité, avec ses règles et ses horaires."],
    ["Pouvez-vous dessiner l'agencement ?", "Oui. Notre architecte d'intérieur conçoit l'agencement et le mobilier sur mesure, puis nos équipes le réalisent. Voir la [conception sur mesure](/conception-sur-mesure/)."],
    ["Mon projet ne rentre dans aucune case, pouvez-vous l'étudier ?", `Oui. Décrivez-le en 3 questions ou appelez le ${TEL} : l'étude de faisabilité et le devis sont gratuits.`],
  ],

  "/qualifications/": [
    ["Qui réalise les travaux ?", "Un réseau de 40 professionnels de tous corps de métier : gros œuvre, plomberie, électricité, menuiserie, revêtements, peinture, façades, toitures, coordonnés par un interlocuteur dédié."],
    ["J'ai une question sur vos assurances, qui contacter ?", `Appelez le bureau au ${TEL}, du lundi au vendredi de 10h à 18h, ou [écrivez-nous](/contact/).`],
  ],

  "/equipe/": [
    ["Qui sera mon interlocuteur ?", "Un interlocuteur dédié, du premier rendez-vous à la remise des clés. Il coordonne les équipes, suit le planning et répond à vos questions."],
    ["Qui réalise les travaux ?", "Un réseau de 40 professionnels de tous corps de métier : gros œuvre, plomberie, électricité, menuiserie, revêtements, peinture, façades, toitures."],
    ["Que fait l'architecte d'intérieur ?", "Il pense l'usage, la lumière et les matières : aménagement, croquis, choix des matériaux et mobilier sur mesure. L'architecte, lui, s'occupe des volumes, de la structure et des plans."],
    ["Depuis quand EMBI existe-t-elle ?", "Depuis plus de dix ans, EMBI rénove hôtels, boutiques, restaurants et appartements parisiens."],
    ["Peut-on rencontrer l'équipe ?", `Oui, au bureau et showroom du 17e, du lundi au vendredi de 10h à 18h. Appelez le ${TEL} ou [écrivez-nous](/contact/) pour convenir d'un rendez-vous.`],
  ],

  "/realisations/": [
    ["Quels types de chantiers avez-vous réalisés ?", "Des hôtels (Hôtel Panache, Le Grand Pigalle, Hôtel Paradis…), des boutiques (Loro Piana, Byredo, Colette…), des restaurants (Fish Club, Loustic, Café Pinson…) et des appartements de particuliers."],
    ["Tous ces chantiers ont-ils été menés clé en main ?", "Oui, chacun a été mené par EMBI et son réseau de 40 professionnels, avec un seul interlocuteur de l'étude à la livraison."],
    ["Travaillez-vous avec des architectes et des décorateurs ?", "Oui : décorations signées Dorothée Meilichzon ou Richard Lafond, projet de l'architecte Diego Delgado Elias. Nous avons aussi notre propre architecte et notre architecte d'intérieur."],
    ["Mon projet ressemble à l'un de ces chantiers : que faire ?", "Citez-le dans votre demande de devis : cela nous aide à comprendre votre projet. Le devis est gratuit."],
  ],

  "/mag/": [
    ["De quoi parle le Mag ?", "De rénovation intérieure, énergétique et extérieure, des bons réflexes en cas d'urgence et des coulisses de nos chantiers d'hôtels et de boutiques à Paris."],
    ["Ces conseils remplacent-ils une visite ?", "Non. Chaque lieu est différent : l'étude de faisabilité permet de valider les travaux adaptés à votre projet. Elle est suivie d'un devis gratuit."],
    ["Puis-je vous poser une question sur un article ?", `Bien sûr : appelez le ${TEL} ou [écrivez-nous](/contact/).`],
  ],
};

// Pages chantier : quelques questions tirées des données du chantier (src/data/projects.js)
const BY_CAT = {
  hotel: ["Pouvez-vous rénover mon hôtel sans le fermer ?", "C'est possible si le chantier est pensé pour cela dès le départ : nous en parlons dès l'étude de faisabilité. Lire notre article sur les [travaux en site occupé](/mag/travaux-site-occupe-hotel-boutique/)."],
  boutique: ["Intervenez-vous aussi en grand magasin ?", "Oui : corner Byredo au Bon Marché, boutique Tartine et Chocolat chez Harrods. Nous y travaillons avec les règles et les horaires du magasin."],
  restaurant: ["Les normes de la restauration sont-elles prises en compte ?", "Oui : sanitaires, circulations (PMR), sécurité incendie et électricité peuvent être mis aux normes dans le même chantier que la décoration."],
  particulier: ["Pouvez-vous travailler avec mon architecte ?", "Oui. Nous réalisons aussi les projets d'architectes extérieurs, et notre propre architecte et notre architecte d'intérieur peuvent concevoir le vôtre."],
};
const SIMILAR = { hotel: "mon hôtel", boutique: "ma boutique", restaurant: "mon restaurant", particulier: "mon appartement" };
const PLURAL = { hotel: "des hôtels", boutique: "des boutiques", restaurant: "des restaurants", particulier: "des appartements" };
const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);

const project = (p, sectorPath) => [
  ["Quels travaux EMBI a-t-elle réalisés sur ce chantier ?", p.text || `Un chantier mené clé en main, de l'étude de faisabilité à la livraison : ${(p.travaux || ["rénovation"]).map(lc).join(", ")}.`],
  ...(p.deco ? [["Qui a signé la décoration ?", `La décoration est signée ${p.deco}. EMBI a réalisé les travaux clé en main, dans le respect de son dessin.`]] : []),
  ...(p.archi ? [["Qui a conçu le projet ?", `Le projet est signé par l'architecte ${p.archi}. EMBI en a réalisé les travaux et la mise aux normes.`]] : []),
  [`Pouvez-vous réaliser un projet similaire pour ${SIMILAR[p.category]} ?`, `Oui. EMBI rénove ${PLURAL[p.category]} à Paris et en Île-de-France, avec un seul interlocuteur de l'étude à la livraison. Voir [nos chantiers du même secteur](${sectorPath}) ou décrivez votre projet en 3 questions ci-dessous : le devis est gratuit.`],
  BY_CAT[p.category],
].filter(Boolean);

module.exports = { PAGES, project };
