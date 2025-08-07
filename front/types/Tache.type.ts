export interface TacheBase {
  titre: string;
  description?: string | null;
  date_echeance?: string | null; // Using string for date for simplicity with input type="date"
  statut?: string;
  contact_id: number;
}

export interface TacheCreate extends TacheBase {}

export interface TacheUpdate {
  titre?: string;
  description?: string | null;
  date_echeance?: string | null;
  statut?: string;
}

export interface TacheOut extends TacheBase {
  contact_name: ReactNode;
  contact_phone: any;
  id: number;
  date_creation: string;
}
