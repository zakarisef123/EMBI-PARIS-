/*
 * ─────────────────────────────────────────────────────────────
 *  FORMULAIRES : les choix proposés aux visiteurs
 *  - formulaire de devis de la page Contact : un parcours particulier, un parcours professionnel ;
 *  - demande d'intervention des pages Urgence (les problèmes propres à chaque métier
 *    sont dans src/data/urgences.js, rubrique « demandes »).
 *  Chaque réponse arrive telle quelle dans l'e-mail reçu par EMBI.
 * ─────────────────────────────────────────────────────────────
 */
module.exports = {
  connu: ["Recherche Google", "Bouche-à-oreille", "Un architecte ou un partenaire", "Réseaux sociaux", "Passage devant le showroom", "Autre"],
  demarrage: ["Dès que possible", "D'ici 3 mois", "D'ici 6 mois ou plus", "Je me renseigne"],
  rappel: ["Le matin", "L'après-midi", "Peu importe"],

  particulier: {
    bien: ["Appartement", "Maison", "Autre"],
    statut: ["Propriétaire", "Locataire", "En cours d'achat"],
    travaux: {
      "Intérieur": ["Rénovation complète", "Salle de bain", "Cuisine", "Plomberie", "Électricité", "Sols et revêtements", "Cloisons et aménagement", "Peinture et décoration", "Menuiserie sur mesure"],
      "Rénovation énergétique": ["Isolation", "Fenêtres", "Ventilation", "Chauffage et eau chaude", "Aides à la rénovation"],
      "Extérieur": ["Ravalement de façade", "Menuiserie extérieure", "Balcon, terrasse", "Véranda", "Toiture et étanchéité"],
      "Accompagnement": ["Conception par notre architecte", "Carrelage, parquet (showroom)"],
    },
    occupation: ["Reste habité", "Sera vide", "À définir"],
    budget: ["Moins de 15 000 €", "15 000 à 50 000 €", "50 000 à 100 000 €", "Plus de 100 000 €", "Je ne sais pas encore"],
    objet: ["Un devis", "Une visite sur place", "Un conseil", "Un créneau au showroom"],
  },

  pro: {
    profil: ["Exploitant ou propriétaire", "Architecte, décorateur", "Syndic, gestionnaire", "Enseigne, réseau", "Autre"],
    etablissement: ["Hôtel", "Restaurant, café", "Boutique, corner", "Bureaux", "Immeuble, copropriété", "Autre"],
    nature: ["Création ou transformation complète", "Rénovation, embellissement", "Mise aux normes (PMR, incendie, électricité)", "Chambres et salles de bains", "Plomberie, électricité", "Agencement, mobilier sur mesure", "Façade, ravalement", "Conception par notre architecte", "Dépannage, urgence"],
    exploitation: ["Reste ouvert (site occupé)", "Sera fermé", "À définir"],
    budget: ["Moins de 50 000 €", "50 000 à 150 000 €", "150 000 à 500 000 €", "Plus de 500 000 €", "À définir"],
    architecte: ["Déjà désigné", "Pas encore désigné", "Conception EMBI souhaitée"],
    objet: ["Un devis", "Un appel d'offres", "Une visite du site", "Un conseil"],
  },

  urgence: {
    besoin: ["Intervention urgente", "Dans les prochains jours", "Un devis pour plus tard"],
    lieu: ["Appartement", "Maison", "Local professionnel", "Parties communes"],
  },
};
