import { Establishment } from './establishment.model';
import { Order } from './order.model';

export interface Route {
  id: string;
  apiId?: string;
  name: string;
  sortOrder?: number;
  isActive: boolean;

  establishments?: Establishment[];
  orders?: Order[];
}
