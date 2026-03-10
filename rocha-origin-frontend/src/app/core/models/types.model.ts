// Units
export type UnitType = 'KG' | 'UN';

// Species
export type Species = 'BOVINO' | 'OVINO';

// Payment
export type PaymentType = 'IMMEDIATE' | 'CREDIT' | 'CUSTOMER';

// Order
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED';

// OrderItem
export type TraceabilitySourceType = 'ANIMAL' | 'LOT' | 'NONE';

// User
export type UserRole = 'ADMIN' | 'VENDEDOR' | 'TALHO' | 'CLIENTE';

// EUROP
export type EuropConformation = 'S' | 'E' | 'U' | 'R' | 'O' | 'P';

export type EuropFatClass = 1 | 2 | 3 | 4 | 5;

export type EuropCategory = 'A' | 'B' | 'C' | 'D' | 'E';
