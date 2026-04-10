/**
 * TypeScript Types - Réservations
 * V0 MVP - Type-safe CRUD operations
 */

/**
 * Statut possible d'une réservation
 * Mapping Airtable: "En attente" | "Confirmée" | "Annulée" | "Terminée" | "No-show"
 */
export type ReservationStatus = 
  | 'En attente' 
  | 'Confirmée' 
  | 'Annulée' 
  | 'Terminée' 
  | 'No-show';

/**
 * Interface principale : Réservation
 * Correspond aux colonnes Airtable
 */
export interface Reservation {
  // Métadata Airtable
  id: string;                    // Airtable recID (stable key)
  createdTime: string;           // Airtable timestamp
  updatedTime?: string;          // Last modification

  // Champs métier
  nomComplet: string;            // Nom + Prénom combinés (ou séparés)
  prenom: string;                // Prénom (pour appels)
  date: string;                  // ISO format: "2024-04-12"
  heure: string;                 // Format 24h: "19:30"
  nbPersonnes: number;           // 1-12
  statut: ReservationStatus;     // Un des 5 statuts
  autresInfos?: string;          // Allergies, demandes spéciales (optional)
}

/**
 * DTO pour création
 * (Submission depuis formulaire)
 */
export interface CreateReservationDTO {
  nomComplet: string;
  prenom: string;
  date: string;
  heure: string;
  nbPersonnes: number;
  autresInfos?: string;
}

/**
 * DTO pour édition
 * (Champs optionnels sauf ID)
 */
export interface UpdateReservationDTO {
  nomComplet?: string;
  prenom?: string;
  date?: string;
  heure?: string;
  nbPersonnes?: number;
  statut?: ReservationStatus;
  autresInfos?: string;
}

/**
 * Réponse API standard
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
    duration_ms?: number;
  };
}

/**
 * Filtres pour recherche/affichage Liste
 */
export interface ReservationFilters {
  dateStart?: string;            // ISO format
  dateEnd?: string;              // ISO format
  statuses?: ReservationStatus[];
  searchQuery?: string;           // Partial match sur nom/prénom
}

/**
 * États UI/UX pour chaque réservation
 */
export type ReservationUIState = 
  | 'idle'
  | 'loading'
  | 'creating'
  | 'updating'
  | 'deleting'
  | 'error'
  | 'success';
