export interface Lot {
  id: string;
  lotCode: string;
  year: number;
  month: number;
  weekOfMonth: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  notes?: string | null;
}
