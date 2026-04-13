import { Routes } from '@angular/router';
import { appAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((m) => m.Login),
    title: 'Login | Rocha Origin',
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard | Rocha Origin',
    canActivate: [appAuthGuard],
  },

  {
    path: 'nova-encomenda',
    loadComponent: () =>
      import('./features/orders/pages/order-create/order-create').then((m) => m.OrderCreate),
    title: 'Nova Encomenda | Rocha Origin',
    canActivate: [appAuthGuard],
  },

  {
    path: 'encomendas',
    loadComponent: () =>
      import('./features/orders/pages/orders-list/orders-list').then((m) => m.OrdersList),
    title: 'Encomendas | Rocha Origin',
    canActivate: [appAuthGuard],
  },

  {
    path: 'clientes',
    loadComponent: () =>
      import('./features/clients/pages/client-list/client-list').then((m) => m.ClientList),
    title: 'Clientes | Rocha Origin',
    canActivate: [appAuthGuard],
  },

  {
    path: 'fornecedores',
    loadComponent: () =>
      import('./features/suppliers/pages/supplier-list/supplier-list').then(
        (m) => m.SupplierList,
      ),
    title: 'Fornecedores | Rocha Origin',
    canActivate: [appAuthGuard],
  },

  {
    path: 'produtos',
    loadComponent: () =>
      import('./features/products/pages/product-list/product-list').then((m) => m.ProductList),
    title: 'Produtos | Rocha Origin',
    canActivate: [appAuthGuard],
  },

  {
    path: 'animais',
    loadComponent: () =>
      import('./features/animals/pages/animal-list/animal-list').then((m) => m.AnimalList),
    title: 'Animais | Rocha Origin',
    canActivate: [appAuthGuard],
  },

  {
    path: 'configuracoes',
    loadComponent: () =>
      import('./features/settings/pages/settings/settings').then((m) => m.Settings),
    title: 'Configurações | Rocha Origin',
    canActivate: [appAuthGuard],
  },

  { path: '**', redirectTo: 'login' },
];
