import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, NgZone, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
import { catchError, forkJoin, map, of } from 'rxjs';

import {
  DeliveryType as ApiDeliveryType,
  PaymentType as ApiPaymentType,
  ProductUnit,
  TraceabilitySourceType,
} from '../../../../core/api/models';
import {
  mapApiProductUnitLabelToUiUnit,
  mapApiTraceabilityLabelToOption,
  OrderItemTraceabilityOption,
} from '../../../../core/api/mappers/order-item-source.mapper';
import {
  mapOrderCreateInputToSaveOrderRequest,
  OrderCreateInput,
} from '../../../../core/api/mappers/order.mapper';
import { buildRouteVisualClass } from '../../../../core/api/mappers/route.mapper';
import { Client } from '../../../../core/models/client.model';
import { Establishment } from '../../../../core/models/establishment.model';
import { Order } from '../../../../core/models/order.model';
import { OrderItem } from '../../../../core/models/order-item.model';
import { Route } from '../../../../core/models/route.model';
import { TraceabilitySourceType as UiTraceabilitySourceType, UnitType } from '../../../../core/models/types.model';
import { ClientsService } from '../../../../core/services/clients.service';
import { EstablishmentsService } from '../../../../core/services/establishments.service';
import { OrderItemsService } from '../../../../core/services/order-items.service';
import { OrderItemSourcesService } from '../../../../core/services/order-item-sources.service';
import { OrdersService } from '../../../../core/services/orders.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { environment } from '../../../../../environments/environment';
import { OrderItemAddDialogComponent } from './order-item-add-dialog';

interface ClientOption {
  id: string;
  label: string;
  paymentTypeId?: number;
}

interface ItemCreateFailure {
  item: OrderItem;
}

interface DialogSourceState {
  isLoading: boolean;
}

type SubmitFeedbackState = 'success' | 'partial' | 'error';

interface SubmitFeedback {
  state: SubmitFeedbackState;
  title: string;
  message: string;
  orderId?: string;
  failedItems?: string[];
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
export class OrderCreate implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly loggedUserId = 'user_logged';

  readonly orderItemsColumns = [
    'productName',
    'requestedUnit',
    'requestedQuantity',
    'unitPrice',
    'lineSubtotal',
    'actions',
  ];

  clientOptions: ClientOption[] = [];
  establishmentOptions: Establishment[] = [];
  routeOptions: Route[] = [];
  paymentTypeOptions: ApiPaymentType[] = [];
  deliveryTypeOptions: ApiDeliveryType[] = [];

  ordersCount = 0;
  lastCreatedOrder?: Order;
  orderItems: OrderItem[] = [];
  isSubmitting = false;
  itemDialogSourceState: DialogSourceState = { isLoading: false };
  submitFeedback: SubmitFeedback | null = null;

  readonly form;

