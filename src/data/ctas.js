/*
 * ─────────────────────────────────────────────────────────────
 *  APPELS À L'ACTION en milieu de page (un bandeau par page, texte propre à chaque page).
 *  t : titre (la partie entre <em> s'affiche en italique doré) · p : phrase d'accompagnement
 *  a : bouton principal [libellé, lien] · b : lien secondaire [libellé, lien]
 *  « #projet » mène au questionnaire en bas de la page (ou au formulaire de contact s'il n'y en a pas).
 *  Une page absente de la liste n'a pas de bandeau (contact, pages légales…).
 *  Chantiers : texte selon la catégorie ({title} = nom du chantier) · Articles du Mag : selon la rubrique.
 * ─────────────────────────────────────────────────────────────
 */
const TEL = ["Appeler le 01 45 72 65 24", "tel:+33145726524"];
const URGENT = ["Appeler le 06 31 60 01 35", "tel:+33631600135"];

module.exports = {
  pages: {
    "/": { t: "Un lieu à transformer&nbsp;? <em>Parlons-en cette semaine.</em>", p: "Un devis gratuit et détaillé, et un seul interlocuteur du premier rendez-vous à la livraison.", a: ["Demander mon devis gratuit", "#projet"], b: ["Visiter le showroom", "/showroom/"] },
    "/particuliers/": { t: "Votre appartement mérite <em>plus qu'un coup de peinture.</em>", p: "Racontez-nous votre projet : nous revenons vers vous pour organiser une visite et chiffrer les travaux.", a: ["Estimer ma rénovation", "#projet"], b: ["Voir les matériaux au showroom", "/showroom/"] },
    "/professionnels/": { t: "Rénover sans <em>mettre votre activité entre parenthèses.</em>", p: "Planning, phasage, travaux en site occupé : nous organisons le chantier autour de votre exploitation.", a: ["Parler de mon établissement", "#projet"], b: TEL },
    "/hotels/": { t: "Une rénovation d'hôtel <em>pensée chambre par chambre.</em>", p: "Embellissement, remise aux normes, décoration : présentez-nous votre établissement, nous préparons une première approche.", a: ["Recevoir une proposition", "#projet"], b: ["Voir l'Hôtel Panache", "/realisations/hotel-panache/"] },
    "/boutiques/": { t: "Une ouverture, un corner, <em>une date à tenir&nbsp;?</em>", p: "Dites-nous où et quand : nous calons le chantier sur votre calendrier d'ouverture.", a: ["Lancer mon projet de boutique", "#projet"], b: ["Le corner Byredo au Bon Marché", "/realisations/byredo/"] },
    "/restaurants/": { t: "Votre salle, votre cuisine, <em>vos normes.</em>", p: "Plomberie, sanitaires, accessibilité, décoration : un seul devis pour l'ensemble du chantier.", a: ["Chiffrer mes travaux", "#projet"], b: TEL },
    "/renovation/": { t: "Intérieur, extérieur <em>ou les deux&nbsp;?</em>", p: "Un seul devis, un seul interlocuteur : nous coordonnons tous les corps de métier pour vous.", a: ["Décrire mon projet", "#projet"], b: ["Voir nos chantiers", "/realisations/"] },
    "/renovation/interieur/": { t: "Pièce par pièce <em>ou de fond en comble.</em>", p: "Salle de bain, cuisine, électricité ou appartement entier : tout commence par une visite et un chiffrage clair.", a: ["Planifier une visite", "#projet"], b: ["Choisir mes matériaux au showroom", "/showroom/"] },
    "/renovation/exterieur/": { t: "Façade, toiture, terrasse : <em>on monte voir.</em>", p: "Un état des lieux pour savoir quoi faire, dans quel ordre et pour quel budget.", a: ["Demander un état des lieux", "#projet"], b: ["Le ravalement rue Nollet", "/realisations/ravalement-rue-nollet/"] },
    "/projets-specifiques/": { t: "Un projet <em>qui sort du cadre&nbsp;?</em>", p: "C'est souvent là que nous sommes le plus utiles. Exposez-nous vos contraintes, nous proposons une organisation.", a: ["Exposer mon projet", "#projet"], b: ["Nous écrire", "mailto:sec@embi.fr"] },
    "/signature/": { t: "Votre adresse <em>dans cette liste&nbsp;?</em>", p: "Les maisons qui nous confient leurs lieux attendent de la précision et des délais tenus. Parlons du vôtre.", a: ["Prendre rendez-vous", "#projet"], b: ["Toutes les réalisations", "/realisations/"] },
    "/conception-sur-mesure/": { t: "Esquisser votre projet <em>avec notre architecte.</em>", p: "Plans, aménagement, mobilier : apportez vos envies, nous les dessinons puis nous les réalisons.", a: ["Rencontrer l'architecte", "#projet"], b: ["Passer au showroom", "/showroom/"] },
    "/savoir-faire/": { t: "Le bon artisan <em>pour chaque détail.</em>", p: "40 professionnels coordonnés par un seul interlocuteur : dites-nous ce qu'il y a à faire.", a: ["Confier mon chantier", "#projet"], b: ["Notre méthode", "/methode/"] },
    "/methode/": { t: "Première étape : <em>l'étude de faisabilité.</em>", p: "Elle commence par un échange. Décrivez votre projet, nous vous rappelons pour fixer une visite.", a: ["Commencer l'étude", "#projet"], b: TEL },
    "/showroom/": { t: "Toucher les matières <em>avant de choisir.</em>", p: "Carrelages, parquets, faïences : venez du lundi au vendredi, de 10h à 18h, au 5 rue Villebois-Mareuil (Paris 17e).", a: ["Préparer ma visite", "#projet"], b: ["Appeler avant de venir", "tel:+33145726524"] },
    "/equipe/": { t: "Une équipe, <em>un interlocuteur.</em>", p: "La personne qui vous reçoit suit votre chantier jusqu'à la livraison. Faisons connaissance.", a: ["Prendre contact", "#projet"], b: ["Nos qualifications", "/qualifications/"] },
    "/qualifications/": { t: "Des qualifications, <em>et un devis transparent.</em>", p: "Un devis détaillé, sans engagement : vous savez ce que vous payez avant de signer.", a: ["Demander mon devis", "#projet"], b: ["Notre méthode", "/methode/"] },
    "/urgence/": { t: "Dégât des eaux, panne, fuite&nbsp;? <em>Appelez directement.</em>", p: "En cas d'urgence, le téléphone va plus vite qu'un formulaire.", a: URGENT, b: ["Après l'urgence : rénover", "/renovation/interieur/"] },
    "/urgence/plomberie/": { t: "Une fuite&nbsp;? <em>Coupez l'eau, puis appelez-nous.</em>", p: "Nous intervenons à Paris et en Île-de-France, et nous pouvons ensuite reprendre les dégâts.", a: URGENT, b: ["Que faire en cas de fuite", "/mag/fuite-eau-urgence-paris-que-faire/"] },
    "/urgence/electricite/": { t: "Un disjoncteur qui saute&nbsp;? <em>Ne forcez pas.</em>", p: "Un appel suffit pour organiser l'intervention, et la mise en sécurité de votre installation.", a: URGENT, b: ["La mise aux normes électriques", "/mag/mise-aux-normes-electriques-quand-comment/"] },
    "/urgence/assainissement/": { t: "Évacuation bouchée, odeurs&nbsp;? <em>On s'en occupe.</em>", p: "Un appel suffit pour organiser l'intervention.", a: URGENT, b: ["Toutes les urgences", "/urgence/"] },
    "/faq/": { t: "Votre question <em>n'est pas dans la liste&nbsp;?</em>", p: "Posez-la directement à l'équipe : nous répondons du lundi au vendredi.", a: ["Poser ma question", "/contact/#form"], b: TEL },
    "/mag/": { t: "Assez lu, <em>place au chantier&nbsp;?</em>", p: "Les articles donnent les grandes lignes ; une visite vous dira ce qui s'applique chez vous.", a: ["Demander une visite", "#projet"], b: ["Voir nos chantiers", "/realisations/"] },
  },
  projects: {
    hotel: { t: "Votre hôtel, <em>prochain chantier&nbsp;?</em>", p: "Ce que nous avons fait pour {title}, nous pouvons l'adapter à votre établissement.", a: ["Parler de mon hôtel", "#projet"], b: ["Tous nos hôtels", "/hotels/"] },
    boutique: { t: "Une boutique à créer <em>ou à réinventer&nbsp;?</em>", p: "Après {title}, pourquoi pas votre enseigne ? Dites-nous où et pour quand.", a: ["Lancer mon projet", "#projet"], b: ["Toutes nos boutiques", "/boutiques/"] },
    restaurant: { t: "Un restaurant à transformer&nbsp;? <em>Commençons par une visite.</em>", p: "Comme pour {title}, nous menons la plomberie, les normes et la décoration avec un seul devis.", a: ["Organiser une visite", "#projet"], b: ["Tous nos restaurants", "/restaurants/"] },
    particulier: { t: "Un appartement <em>comme celui-ci&nbsp;?</em>", p: "Racontez-nous le vôtre : surface, envies, calendrier. Nous revenons vers vous pour en parler.", a: ["Estimer mes travaux", "#projet"], b: ["Rénovation d'appartement", "/renovation/interieur/#appartement"] },
    "savoir-faire": { t: "Ce savoir-faire, <em>chez vous&nbsp;?</em>", p: "Dites-nous ce que vous souhaitez faire réaliser : nous vous proposons une solution et un chiffrage.", a: ["Demander un chiffrage", "#projet"], b: ["Tous nos savoir-faire", "/savoir-faire/"] },
  },
  articles: {
    projet: { t: "Un projet <em>du même genre&nbsp;?</em>", p: "Parlons de votre lieu : nous vous disons comment nous l'aborderions.", a: ["Parler de mon projet", "#projet"] },
    "renovation-interieure": { t: "Vous préparez <em>des travaux chez vous&nbsp;?</em>", p: "Une visite et un devis détaillé, sans engagement.", a: ["Demander un devis", "#projet"] },
    "renovation-energetique": { t: "Par où commencer <em>chez vous&nbsp;?</em>", p: "Un état des lieux permet de prioriser les travaux selon votre logement.", a: ["Faire le point", "#projet"] },
    exterieur: { t: "Une façade ou un toit <em>à reprendre&nbsp;?</em>", p: "Nous venons voir et nous vous aidons pour les démarches.", a: ["Demander une visite", "#projet"] },
    signature: { t: "Un lieu exigeant <em>à transformer&nbsp;?</em>", p: "Site occupé, délais serrés, finitions soignées : c'est notre quotidien.", a: ["Échanger avec nous", "#projet"] },
    urgence: { t: "C'est urgent&nbsp;? <em>N'attendez pas.</em>", p: "Une ligne dédiée aux urgences, à Paris et en Île-de-France.", a: URGENT },
  },
};
