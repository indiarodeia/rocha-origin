export interface Piece {
  id: string; // internal uuid
  publicId: string; // for QR access
  orderItemId: string;
  sourceType: 'ANIMAL' | 'LOT' | 'NONE';
  animalId?: string;
  lotId?: string;
  productName: string;
  processType?: string; // AGED, FRESH, etc.
  processDays?: number;
  netWeightKg: number;
  createdAt: string;
}
