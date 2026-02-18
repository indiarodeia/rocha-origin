import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'encomendar' },

  {
    path: 'produtos',
    loadComponent: () =>
      import('./features/produtos/pages/product-list/product-list').then((m) => m.ProductList),
    title: 'Produtos | Rocha Origin',
  },
  {
    path: 'encomendar',
    loadComponent: () =>
      import('./features/orders/pages/order-create/order-create').then((m) => m.OrderCreate),
    title: 'Encomendar | Rocha Origin',
  },

  { path: '**', redirectTo: 'encomendar' },
];
