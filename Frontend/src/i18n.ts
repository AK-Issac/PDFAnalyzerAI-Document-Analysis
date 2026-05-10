import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "topbar": {
        "upgrade": "Upgrade",
        "settings": "Settings",
        "logout": "Log out"
      },
      "sidebar": {
        "new_chat": "New Chat",
        "documents": "Documents",
        "folders": "Folders",
        "no_folders": "No folders yet.",
        "upgrade": "Upgrade to Pro",
        "settings": "Settings",
        "new_folder": "New Folder",
        "folder_name": "Folder Name",
        "create": "Create",
        "cancel": "Cancel",
        "upload_pdf": "Upload PDF",
        "workspace": "WORKSPACE",
        "local_user": "Local Dev User",
        "view_profile": "View profile settings"
      },
      "aipanel": {
        "chat": "Chat",
        "summarize": "Summarize",
        "notes": "Notes",
        "ask_question": "Ask about this document...",
        "type_question": "Type your question...",
        "generating": "Generating...",
        "select_text": "Please highlight a section of the document to summarize it.",
        "selection_captured": "Selection captured! Add an optional request below and press Send.",
        "what_to_focus": "Optional: What should I focus on?",
        "summarize_btn": "Summarize",
        "source": "Source: Page",
        "sources_label": "Sources:",
        "page": "Page",
        "summarize_title": "Summarize Selection",
        "assistant_title": "AI Assistant",
        "upload_prompt": "Upload a document to begin."
      },
      "subscription": {
        "title": "Choose Your Plan",
        "subtitle": "Unlock powerful features and supercharge your workflow.",
        "current_plan": "Current Plan",
        "downgrade": "Downgrade",
        "main_offer": "MAIN OFFER",
        "free": {
          "name": "Free",
          "desc": "Let users reach one clear 'aha' moment.",
          "feat1": "5 documents total",
          "feat2": "30 actions total (summary, Q&A, extraction)",
          "feat3": "Standard processing speed",
          "feat4": "Basic features only"
        },
        "pro": {
          "name": "Pro",
          "desc": "Cover 95% of individual users without hitting limits.",
          "feat1": "Up to 150 documents per month",
          "feat2": "1,500 actions per month",
          "feat3": "Larger PDFs supported (up to ~500 pages)",
          "feat4": "Faster processing + priority queue",
          "feat5": "Full feature access (summaries, Q&A, insights)",
          "cta": "Upgrade to Pro"
        },
        "business": {
          "name": "Power / Business",
          "desc": "For power users and teams who need it all.",
          "feat1": "'Unlimited' documents and actions",
          "feat2": "Very large PDFs (500+ pages, bulk uploads)",
          "feat3": "Highest priority processing speed",
          "feat4": "Advanced features (batch processing, workflows)",
          "feat5": "Collaboration options (teams, shared workspaces)",
          "cta": "Upgrade to Business"
        },
        "back": "Back to Workspace"
      }
    }
  },
  fr: {
    translation: {
      "topbar": {
        "upgrade": "Abonnement",
        "settings": "Paramètres",
        "logout": "Déconnexion"
      },
      "sidebar": {
        "new_chat": "Nouvelle Discussion",
        "documents": "Documents",
        "folders": "Dossiers",
        "no_folders": "Aucun dossier.",
        "upgrade": "Passer à Pro",
        "settings": "Paramètres",
        "new_folder": "Nouveau Dossier",
        "folder_name": "Nom du dossier",
        "create": "Créer",
        "cancel": "Annuler",
        "upload_pdf": "Ajouter un PDF",
        "workspace": "ESPACE DE TRAVAIL",
        "local_user": "Utilisateur Dev Local",
        "view_profile": "Voir les paramètres du profil"
      },
      "aipanel": {
        "chat": "Discussion",
        "summarize": "Résumer",
        "notes": "Notes",
        "ask_question": "Posez une question sur le document...",
        "type_question": "Tapez votre question...",
        "generating": "Génération...",
        "select_text": "Veuillez surligner une section du document pour la résumer.",
        "selection_captured": "Sélection capturée ! Ajoutez une requête facultative ci-dessous et appuyez sur Envoyer.",
        "what_to_focus": "Facultatif : Sur quoi dois-je me concentrer ?",
        "summarize_btn": "Résumer",
        "source": "Source: Page",
        "sources_label": "Sources :",
        "page": "Page",
        "summarize_title": "Résumer la sélection",
        "assistant_title": "Assistant IA",
        "upload_prompt": "Téléversez un document pour commencer."
      },
      "subscription": {
        "title": "Choisissez votre forfait",
        "subtitle": "Débloquez des fonctionnalités puissantes et optimisez votre flux de travail.",
        "current_plan": "Forfait actuel",
        "downgrade": "Rétrograder",
        "main_offer": "OFFRE PRINCIPALE",
        "free": {
          "name": "Gratuit",
          "desc": "Pour atteindre votre premier moment 'Aha'.",
          "feat1": "5 documents au total",
          "feat2": "30 actions au total (résumés, Q&R, extraction)",
          "feat3": "Vitesse de traitement standard",
          "feat4": "Fonctionnalités de base uniquement"
        },
        "pro": {
          "name": "Pro",
          "desc": "Couvre 95% des utilisateurs sans atteindre de limites.",
          "feat1": "Jusqu'à 150 documents par mois",
          "feat2": "1 500 actions par mois",
          "feat3": "PDF volumineux supportés (jusqu'à ~500 pages)",
          "feat4": "Traitement plus rapide + file prioritaire",
          "feat5": "Accès complet (résumés, Q&R, analyses avancées)",
          "cta": "Passer à Pro"
        },
        "business": {
          "name": "Entreprise",
          "desc": "Pour les utilisateurs intensifs et les équipes.",
          "feat1": "Documents et actions 'illimités'",
          "feat2": "Très grands PDF (500+ pages, imports de masse)",
          "feat3": "Vitesse de traitement maximale",
          "feat4": "Fonctionnalités avancées (traitements par lots)",
          "feat5": "Outils de collaboration (équipes, dossiers partagés)",
          "cta": "Passer à Entreprise"
        },
        "back": "Retour à l'espace de travail"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
