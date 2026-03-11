import { Establishment } from './establishment.model';
import { Order } from './order.model';

export interface Route {
  id: string;
  name: string;
  sortOrder?: number;
  isActive: boolean;

  establishments?: Establishment[];
  orders?: Order[];
}
