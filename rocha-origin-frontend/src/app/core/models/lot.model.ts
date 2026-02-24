export interface Lot {
  id: string;
  lotCode: string; // e.g. 20260201
  year: number;
  month: number;
  weekOfMonth: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface LotAnimal {
  lotId: string;
  animalId: string;
  addedAt?: string;
}
