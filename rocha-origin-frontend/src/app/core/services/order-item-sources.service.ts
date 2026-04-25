import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import {
  mapApiAnimalToOrderItemAnimalOption,
  mapApiEstablishmentMenuItemToOption,
  mapApiLotToOrderItemLotOption,
  mapApiProductToUiProduct,
  OrderItemAnimalOption,
  OrderItemLotOption,
  OrderItemMenuItemOption,
} from '../api/mappers/order-item-source.mapper';
import { AnimalApiService } from '../api/services/animal-api.service';
import { EstablishmentMenuItemApiService } from '../api/services/establishment-menu-item-api.service';
import { LotApiService } from '../api/services/lot-api.service';
import { ProductApiService } from '../api/services/product-api.service';
import { MOCK_ANIMALS } from '../mocks/animal.mock';
import { MOCK_ESTABLISHMENT_MENU_ITEMS, MOCK_ESTABLISHMENT_PRODUCT_PRICES } from '../mocks/order.mock';
import { MOCK_PRODUCTS } from '../mocks/product.mock';
import { EstablishmentMenuItem, EstablishmentProductPrice } from '../models/establishment.model';
import { Product } from '../models/product.model';

export interface OrderItemDialogSources {
  products: Product[];
  productPrices: EstablishmentProductPrice[];
  menuItems: OrderItemMenuItemOption[];
  animalOptions: OrderItemAnimalOption[];
  lotOptions: OrderItemLotOption[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderItemSourcesService {
  constructor(
    private readonly productApiService: ProductApiService,
    private readonly animalApiService: AnimalApiService,
    private readonly lotApiService: LotApiService,
    private readonly establishmentMenuItemApiService: EstablishmentMenuItemApiService,
  ) {}

  loadDialogSources(
    establishmentId: string,
    fallbackMenuItems: EstablishmentMenuItem[] = [],
  ): Observable<OrderItemDialogSources> {
    return forkJoin({
      products: this.getProducts(),
      productPrices: of(this.getFallbackProductPrices(establishmentId)),
      menuItems: this.getMenuItems(establishmentId, fallbackMenuItems),
      animalOptions: this.getAnimalOptions(),
      lotOptions: this.getLotOptions(),
    });
  }

  private getProducts(): Observable<Product[]> {
    const fallback = MOCK_PRODUCTS.filter((product) => product.isActive);

    return this.productApiService.getAll().pipe(
      map((products) =>
        products
          .filter((product) => product.isActive)
          .map(mapApiProductToUiProduct),
      ),
      map((products) => (products.length > 0 ? products : fallback)),
      catchError(() => of(fallback)),
    );
  }

  private getMenuItems(
    establishmentId: string,
    fallbackMenuItems: EstablishmentMenuItem[],
  ): Observable<OrderItemMenuItemOption[]> {
    const mappedFallback = this.buildMenuItemFallback(establishmentId, fallbackMenuItems);

    if (!establishmentId) {
      return of(mappedFallback);
    }

    return this.establishmentMenuItemApiService.getByEstablishmentId(establishmentId).pipe(
      map((items) =>
        items
          .filter((item) => item.isActive)
          .map(mapApiEstablishmentMenuItemToOption),
      ),
      map((items) => (items.length > 0 ? items : mappedFallback)),
      catchError(() => of(mappedFallback)),
    );
  }

  private getAnimalOptions(): Observable<OrderItemAnimalOption[]> {
    const fallback = MOCK_ANIMALS.map((animal) => ({
      id: animal.id,
      identification: animal.animalIdentification,
      breed: animal.breed,
      slaughterDate: animal.slaughterDate,
    }));

    return this.animalApiService.getAll().pipe(
      map((animals) =>
        animals
          .filter((animal) => animal.isActive)
          .map(mapApiAnimalToOrderItemAnimalOption),
      ),
      map((animals) => (animals.length > 0 ? animals : fallback)),
      catchError(() => of(fallback)),
    );
  }

  private getLotOptions(): Observable<OrderItemLotOption[]> {
    const fallback: OrderItemLotOption[] = [
      { id: 'lot-2026-01', label: 'Lote 2026-01' },
      { id: 'lot-2026-02', label: 'Lote 2026-02' },
      { id: 'lot-2026-03', label: 'Lote 2026-03' },
    ];

    return this.lotApiService.getAll().pipe(
      map((lots) => lots.map(mapApiLotToOrderItemLotOption)),
      map((lots) => (lots.length > 0 ? lots : fallback)),
      catchError(() => of(fallback)),
    );
  }

  private buildMenuItemFallback(
    establishmentId: string,
    fallbackMenuItems: EstablishmentMenuItem[],
  ): OrderItemMenuItemOption[] {
    const realFallback = fallbackMenuItems
      .filter((item) => item.isActive)
      .map((item) => ({ id: item.id, name: item.name }));

    if (realFallback.length > 0) {
      return realFallback;
    }

    return MOCK_ESTABLISHMENT_MENU_ITEMS
      .filter((item) => item.establishmentId === establishmentId && item.isActive)
      .map((item) => ({ id: item.id, name: item.name }));
  }

  private getFallbackProductPrices(establishmentId: string): EstablishmentProductPrice[] {
    return MOCK_ESTABLISHMENT_PRODUCT_PRICES.filter((price) => price.establishmentId === establishmentId);
  }
}