  private pendingOrderStatusId?: number;
  private productUnitsByUiUnit = new Map<UnitType, ProductUnit>();
  private traceabilityTypesByUiKey = new Map<UiTraceabilitySourceType, TraceabilitySourceType>();
  private productUnitOptions: UnitType[] = ['KG', 'UN'];
  private traceabilityOptionItems: OrderItemTraceabilityOption[] = [
    { value: 'NONE', label: 'Nenhum' },
    { value: 'ANIMAL', label: 'Animal' },
    { value: 'LOT', label: 'Lote' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly routesService: RoutesService,
    private readonly clientsService: ClientsService,
    private readonly establishmentsService: EstablishmentsService,
    private readonly ordersService: OrdersService,
    private readonly orderItemsService: OrderItemsService,
    private readonly orderItemSourcesService: OrderItemSourcesService,
  ) {
    this.form = this.fb.group({
      clientId: ['', Validators.required],
      establishmentId: [''],
      quickClientName: [''],
      routeId: [''],
      deliveryDate: [null as Date | null],
      deliveryDeadlineTime: [''],
      deliveryTypeId: [null as number | null, Validators.required],
      isUrgent: [false],
      paymentTypeId: [null as number | null, Validators.required],
      notes: [''],
    });

    this.form.controls.clientId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((clientId) => this.onClientChanged(clientId ?? ''));

    this.form.controls.establishmentId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((establishmentId) => this.onEstablishmentChanged(establishmentId ?? ''));

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.isSubmitting && this.submitFeedback) {
          this.clearSubmitFeedback();
        }
      });
  }

  ngOnInit(): void {
    this.loadReferenceData();
  }

  get filteredEstablishments(): Establishment[] {
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

  trackByOrderItemId = (_index: number, item: OrderItem): string => item.id;

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.pendingOrderStatusId) {
      this.snackBar.open('Não foi possível resolver o estado inicial da encomenda.', 'Fechar', {
        duration: 3600,
      });
      return;
    }

    const value = this.form.getRawValue();
    const selectedRoute = this.routeOptions.find((route) => route.id === value.routeId);
    const selectedPaymentTypeId = value.paymentTypeId ?? undefined;
    const selectedDeliveryTypeId = value.deliveryTypeId ?? undefined;

    if (!selectedPaymentTypeId || !selectedDeliveryTypeId) {
      this.snackBar.open('Preencha o tipo de entrega e o tipo de pagamento.', 'Fechar', {
        duration: 3200,
      });
      return;
    }

    const itemContexts = this.buildItemContexts(this.orderItems);
    if (!itemContexts) {
      this.snackBar.open('Não foi possível mapear os itens para o backend.', 'Fechar', {
        duration: 3600,
      });
      return;
    }

    this.clearSubmitFeedback();
    this.lastCreatedOrder = undefined;
    this.isSubmitting = true;

    const orderCreateInput: OrderCreateInput = {
      clientId: value.clientId ?? '',
      establishmentId: this.asNullable(value.establishmentId),
      quickClientName: this.asNullable(value.quickClientName),
      orderStatusId: this.pendingOrderStatusId,
      deliveryDate: this.toDeliveryDateIso(value.deliveryDate),
      deliveryDeadlineTime: this.toDeliveryDeadlineTime(value.deliveryDeadlineTime),
      deliveryTypeId: selectedDeliveryTypeId,
      isUrgent: !!value.isUrgent,
      routeId: selectedRoute?.apiId ?? null,
      paymentTypeId: selectedPaymentTypeId,
      notes: this.asNullable(value.notes),
      createdByUserId: this.loggedUserId,
    };

    if (!environment.production) {
      console.debug(
        'POST /api/Orders payload',
        mapOrderCreateInputToSaveOrderRequest(orderCreateInput),
      );
    }

    this.ordersService.create(orderCreateInput).subscribe({
      next: (createdOrder) => {
        this.lastCreatedOrder = createdOrder;

        if (this.orderItems.length === 0) {
          this.finishSuccessfulSubmit(createdOrder, 0);
          return;
        }

        forkJoin(
          this.orderItems.map((item, index) =>
            this.orderItemsService.create(item, {
              ...itemContexts[index],
              orderId: createdOrder.id,
              orderStatusId: this.pendingOrderStatusId as number,
            }).pipe(
              map(() => ({ ok: true as const })),
              catchError(() => of({ ok: false as const, item })),
            ),
          ),
        ).subscribe({
          next: (results) => {
            const failures = results.filter((result): result is { ok: false; item: OrderItem } => !result.ok);
            if (failures.length === 0) {
              this.finishSuccessfulSubmit(createdOrder, this.orderItems.length);
              return;
            }

            this.finishPartialSubmit(createdOrder, failures);
          },
          error: () => {
            this.isSubmitting = false;
            this.submitFeedback = {
              state: 'partial',
              title: 'Encomenda criada com falha nos itens',
              message: `A encomenda ${createdOrder.id} foi criada, mas não foi possível confirmar a gravação dos itens. Os itens foram mantidos localmente.`,
              orderId: createdOrder.id,
              failedItems: this.buildItemLabels(this.orderItems),
            };
            this.snackBar.open(
              `Encomenda ${createdOrder.id} criada, mas os itens não foram gravados.`,
              'Fechar',
              { duration: 4600 },
            );
          },
        });
      },
      error: (error: unknown) => {
        const backendMessage = this.extractBackendErrorMessage(error);
        this.logBackendValidationError(error);
        this.isSubmitting = false;
        this.submitFeedback = {
          state: 'error',
          title: 'Falha ao criar encomenda',
          message: backendMessage,
        };
        this.snackBar.open(backendMessage, 'Fechar', {
          duration: 3600,
        });
      },
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
    if (this.isSubmitting) {
      return;
    }

    const establishmentId = this.form.controls.establishmentId.value ?? '';
    this.openOrderItemDialog('add', establishmentId);
  }

  editOrderItem(item: OrderItem): void {
    if (this.isSubmitting) {
      return;
    }

    const establishmentId = this.form.controls.establishmentId.value ?? '';
    this.openOrderItemDialog('edit', establishmentId, item);
  }

  removeOrderItem(itemId: string): void {
    if (this.isSubmitting) {
      return;
    }

    const targetItem = this.orderItems.find((item) => item.id === itemId);
    if (!targetItem) {
      return;
    }

    const confirmed = window.confirm('Tem a certeza que pretende eliminar este produto?');
    if (!confirmed) {
      return;
    }

    this.orderItems = this.orderItems.filter((item) => item.id !== itemId);
    this.clearSubmitFeedback();
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

  getItemTraceabilitySummary(item: OrderItem): string {
    const source = item.traceabilitySourceLabel ?? this.getFallbackTraceabilityLabel(item);

    if (item.traceabilitySourceType === 'ANIMAL') {
      return item.animalIdentification ? `${source}: ${item.animalIdentification}` : source;
    }

    if (item.traceabilitySourceType === 'LOT') {
      return item.lotCode ? `${source}: ${item.lotCode}` : source;
    }

    return source;
  }

  getItemDescriptionSummary(item: OrderItem): string | null {
    if (item.establishmentMenuItemName) {
      return `Menu: ${item.establishmentMenuItemName}`;
    }

    if (item.requestNotes) {
      return `Notas: ${item.requestNotes}`;
    }

    return null;
  }

  getItemPriceSummary(item: OrderItem): string {
    const unit = item.priceUnit ?? item.requestedUnit;
    const vatRate = Number(item.vatRate ?? 0);
    const unitPrice = Number(item.unitPrice ?? 0);

    if (!unitPrice) {
      return vatRate ? `IVA ${vatRate}%` : 'Sem preço definido';
    }

    return `${unitPrice.toFixed(2)} EUR/${unit} | IVA ${vatRate}%`;
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

  get hasSubmitFeedback(): boolean {
    return this.submitFeedback !== null;
  }

  paymentLabel(typeId: number): string {
    return this.paymentTypeOptions.find((type) => type.id === typeId)?.label ?? String(typeId);
  }

  routeChipClass(routeId: string): string {
    const route = this.routeOptions.find((item) => item.id === routeId);
    return route ? buildRouteVisualClass(route) : `route-${routeId.toLowerCase()}`;
  }

  routeLabel(routeId: string | null | undefined): string {
    if (!routeId) {
      return '';
    }

    const route = this.routeOptions.find((item) => item.id === routeId);
    return route?.name ?? routeId;
  }

  private loadReferenceData(): void {
    forkJoin({
      clients: this.clientsService.search({
        searchText: '',
        city: 'ALL',
        sortBy: 'NAME_ASC',
        pageIndex: 0,
        pageSize: 500,
      }),
      establishments: this.establishmentsService.getAll(),
      routes: this.routesService.getActive(),
      paymentTypes: this.clientsService.getPaymentTypes(),
      deliveryTypes: this.ordersService.getDeliveryTypes(),
      orderStatuses: this.ordersService.getOrderStatuses(),
      productUnits: this.orderItemsService.getProductUnits(),
      traceabilityTypes: this.orderItemsService.getTraceabilitySourceTypes(),
    }).subscribe({
      next: ({
        clients,
        establishments,
        routes,
        paymentTypes,
        deliveryTypes,
        orderStatuses,
        productUnits,
        traceabilityTypes,
      }) => {
        this.clientOptions = clients.items
          .filter((client) => client.isActive !== false)
          .map((client) => this.toClientOption(client));
        this.establishmentOptions = establishments.filter((establishment) => establishment.isActive);
        this.routeOptions = routes;
        this.paymentTypeOptions = paymentTypes;
        this.deliveryTypeOptions = deliveryTypes;
        this.pendingOrderStatusId = this.resolvePendingOrderStatusId(orderStatuses);
        this.productUnitsByUiUnit = this.buildProductUnitsMap(productUnits);
        this.traceabilityTypesByUiKey = this.buildTraceabilityTypesMap(traceabilityTypes);
        this.productUnitOptions = this.buildProductUnitOptions(productUnits);
        this.traceabilityOptionItems = this.buildTraceabilityOptions(traceabilityTypes);

        if (!this.form.controls.deliveryTypeId.value && deliveryTypes.length > 0) {
          this.form.patchValue(
            {
              deliveryTypeId: deliveryTypes[0].id,
            },
            { emitEvent: false },
          );
        }

        this.onClientChanged(this.form.controls.clientId.value ?? '');
        this.cdr.detectChanges();
      },
      error: () => {
        this.clientOptions = [];
        this.establishmentOptions = [];
        this.routeOptions = [];
        this.paymentTypeOptions = [];
        this.deliveryTypeOptions = [];
        this.pendingOrderStatusId = undefined;
        this.productUnitOptions = ['KG', 'UN'];
        this.traceabilityOptionItems = [
          { value: 'NONE', label: 'Nenhum' },
          { value: 'ANIMAL', label: 'Animal' },
          { value: 'LOT', label: 'Lote' },
        ];
        this.snackBar.open('Não foi possível carregar os dados da encomenda.', 'Fechar', {
          duration: 3600,
        });
      },
    });
  }

  private onClientChanged(clientId: string): void {
    const establishmentCtrl = this.form.controls.establishmentId;

    if (!clientId) {
      establishmentCtrl.clearValidators();
      establishmentCtrl.updateValueAndValidity({ emitEvent: false });

      this.form.patchValue(
        {
          establishmentId: '',
          routeId: '',
          paymentTypeId: null,
        },
        { emitEvent: false },
      );
      return;
    }

    const client = this.clientOptions.find((item) => item.id === clientId);
    const establishments = this.establishmentOptions.filter((item) => item.clientId === clientId);
    const currentEstablishment = establishmentCtrl.value;

    if (establishments.length > 1) {
      establishmentCtrl.addValidators([Validators.required]);
      if (!currentEstablishment || !establishments.some((item) => item.id === currentEstablishment)) {
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
        paymentTypeId: client?.paymentTypeId ?? null,
      },
      { emitEvent: false },
    );
  }

  private onEstablishmentChanged(establishmentId: string): void {
    const establishment = this.establishmentOptions.find((item) => item.id === establishmentId);

    if (!establishment) {
      this.form.patchValue(
        {
          routeId: '',
        },
        { emitEvent: false },
      );
      return;
    }

    this.form.patchValue(
      {
        routeId: establishment.routeId ?? '',
      },
      { emitEvent: false },
    );
  }

  private toClientOption(client: Client): ClientOption {
    return {
      id: client.id,
      label: client.companyName,
      paymentTypeId: client.defaultPaymentTypeId,
    };
  }

  private resolvePendingOrderStatusId(statuses: Array<{ id: number; label: string }>): number | undefined {
    const pending = statuses.find((status) => {
      const normalized = this.normalizeLabel(status.label);
      return normalized.includes('pendent') || normalized === 'pending';
    });

    return pending?.id ?? statuses[0]?.id;
  }

  private buildProductUnitsMap(units: ProductUnit[]): Map<UnitType, ProductUnit> {
    const mapping = new Map<UnitType, ProductUnit>();

    units.forEach((unit) => {
      const normalized = this.normalizeLabel(unit.label);
      if ((normalized === 'kg' || normalized.includes('quilo')) && !mapping.has('KG')) {
        mapping.set('KG', unit);
      }

      if ((normalized === 'un' || normalized.includes('unidad')) && !mapping.has('UN')) {
        mapping.set('UN', unit);
      }
    });

    return mapping;
  }

  private buildTraceabilityTypesMap(
    types: TraceabilitySourceType[],
  ): Map<UiTraceabilitySourceType, TraceabilitySourceType> {
    const mapping = new Map<UiTraceabilitySourceType, TraceabilitySourceType>();

    types.forEach((type) => {
      const normalized = this.normalizeLabel(type.label);

      if (normalized.includes('animal') && !mapping.has('ANIMAL')) {
        mapping.set('ANIMAL', type);
      }

      if (normalized.includes('lot') && !mapping.has('LOT')) {
        mapping.set('LOT', type);
      }

      if ((normalized.includes('nenhum') || normalized.includes('sem') || normalized.includes('none')) && !mapping.has('NONE')) {
        mapping.set('NONE', type);
      }
    });

    return mapping;
  }

  private buildProductUnitOptions(units: ProductUnit[]): UnitType[] {
    const options = units
      .map((unit) => mapApiProductUnitLabelToUiUnit(unit.label))
      .filter((value): value is UnitType => value !== null);

    return options.length > 0 ? Array.from(new Set(options)) : ['KG', 'UN'];
  }

  private buildTraceabilityOptions(types: TraceabilitySourceType[]): OrderItemTraceabilityOption[] {
    const options = types
      .map((type) => mapApiTraceabilityLabelToOption(type.id, type.label))
      .filter((value): value is OrderItemTraceabilityOption => value !== null);

    const uniqueOptions = Array.from(
      new Map(options.map((option) => [option.value, option])).values(),
    );

    return uniqueOptions.length > 0
      ? uniqueOptions
      : [
          { value: 'NONE', label: 'Nenhum' },
          { value: 'ANIMAL', label: 'Animal' },
          { value: 'LOT', label: 'Lote' },
        ];
  }

  private buildItemContexts(items: OrderItem[]): Array<{
    requestedUnitId: number;
    priceUnitId: number;
    traceabilitySourceTypeId: number;
  }> | null {
    const contexts: Array<{
      requestedUnitId: number;
      priceUnitId: number;
      traceabilitySourceTypeId: number;
    }> = [];

    for (const item of items) {
      const requestedUnit = this.productUnitsByUiUnit.get(item.requestedUnit);
      const priceUnit = this.productUnitsByUiUnit.get(item.priceUnit ?? item.requestedUnit);
      const traceabilityType = this.traceabilityTypesByUiKey.get(item.traceabilitySourceType ?? 'NONE');

      if (!requestedUnit || !priceUnit || !traceabilityType) {
        return null;
      }

      contexts.push({
        requestedUnitId: requestedUnit.id,
        priceUnitId: priceUnit.id,
        traceabilitySourceTypeId: traceabilityType.id,
      });
    }

    return contexts;
  }

  private finishSuccessfulSubmit(order: Order, itemCount: number): void {
    this.isSubmitting = false;
    this.ordersCount += 1;
    this.resetAfterSuccessfulSubmit();
    this.submitFeedback = {
      state: 'success',
      title: 'Encomenda criada com sucesso',
      message:
        itemCount > 0
          ? `A encomenda ${order.id} foi criada com ${itemCount} item(ns).`
          : `A encomenda ${order.id} foi criada sem itens.`,
      orderId: order.id,
    };
    this.snackBar.open(
      itemCount > 0
        ? `Encomenda ${order.id} criada com ${itemCount} item(ns).`
        : `Encomenda ${order.id} criada com sucesso.`,
      'Fechar',
      { duration: 3600 },
    );
  }

  private finishPartialSubmit(order: Order, failures: ItemCreateFailure[]): void {
    this.isSubmitting = false;
    this.ordersCount += 1;
    this.resetAfterPartialSubmit(failures);
    this.submitFeedback = {
      state: 'partial',
      title: 'Encomenda criada parcialmente',
      message: `A encomenda ${order.id} foi criada, mas ${failures.length} item(ns) falharam. Os itens em falta foram mantidos localmente para nova tentativa.`,
      orderId: order.id,
      failedItems: this.buildItemLabels(failures.map((failure) => failure.item)),
    };
    this.snackBar.open(
      `Encomenda ${order.id} criada, mas ${failures.length} item(ns) falharam.`,
      'Fechar',
      { duration: 5200 },
    );
  }

  private resetAfterSuccessfulSubmit(): void {
    this.orderItems = [];
    this.form.patchValue({
      deliveryDate: null,
      deliveryDeadlineTime: '',
      isUrgent: false,
      notes: '',
    });
  }

  private resetAfterPartialSubmit(failures: ItemCreateFailure[]): void {
    this.orderItems = failures.map((failure) => failure.item);
    this.form.patchValue({
      deliveryDate: null,
      deliveryDeadlineTime: '',
      isUrgent: false,
      notes: '',
    });
  }

  private getQuantityForPrice(item: OrderItem): number {
    const quantity = Number(item.requestedQuantity ?? 0);

    if (!quantity) {
      return 0;
    }

    if (item.priceUnit === 'UN') {
      return quantity;
    }

    if (item.requestedUnit === 'KG') {
      return quantity;
    }

    const approxKgPerUnit = Number(item.approxKgPerUnit ?? 0);
    return approxKgPerUnit > 0 ? quantity * approxKgPerUnit : 0;
  }

  private asNullable(value: string | null | undefined): string | null {
    const trimmed = (value ?? '').trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toDeliveryDateIso(value: Date | null): string | null {
    if (!value) {
      return null;
    }

    const localDate = new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0);
    return localDate.toISOString();
  }

  private toDeliveryDeadlineTime(value: string | null | undefined): string | null {
    const trimmed = (value ?? '').trim();
    if (!trimmed) {
      return null;
    }

    return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
  }

  private normalizeLabel(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private extractBackendErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Não foi possível criar a encomenda. Reveja os dados e tente novamente.';
    }

    const problem = error.error;
    if (!problem || typeof problem !== 'object') {
      return 'Não foi possível criar a encomenda. Reveja os dados e tente novamente.';
    }

    const messages: string[] = [];
    const errors = (problem as { errors?: unknown }).errors;

    if (errors && typeof errors === 'object') {
      Object.entries(errors as Record<string, unknown>).forEach(([field, value]) => {
        const fieldMessages = Array.isArray(value) ? value : [value];
        fieldMessages
          .filter((message): message is string => typeof message === 'string' && message.trim().length > 0)
          .forEach((message) => messages.push(`${field}: ${message}`));
      });
    }

    if (messages.length > 0) {
      return messages.join(' ');
    }

    const detail = (problem as { detail?: unknown }).detail;
    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail.trim();
    }

    const title = (problem as { title?: unknown }).title;
    if (typeof title === 'string' && title.trim().length > 0) {
      return title.trim();
    }

    return 'Não foi possível criar a encomenda. Reveja os dados e tente novamente.';
  }

  private logBackendValidationError(error: unknown): void {
    if (!(error instanceof HttpErrorResponse) || error.status !== 400) {
      return;
    }

    const problem = error.error;
    const fields =
      problem && typeof problem === 'object' && 'errors' in problem
        ? Object.keys((problem as { errors?: Record<string, unknown> }).errors ?? {})
        : [];

    console.warn('Order create validation failed', {
      status: error.status,
      title:
        problem && typeof problem === 'object' && 'title' in problem
          ? (problem as { title?: unknown }).title
          : undefined,
      fields,
    });
  }

  private openOrderItemDialog(
    mode: 'add' | 'edit',
    establishmentId: string,
    item?: OrderItem,
  ): void {
    const fallbackMenuItems = this.establishmentOptions.find((current) => current.id === establishmentId)?.menuItems ?? [];

    this.itemDialogSourceState = { isLoading: true };

    this.orderItemSourcesService.loadDialogSources(establishmentId, fallbackMenuItems).subscribe({
      next: (sources) => {
        this.itemDialogSourceState = { isLoading: false };

        const dialogRef = this.dialog.open(OrderItemAddDialogComponent, {
          width: '760px',
          maxWidth: '95vw',
          autoFocus: false,
          restoreFocus: false,
          data: {
            ...sources,
            establishmentId,
            unitOptions: this.productUnitOptions,
            traceabilityOptions: this.traceabilityOptionItems,
            mode,
            item,
          },
        });

        dialogRef.beforeClosed().subscribe((resultItem: OrderItem | undefined) => {
          if (!resultItem) {
            return;
          }

          this.ngZone.run(() => {
            if (mode === 'edit') {
              this.orderItems = this.orderItems.map((currentItem) =>
                currentItem.id === item?.id ? this.normalizeDraftItem(resultItem, currentItem.id) : currentItem,
              );
            } else {
              this.orderItems = [...this.orderItems, this.normalizeDraftItem(resultItem)];
            }

            this.clearSubmitFeedback();
            this.cdr.detectChanges();
          });
        });
      },
      error: () => {
        this.itemDialogSourceState = { isLoading: false };
        this.snackBar.open('Não foi possível carregar as fontes do item.', 'Fechar', {
          duration: 3600,
        });
      },
    });
  }

  private normalizeDraftItem(item: OrderItem, preservedId?: string): OrderItem {
    const nextId = preservedId ?? item.id;

    if (!nextId || this.hasConflictingDraftId(nextId, preservedId)) {
      return {
        ...item,
        id: `draft-item-${crypto.randomUUID()}`,
      };
    }

    return {
      ...item,
      id: nextId,
    };
  }

  private hasConflictingDraftId(nextId: string, preservedId?: string): boolean {
    return this.orderItems.some((item) => item.id === nextId && item.id !== preservedId);
  }

  private getFallbackTraceabilityLabel(item: OrderItem): string {
    switch (item.traceabilitySourceType) {
      case 'ANIMAL':
        return 'Animal';
      case 'LOT':
        return 'Lote';
      default:
        return 'Nenhum';
    }
  }

  private buildItemLabels(items: OrderItem[]): string[] {
    return items.map((item) => {
      const traceability = this.getItemTraceabilitySummary(item);
      return `${item.productName} (${this.formatQuantity(item)})${traceability ? ` - ${traceability}` : ''}`;
    });
  }

  private clearSubmitFeedback(): void {
    this.submitFeedback = null;
  }
}
