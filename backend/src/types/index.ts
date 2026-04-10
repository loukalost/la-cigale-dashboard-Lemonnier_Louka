/**
 * Backend TypeScript Types
 */

export type ReservationStatus = 
  | 'En attente' 
  | 'Confirmée' 
  | 'Annulée' 
  | 'Terminée' 
  | 'No-show';

export interface Reservation {
  id: string;
  nomComplet: string;
  prenom: string;
  date: string;
  heure: string;
  nbPersonnes: number;
  statut: ReservationStatus;
  autresInfos?: string;
  createdTime: string;
  updatedTime?: string;
}

export interface CreateReservationDTO {
  nomComplet: string;
  prenom: string;
  date: string;
  heure: string;
  nbPersonnes: number;
  autresInfos?: string;
}

export interface UpdateReservationDTO {
  nomComplet?: string;
  prenom?: string;
  date?: string;
  heure?: string;
  nbPersonnes?: number;
  statut?: ReservationStatus;
  autresInfos?: string;
}

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
