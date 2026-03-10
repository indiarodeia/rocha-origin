import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'encomendar' },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard | Rocha Origin',
  },

  {
    path: 'nova-encomenda',
    loadComponent: () =>
      import('./features/orders/pages/order-create/order-create').then((m) => m.OrderCreate),
    title: 'Nova Encomenda | Rocha Origin',
  },

  {
    path: 'encomendas',
    loadComponent: () =>
      import('./features/orders/pages/orders-list/orders-list').then((m) => m.OrdersList),
    title: 'Encomendas | Rocha Origin',
  },

  {
    path: 'clientes',
    loadComponent: () =>
      import('./features/clients/pages/client-list/client-list').then((m) => m.ClientList),
    title: 'Clientes | Rocha Origin',
  },

  {
    path: 'fornecedores',
    loadComponent: () =>
      import('./features/suppliers/pages/supplier-list/supplier-list').then(
        (m) => m.SupplierList,
      ),
    title: 'Fornecedores | Rocha Origin',
  },

  {
    path: 'produtos',
    loadComponent: () =>
      import('./features/products/pages/product-list/product-list').then((m) => m.ProductList),
    title: 'Produtos | Rocha Origin',
  },

  {
    path: 'animais',
    loadComponent: () =>
      import('./features/animals/pages/animal-list/animal-list').then((m) => m.AnimalList),
    title: 'Animais | Rocha Origin',
  },

  {
    path: 'configuracoes',
    loadComponent: () =>
      import('./features/settings/pages/settings/settings').then((m) => m.Settings),
    title: 'Configurações | Rocha Origin',
  },
];
