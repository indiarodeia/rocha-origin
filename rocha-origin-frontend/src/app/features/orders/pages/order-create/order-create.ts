import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, NgZone, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import {
  MOCK_ESTABLISHMENTS,
  MOCK_ESTABLISHMENT_MENU_ITEMS,
  MOCK_ESTABLISHMENT_PRODUCT_PRICES,
  MOCK_ORDERS,
  MOCK_ROUTES,
} from '../../../../core/mocks/order.mock';
import { MOCK_ANIMALS } from '../../../../core/mocks/animal.mock';
import { MOCK_PRODUCTS } from '../../../../core/mocks/product.mock';
import { Order } from '../../../../core/models';
import { OrderItem } from '../../../../core/models/order-item.model';
import { PaymentType } from '../../../../core/models/types.model';
import { Route } from '../../../../core/models/route.model';
import { OrderService } from '../../services/order.service';
import { OrderItemAddDialogComponent } from './order-item-add-dialog';

type DeliveryStatus = 'DELIVERY' | 'PICKUP';

interface ClientOption {
  id: string;
  label: string;
  paymentType?: PaymentType;
}

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  templateUrl: './order-create.html',
  styleUrl: './order-create.scss',
})
export class OrderCreate {
  private readonly destroyRef = inject(DestroyRef);
  private readonly loggedUserId = 'user_logged';

  readonly paymentTypeOptions: PaymentType[] = ['IMMEDIATE', 'CREDIT', 'CUSTOMER'];
  readonly deliveryStatusOptions: { value: DeliveryStatus; label: string }[] = [
    { value: 'DELIVERY', label: 'Entrega' },
    { value: 'PICKUP', label: 'Levantamento' },
  ];
  readonly routeOptions: Route[] = MOCK_ROUTES;
  readonly orderItemsColumns = [
    'productName',
    'requestedUnit',
    'requestedQuantity',
    'unitPrice',
    'lineSubtotal',
    'actions',
  ];

  readonly clientOptions: ClientOption[] = this.buildClientOptions();
  readonly establishmentOptions = MOCK_ESTABLISHMENTS;

  ordersCount = 0;
  lastCreatedOrder?: Order;
  orderItems: OrderItem[] = [];

  readonly form;

