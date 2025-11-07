import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "de" | "fr" | "it" | "en";

// Translation strings
const translations: Record<Language, Record<string, string>> = {
  de: {
    "app.title": "AusflugFinder",
    "app.tagline": "Entdecke, plane und verwalte unvergessliche Familienausflüge und Abenteuer",
    "nav.myTrips": "Meine Ausflüge",
    "nav.profile": "Mein Profil",
    "nav.explore": "Ausflüge entdecken",
    "nav.destinations": "Destinationen",
    "nav.planner": "Planung",
    "nav.signIn": "Jetzt starten",
    "nav.language": "Sprache",
    "trips.title": "Meine Ausflüge",
    "trips.create": "Neue Planung",
    "trips.createTitle": "Neuen Ausflug erstellen",
    "trips.createDescription": "Fülle die Details für deinen neuen Ausflug aus. Mit * gekennzeichnete Felder sind erforderlich.",
    "trips.basicInfo": "Grundinformationen",
    "trips.dateTime": "Zeitplanung & Teilnehmer",
    "trips.options": "Zusätzliche Optionen",
    "trips.titleLabel": "Titel",
    "trips.destination": "Ziel",
    "trips.description": "Beschreibung",
    "trips.startDate": "Startdatum",
    "trips.endDate": "Enddatum",
    "trips.participants": "Teilnehmer",
    "trips.status": "Status",
    "trips.favorite": "Als Favorit markieren",
    "trips.public": "Öffentlich teilen",
    "trips.cancel": "Abbrechen",
    "trips.createBtn": "Erstellen",
    "trips.delete": "Löschen",
    "trips.open": "Öffnen",
    "trips.deleteConfirm": "Möchtest du diesen Ausflug wirklich löschen?",
    "trips.none": "Du hast noch keine Ausflüge erstellt",
    "trips.noneSubtitle": "Starte jetzt und plane dein erstes Abenteuer!",
    "trips.status.planned": "Geplant",
    "trips.status.ongoing": "Laufend",
    "trips.status.completed": "Abgeschlossen",
    "trips.status.cancelled": "Abgesagt",
    "destinations.title": "Meine Destinationen",
    "destinations.subtitle": "Speichere deine Lieblingsorte für zukünftige Ausflüge",
    "destinations.create": "Neue Destination",
    "destinations.createTitle": "Neue Destination",
    "destinations.edit": "Bearbeiten",
    "destinations.none": "Noch keine Destinationen",
    "destinations.noneSubtitle": "Füge deine ersten Lieblingsorte hinzu",
    "theme.dark": "Dunkler Modus",
    "theme.light": "Heller Modus",
  },
  en: {
    "app.title": "Trip Manager",
    "app.tagline": "Discover, plan, and manage unforgettable family trips and adventures",
    "nav.myTrips": "My Trips",
    "nav.profile": "My Profile",
    "nav.explore": "Explore Trips",
    "nav.destinations": "Destinations",
    "nav.planner": "Planner",
    "nav.signIn": "Get Started",
    "nav.language": "Language",
    "trips.title": "My Trips",
    "trips.create": "New Trip",
    "trips.createTitle": "Create New Trip",
    "trips.createDescription": "Fill in the details for your new trip. Fields marked with * are required.",
    "trips.basicInfo": "Basic Information",
    "trips.dateTime": "Schedule & Participants",
    "trips.options": "Additional Options",
    "trips.titleLabel": "Title",
    "trips.destination": "Destination",
    "trips.description": "Description",
    "trips.startDate": "Start Date",
    "trips.endDate": "End Date",
    "trips.participants": "Participants",
    "trips.status": "Status",
    "trips.favorite": "Mark as Favorite",
    "trips.public": "Share Publicly",
    "trips.cancel": "Cancel",
    "trips.createBtn": "Create",
    "trips.delete": "Delete",
    "trips.open": "Open",
    "trips.deleteConfirm": "Do you really want to delete this trip?",
    "trips.none": "You haven't created any trips yet",
    "trips.noneSubtitle": "Start now and plan your first adventure!",
    "trips.status.planned": "Planned",
    "trips.status.ongoing": "Ongoing",
    "trips.status.completed": "Completed",
    "trips.status.cancelled": "Cancelled",
    "destinations.title": "My Destinations",
    "destinations.subtitle": "Save your favorite places for future trips",
    "destinations.create": "New Destination",
    "destinations.createTitle": "New Destination",
    "destinations.edit": "Edit",
    "destinations.none": "No destinations yet",
    "destinations.noneSubtitle": "Add your first favorite places",
    "theme.dark": "Dark Mode",
    "theme.light": "Light Mode",
  },
  fr: {
    "app.title": "Gestionnaire de Voyages",
    "app.tagline": "Découvrez, planifiez et gérez vos voyages en famille inoubliables",
    "nav.myTrips": "Mes Voyages",
    "nav.profile": "Mon Profil",
    "nav.explore": "Explorer les Voyages",
    "nav.destinations": "Destinations",
    "nav.planner": "Planificateur",
    "nav.signIn": "Commencer",
    "nav.language": "Langue",
    "trips.title": "Mes Voyages",
    "trips.create": "Nouveau Voyage",
    "trips.createTitle": "Créer un Nouveau Voyage",
    "trips.createDescription": "Remplissez les détails de votre nouveau voyage. Les champs marqués avec * sont obligatoires.",
    "trips.basicInfo": "Informations de Base",
    "trips.dateTime": "Planification & Participants",
    "trips.options": "Options Supplémentaires",
    "trips.titleLabel": "Titre",
    "trips.destination": "Destination",
    "trips.description": "Description",
    "trips.startDate": "Date de Début",
    "trips.endDate": "Date de Fin",
    "trips.participants": "Participants",
    "trips.status": "Statut",
    "trips.favorite": "Marquer comme Favori",
    "trips.public": "Partager Publiquement",
    "trips.cancel": "Annuler",
    "trips.createBtn": "Créer",
    "trips.delete": "Supprimer",
    "trips.open": "Ouvrir",
    "trips.deleteConfirm": "Voulez-vous vraiment supprimer ce voyage?",
    "trips.none": "Vous n'avez pas encore créé de voyages",
    "trips.noneSubtitle": "Commencez maintenant et planifiez votre première aventure!",
    "trips.status.planned": "Planifié",
    "trips.status.ongoing": "En cours",
    "trips.status.completed": "Terminé",
    "trips.status.cancelled": "Annulé",
    "destinations.title": "Mes Destinations",
    "destinations.subtitle": "Enregistrez vos lieux préférés pour les futurs voyages",
    "destinations.create": "Nouvelle Destination",
    "destinations.createTitle": "Nouvelle Destination",
    "destinations.edit": "Modifier",
    "destinations.none": "Pas de destinations encore",
    "destinations.noneSubtitle": "Ajoutez vos premiers lieux préférés",
    "theme.dark": "Mode Sombre",
    "theme.light": "Mode Clair",
  },
  it: {
    "app.title": "Gestore di Viaggi",
    "app.tagline": "Scopri, pianifica e gestisci indimenticabili viaggi in famiglia",
    "nav.myTrips": "I Miei Viaggi",
    "nav.profile": "Il Mio Profilo",
    "nav.explore": "Esplora Viaggi",
    "nav.destinations": "Destinazioni",
    "nav.planner": "Pianificatore",
    "nav.signIn": "Inizia Ora",
    "nav.language": "Lingua",
    "trips.title": "I Miei Viaggi",
    "trips.create": "Nuovo Viaggio",
    "trips.createTitle": "Crea Nuovo Viaggio",
    "trips.createDescription": "Riempi i dettagli per il tuo nuovo viaggio. I campi contrassegnati con * sono obbligatori.",
    "trips.basicInfo": "Informazioni di Base",
    "trips.dateTime": "Pianificazione & Partecipanti",
    "trips.options": "Opzioni Aggiuntive",
    "trips.titleLabel": "Titolo",
    "trips.destination": "Destinazione",
    "trips.description": "Descrizione",
    "trips.startDate": "Data di Inizio",
    "trips.endDate": "Data di Fine",
    "trips.participants": "Partecipanti",
    "trips.status": "Stato",
    "trips.favorite": "Contrassegna come Preferito",
    "trips.public": "Condividi Pubblicamente",
    "trips.cancel": "Annulla",
    "trips.createBtn": "Crea",
    "trips.delete": "Elimina",
    "trips.open": "Apri",
    "trips.deleteConfirm": "Vuoi veramente eliminare questo viaggio?",
    "trips.none": "Non hai ancora creato alcun viaggio",
    "trips.noneSubtitle": "Inizia ora e pianifica la tua prima avventura!",
    "trips.status.planned": "Pianificato",
    "trips.status.ongoing": "In Corso",
    "trips.status.completed": "Completato",
    "trips.status.cancelled": "Annullato",
    "destinations.title": "Le Mie Destinazioni",
    "destinations.subtitle": "Salva i tuoi luoghi preferiti per i futuri viaggi",
    "destinations.create": "Nuova Destinazione",
    "destinations.createTitle": "Nuova Destinazione",
    "destinations.edit": "Modifica",
    "destinations.none": "Nessuna destinazione ancora",
    "destinations.noneSubtitle": "Aggiungi i tuoi primi luoghi preferiti",
    "theme.dark": "Modalità Scura",
    "theme.light": "Modalità Chiara",
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export function I18nProvider({
  children,
  defaultLanguage = "de",
}: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("language");
    if (stored && ["de", "fr", "it", "en"].includes(stored)) {
      return stored as Language;
    }
    return defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[Language]] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