  constructor(
    private readonly orderService: OrderService,
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      clientId: [''],
      establishmentId: [''],
      quickClientName: [''],

      routeId: [''],

      deliveryDate: [null as Date | null],
      deliveryDeadlineTime: [''],
      deliveryStatus: ['DELIVERY' as DeliveryStatus, Validators.required],
      isUrgent: [false],
      paymentType: [null as PaymentType | null],

      notes: [''],
    });

    this.ordersCount = this.orderService.getAll().length;

    this.form.controls.clientId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((clientId) => this.onClientChanged(clientId ?? ''));

    this.form.controls.establishmentId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((establishmentId) => this.onEstablishmentChanged(establishmentId ?? ''));

    this.onClientChanged('');
  }

  get filteredEstablishments() {
    const clientId = this.form.controls.clientId.value;

    if (!clientId) {
      return [];
    }

    return this.establishmentOptions.filter((item) => item.clientId === clientId);
  }

  get hasOrderItems(): boolean {
    return this.orderItems.length > 0;
  }

  get hasClientSelected(): boolean {
    return !!this.form.controls.clientId.value;
  }

  get showEstablishmentField(): boolean {
    return this.hasClientSelected && this.filteredEstablishments.length > 1;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const createdOrder = this.orderService.create({
      clientId: value.clientId ?? '',
      establishmentId: value.establishmentId ?? '',
      quickClientName: this.asOptional(value.quickClientName),
      status: 'PENDING',
      deliveryDate: this.toDateOnlyString(value.deliveryDate),
      deliveryDateTime: this.toDeliveryDateTime(value.deliveryDate, value.deliveryDeadlineTime),
      isDelivery: value.deliveryStatus === 'DELIVERY',
      isUrgent: !!value.isUrgent,
      routeId: this.asOptional(value.routeId),
      paymentType: value.paymentType ?? undefined,
      notes: this.asOptional(value.notes),
      createdByUserId: this.loggedUserId,
    });

    this.lastCreatedOrder = createdOrder;
    this.ordersCount = this.orderService.getAll().length;
    this.orderItems = [];

    this.form.patchValue({
      deliveryDate: null,
      deliveryDeadlineTime: '',
      deliveryStatus: 'DELIVERY',
      isUrgent: false,
      notes: '',
    });
  }

  hasError(controlName: keyof typeof this.form.controls, errorCode?: string): boolean {
    const control = this.form.controls[controlName];
    if (!control || !(control.touched || control.dirty)) {
      return false;
    }

    if (!errorCode) {
      return control.invalid;
    }

    return control.hasError(errorCode);
  }

  openAddProductDialog(): void {
    const establishmentId = this.form.controls.establishmentId.value ?? '';
    const menuItems = MOCK_ESTABLISHMENT_MENU_ITEMS.filter(
      (item) => item.establishmentId === establishmentId && item.isActive,
    ).map((item) => ({ id: item.id, name: item.name }));

    const animalOptions = MOCK_ANIMALS.map((animal) => ({
      id: animal.id,
      identification: animal.animalIdentification,
      breed: animal.breed,
      slaughterDate: animal.slaughterDate,
    }));

    const lotOptions = [
      { id: 'lot-2026-01', label: 'Lote 2026-01' },
      { id: 'lot-2026-02', label: 'Lote 2026-02' },
      { id: 'lot-2026-03', label: 'Lote 2026-03' },
    ];

    const dialogRef = this.dialog.open(OrderItemAddDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      autoFocus: false,
      restoreFocus: false,
      data: {
        products: MOCK_PRODUCTS,
        establishmentId,
        productPrices: MOCK_ESTABLISHMENT_PRODUCT_PRICES,
        menuItems,
        animalOptions,
        lotOptions,
        mode: 'add',
      },
    });

    dialogRef.beforeClosed().subscribe((item: OrderItem | undefined) => {
      if (!item) {
        return;
      }

      this.ngZone.run(() => {
        this.orderItems = [...this.orderItems, item];
        this.cdr.detectChanges();
      });
    });
  }

  editOrderItem(item: OrderItem): void {
    const establishmentId = this.form.controls.establishmentId.value ?? '';
    const menuItems = MOCK_ESTABLISHMENT_MENU_ITEMS.filter(
      (menuItem) => menuItem.establishmentId === establishmentId && menuItem.isActive,
    ).map((menuItem) => ({ id: menuItem.id, name: menuItem.name }));

    const animalOptions = MOCK_ANIMALS.map((animal) => ({
      id: animal.id,
      identification: animal.animalIdentification,
      breed: animal.breed,
      slaughterDate: animal.slaughterDate,
    }));

    const lotOptions = [
      { id: 'lot-2026-01', label: 'Lote 2026-01' },
      { id: 'lot-2026-02', label: 'Lote 2026-02' },
      { id: 'lot-2026-03', label: 'Lote 2026-03' },
    ];

    const dialogRef = this.dialog.open(OrderItemAddDialogComponent, {
      width: '760px',
      maxWidth: '95vw',
      autoFocus: false,
      restoreFocus: false,
      data: {
        products: MOCK_PRODUCTS,
        establishmentId,
        productPrices: MOCK_ESTABLISHMENT_PRODUCT_PRICES,
        menuItems,
        animalOptions,
        lotOptions,
        mode: 'edit',
        item,
      },
    });

    dialogRef.beforeClosed().subscribe((updatedItem: OrderItem | undefined) => {
      if (!updatedItem) {
        return;
      }

      this.ngZone.run(() => {
        this.orderItems = this.orderItems.map((currentItem) =>
          currentItem.id === updatedItem.id ? updatedItem : currentItem,
        );
        this.cdr.detectChanges();
      });
    });
  }

  removeOrderItem(itemId: string): void {
    const targetItem = this.orderItems.find((item) => item.id === itemId);
    if (!targetItem) {
      return;
    }

    const confirmed = window.confirm('Tem a certeza que pretende eliminar este produto?');
    if (!confirmed) {
      return;
    }

    this.orderItems = this.orderItems.filter((item) => item.id !== itemId);
    this.snackBar.open(`Produto ${targetItem.productName} eliminado.`, 'Fechar', {
      duration: 2800,
    });
  }

  getLineSubtotal(item: OrderItem): number {
    const price = Number(item.unitPrice ?? 0);
    if (!price || price <= 0) {
      return 0;
    }

    const quantityForPrice = this.getQuantityForPrice(item);
    return quantityForPrice * price;
  }

  formatQuantity(item: OrderItem): string {
    const quantity = Number(item.requestedQuantity ?? 0);
    if (item.requestedUnit === 'UN') {
      return `${Math.trunc(quantity)}un`;
    }

    return `${quantity}kg`;
  }

  getLineVatValue(item: OrderItem): number {
    const subtotal = this.getLineSubtotal(item);
    const vatRate = Number(item.vatRate ?? 0);
    if (!subtotal || !vatRate) {
      return 0;
    }

    return subtotal * (vatRate / 100);
  }

  getLineTotalWithVat(item: OrderItem): number {
    return this.getLineSubtotal(item) + this.getLineVatValue(item);
  }

  getLineBreakdown(item: OrderItem): string {
    const subtotal = this.getLineSubtotal(item);
    const vatRate = Number(item.vatRate ?? 0);
    const vatValue = this.getLineVatValue(item);
    const total = this.getLineTotalWithVat(item);

    return `Total: ${subtotal.toFixed(2)} EUR | IVA: ${vatRate}% | Valor IVA: ${vatValue.toFixed(2)} EUR | Total c/ IVA: ${total.toFixed(2)} EUR`;
  }

  getOrderSubtotal(): number {
    return this.orderItems.reduce((sum, item) => sum + this.getLineSubtotal(item), 0);
  }

  getOrderVatTotal(): number {
    return this.orderItems.reduce((sum, item) => sum + this.getLineVatValue(item), 0);
  }

  getOrderGrandTotal(): number {
    return this.getOrderSubtotal() + this.getOrderVatTotal();
  }

  paymentLabel(type: PaymentType): string {
    const labels: Record<PaymentType, string> = {
      IMMEDIATE: 'Pronto pagamento',
      CREDIT: 'Credito',
      CUSTOMER: 'Conta cliente',
    };

    return labels[type];
  }

  routeChipClass(routeId: string): string {
    return `route-${routeId.toLowerCase()}`;
  }

  routeLabel(routeId: string | null | undefined): string {
    if (!routeId) {
      return '';
    }

    const route = this.routeOptions.find((item) => item.id === routeId);
    return route?.name ?? routeId;
  }

  private onClientChanged(clientId: string): void {
    const establishmentCtrl = this.form.controls.establishmentId;
    const quickClientCtrl = this.form.controls.quickClientName;

    if (!clientId) {
      establishmentCtrl.clearValidators();
      establishmentCtrl.updateValueAndValidity({ emitEvent: false });
      quickClientCtrl.enable({ emitEvent: false });
      quickClientCtrl.addValidators([Validators.required]);
      quickClientCtrl.updateValueAndValidity({ emitEvent: false });

      this.form.patchValue({
        establishmentId: '',
        routeId: '',
        paymentType: null,
      });
      return;
    }

    const client = this.clientOptions.find((item) => item.id === clientId);
    const establishments = this.establishmentOptions.filter((item) => item.clientId === clientId);
    const currentEstablishment = establishmentCtrl.value;

    quickClientCtrl.setValue('', { emitEvent: false });
    quickClientCtrl.disable({ emitEvent: false });
    quickClientCtrl.clearValidators();
    quickClientCtrl.updateValueAndValidity({ emitEvent: false });

    if (establishments.length > 1) {
      establishmentCtrl.addValidators([Validators.required]);
      if (
        !currentEstablishment ||
        !establishments.some((item) => item.id === currentEstablishment)
      ) {
        establishmentCtrl.setValue('', { emitEvent: false });
      }
    } else {
      establishmentCtrl.clearValidators();
      establishmentCtrl.setValue(establishments[0]?.id ?? '', { emitEvent: false });
    }
    establishmentCtrl.updateValueAndValidity({ emitEvent: false });

    const nextEstablishmentId = establishmentCtrl.value ?? '';
    if (nextEstablishmentId) {
      this.onEstablishmentChanged(nextEstablishmentId);
    } else {
      this.form.patchValue({ routeId: '' }, { emitEvent: false });
    }

    this.form.patchValue(
      {
        paymentType: client?.paymentType ?? null,
      },
      { emitEvent: false },
    );
  }

  private onEstablishmentChanged(establishmentId: string): void {
    const establishment = this.establishmentOptions.find((item) => item.id === establishmentId);

    if (!establishment) {
      return;
    }

    this.form.patchValue(
      {
        routeId: establishment.routeId ?? '',
      },
      { emitEvent: false },
    );
  }

  private buildClientOptions(): ClientOption[] {
    const paymentByClient = new Map<string, PaymentType>();

    for (const order of MOCK_ORDERS) {
      if (order.paymentType && !paymentByClient.has(order.clientId)) {
        paymentByClient.set(order.clientId, order.paymentType);
      }
    }

    const uniqueClients = new Map<string, string>();

    for (const establishment of MOCK_ESTABLISHMENTS) {
      if (!uniqueClients.has(establishment.clientId)) {
        uniqueClients.set(establishment.clientId, establishment.name);
      }
    }

    return Array.from(uniqueClients.entries()).map(([id, label]) => ({
      id,
      label,
      paymentType: paymentByClient.get(id),
    }));
  }

  private asOptional(value: string | null | undefined): string | undefined {
    const trimmed = (value ?? '').trim();
    return trimmed.length ? trimmed : undefined;
  }

  private toDateOnlyString(value: Date | null): string | undefined {
    if (!value) {
      return undefined;
    }

    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toDeliveryDateTime(date: Date | null, time: string | null): string | undefined {
    if (!date) {
      return undefined;
    }

    const [hours, minutes] = (time ?? '').split(':');
    const dateTime = new Date(date);

    if (hours && minutes) {
      dateTime.setHours(Number(hours), Number(minutes), 0, 0);
    }

    return dateTime.toISOString();
  }

  private getQuantityForPrice(item: OrderItem): number {
    const requestedQuantity = Number(item.requestedQuantity ?? 0);
    if (requestedQuantity <= 0) {
      return 0;
    }

    if (item.priceUnit === item.requestedUnit || !item.priceUnit) {
      return requestedQuantity;
    }

    if (item.requestedUnit === 'UN' && item.priceUnit === 'KG') {
      const approx = Number(item.approxKgPerUnit ?? 0);
      return approx > 0 ? requestedQuantity * approx : 0;
    }

    return requestedQuantity;
  }
}
