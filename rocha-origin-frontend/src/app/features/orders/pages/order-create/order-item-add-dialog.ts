import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  OrderItemAnimalOption,
  OrderItemLotOption,
  OrderItemMenuItemOption,
  OrderItemTraceabilityOption,
} from '../../../../core/api/mappers/order-item-source.mapper';
import { EstablishmentProductPrice } from '../../../../core/models/establishment.model';
import { OrderItem } from '../../../../core/models/order-item.model';
import { Product } from '../../../../core/models/product.model';
import { TraceabilitySourceType, UnitType } from '../../../../core/models/types.model';

export interface OrderItemDialogData {
  products: Product[];
  establishmentId: string;
  productPrices: EstablishmentProductPrice[];
  menuItems: OrderItemMenuItemOption[];
  animalOptions: OrderItemAnimalOption[];
  lotOptions: OrderItemLotOption[];
  unitOptions: UnitType[];
  traceabilityOptions: OrderItemTraceabilityOption[];
  mode: 'add' | 'edit';
  item?: OrderItem;
}

@Component({
  selector: 'app-order-item-add-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
  templateUrl: './order-item-add-dialog.html',
  styleUrl: './order-item-add-dialog.scss',
})
export class OrderItemAddDialogComponent {
  private readonly fallbackUnitOptions: UnitType[] = ['KG', 'UN'];
  readonly approxWeightUnitOptions: Array<'KG' | 'G'> = ['KG', 'G'];
  private readonly fallbackTraceabilityOptions: OrderItemTraceabilityOption[] = [
    { value: 'NONE', label: 'Nenhum' },
    { value: 'ANIMAL', label: 'Animal' },
    { value: 'LOT', label: 'Lote' },
  ];

  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<OrderItemAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: OrderItemDialogData,
  ) {
    this.form = this.fb.group({
      productSearch: [''],
      productId: ['', Validators.required],
      productName: ['', Validators.required],
      vatRate: [0],

      establishmentMenuItemId: [''],

      requestedUnit: ['KG' as UnitType, Validators.required],
      requestedQuantity: [1, [Validators.required, Validators.min(0.01)]],
      approxWeightUnit: ['KG' as 'KG' | 'G'],
      approxWeightValue: [null as number | null],

      traceabilitySourceType: ['NONE' as TraceabilitySourceType, Validators.required],
      animalSearch: [''],
      animalId: [''],
      lotId: [''],

      priceUnit: ['KG' as UnitType, Validators.required],
      unitPrice: [0, [Validators.min(0)]],

      requestNotes: [''],
    });

    this.form.controls.requestedUnit.valueChanges.subscribe(() => this.applyQuantityRules());
    this.form.controls.priceUnit.valueChanges.subscribe(() => this.applyQuantityRules());

    this.form.controls.traceabilitySourceType.valueChanges.subscribe((source) => {
      const animalCtrl = this.form.controls.animalId;
      const animalSearchCtrl = this.form.controls.animalSearch;
      const lotCtrl = this.form.controls.lotId;

      if (source === 'ANIMAL') {
        animalCtrl.addValidators([Validators.required]);
        lotCtrl.clearValidators();
        lotCtrl.setValue('');
      } else if (source === 'LOT') {
        lotCtrl.addValidators([Validators.required]);
        animalCtrl.clearValidators();
        animalCtrl.setValue('');
        animalSearchCtrl.setValue('');
      } else {
        animalCtrl.clearValidators();
        lotCtrl.clearValidators();
        animalCtrl.setValue('');
        animalSearchCtrl.setValue('');
        lotCtrl.setValue('');
      }

      animalCtrl.updateValueAndValidity({ emitEvent: false });
      lotCtrl.updateValueAndValidity({ emitEvent: false });
    });

    if (data.mode === 'edit' && data.item) {
      this.patchFromExistingItem(data.item);
    }

    this.applyQuantityRules();
  }

  get unitOptions(): UnitType[] {
    return this.data.unitOptions.length > 0 ? this.data.unitOptions : this.fallbackUnitOptions;
  }

  get traceabilityOptions(): OrderItemTraceabilityOption[] {
    return this.data.traceabilityOptions.length > 0
      ? this.data.traceabilityOptions
      : this.fallbackTraceabilityOptions;
  }

  get filteredProducts(): Product[] {
    const query = (this.form.controls.productSearch.value ?? '').trim().toLowerCase();

    if (!query) {
      return this.data.products.slice(0, 8);
    }

    return this.data.products
      .filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          (product.internalCode ?? '').toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      })
      .slice(0, 8);
  }

  get filteredAnimals(): OrderItemAnimalOption[] {
    const query = (this.form.controls.animalSearch.value ?? '').trim().toLowerCase();

    if (!query) {
      return this.data.animalOptions.slice(0, 8);
    }

    return this.data.animalOptions
      .filter((animal) => {
        const slaughterDate = animal.slaughterDate ?? '';
        return (
          animal.identification.toLowerCase().includes(query) ||
          (animal.breed ?? '').toLowerCase().includes(query) ||
          slaughterDate.includes(query)
        );
      })
      .slice(0, 8);
  }

  get hasMenuItems(): boolean {
    return this.data.menuItems.length > 0;
  }

  get isUnitKg(): boolean {
    return this.form.controls.requestedUnit.value === 'KG';
  }

  get traceabilitySource(): TraceabilitySourceType {
    return (this.form.controls.traceabilitySourceType.value ?? 'NONE') as TraceabilitySourceType;
  }

  get submitLabel(): string {
    return this.data.mode === 'edit' ? 'Atualizar produto' : 'Adicionar produto à encomenda';
  }

  onProductSelected(event: MatAutocompleteSelectedEvent): void {
    const productId = String(event.option.value);
    const selectedProduct = this.data.products.find((product) => product.id === productId);

    if (!selectedProduct) {
      return;
    }

    this.form.controls.productSearch.setErrors(null);

    const resolvedUnitPrice = this.resolveProductPrice(selectedProduct);
    const defaultApproxKg = Number(selectedProduct.defaultApproxKgPerUnit ?? 0);
    const useGrams = defaultApproxKg > 0 && defaultApproxKg < 1;
    const approxWeightValue = defaultApproxKg > 0
      ? (useGrams ? defaultApproxKg * 1000 : defaultApproxKg)
      : null;
    const approxWeightUnit: 'KG' | 'G' = useGrams ? 'G' : 'KG';

    this.form.patchValue({
      productSearch: `${selectedProduct.name} (${selectedProduct.internalCode ?? selectedProduct.id})`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      requestedUnit: selectedProduct.defaultUnit,
      unitPrice: resolvedUnitPrice,
      priceUnit: selectedProduct.defaultUnit,
      vatRate: selectedProduct.defaultVatRate ?? 0,
      approxWeightUnit,
      approxWeightValue,
    });
  }

  onAnimalSelected(event: MatAutocompleteSelectedEvent): void {
    const animalId = String(event.option.value);
    const selectedAnimal = this.data.animalOptions.find((animal) => animal.id === animalId);

    if (!selectedAnimal) {
      return;
    }

    this.form.patchValue({
      animalId: selectedAnimal.id,
      animalSearch: selectedAnimal.identification,
    });
  }

  clearProductSelection(): void {
    this.form.controls.productSearch.setErrors(null);
    this.form.patchValue({
      productSearch: '',
      productId: '',
      productName: '',
      vatRate: 0,
      requestedUnit: 'KG',
      requestedQuantity: 1,
      approxWeightUnit: 'KG',
      approxWeightValue: null,
      unitPrice: 0,
      priceUnit: 'KG',
    });
  }

  addItem(): void {
    if (!this.form.controls.productId.value) {
      this.form.controls.productSearch.setErrors({ required: true });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const approxKgPerUnit = this.toApproxKg(value.approxWeightValue, value.approxWeightUnit);
    const selectedMenuItem = this.data.menuItems.find((menuItem) => menuItem.id === value.establishmentMenuItemId);
    const selectedAnimal = this.data.animalOptions.find((animal) => animal.id === value.animalId);
    const selectedLot = this.data.lotOptions.find((lot) => lot.id === value.lotId);
    const freeMenuItemName = this.hasMenuItems ? undefined : this.asOptional(value.establishmentMenuItemId);
    const traceabilityOption = this.traceabilityOptions.find(
      (option) => option.value === (value.traceabilitySourceType ?? 'NONE'),
    );

    const baseItem = this.data.item;
    const item: OrderItem = {
      id: baseItem?.id ?? crypto.randomUUID(),
      orderId: baseItem?.orderId ?? '__PENDING_ORDER__',
      productId: value.productId ?? undefined,
      productName: value.productName ?? '',
      establishmentMenuItemId: this.asOptional(value.establishmentMenuItemId),
      establishmentMenuItemName: selectedMenuItem?.name ?? freeMenuItemName,
      requestedQuantity: Number(value.requestedQuantity ?? 0),
      requestedUnit: (value.requestedUnit ?? 'KG') as UnitType,
      approxKgPerUnit,
      requestNotes: this.asOptional(value.requestNotes),
      unitPrice: this.toOptionalNumber(value.unitPrice),
      priceUnit: (value.priceUnit ?? 'KG') as UnitType,
      vatRate: Number(value.vatRate ?? 0),
      traceabilitySourceType: value.traceabilitySourceType ?? 'NONE',
      traceabilitySourceLabel: traceabilityOption?.label,
      animalId: this.asOptional(value.animalId),
      lotId: this.asOptional(value.lotId),
      animalIdentification: selectedAnimal?.identification,
      lotCode: selectedLot?.label,
      status: baseItem?.status ?? 'PENDING',
    };

    this.dialogRef.close(item);
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

  close(): void {
    this.dialogRef.close();
  }

  private patchFromExistingItem(item: OrderItem): void {
    const animal = this.data.animalOptions.find((option) => option.id === item.animalId);
    const approxAsKg = Number(item.approxKgPerUnit ?? 0);
    const useGrams = approxAsKg > 0 && approxAsKg < 1;

    this.form.patchValue({
      productSearch: item.productName,
      productId: item.productId ?? '',
      productName: item.productName,
      vatRate: item.vatRate ?? 0,
      establishmentMenuItemId: item.establishmentMenuItemId ?? '',
      requestedUnit: item.requestedUnit ?? 'KG',
      requestedQuantity: item.requestedQuantity,
      approxWeightUnit: useGrams ? 'G' : 'KG',
      approxWeightValue: approxAsKg ? (useGrams ? approxAsKg * 1000 : approxAsKg) : null,
      traceabilitySourceType: item.traceabilitySourceType ?? 'NONE',
      animalSearch: animal?.identification ?? '',
      animalId: item.animalId ?? '',
      lotId: item.lotId ?? '',
      priceUnit: item.priceUnit ?? 'KG',
      unitPrice: item.unitPrice ?? 0,
      requestNotes: item.requestNotes ?? '',
    });
  }

  private applyQuantityRules(): void {
    const requestedUnit = this.form.controls.requestedUnit.value;
    const priceUnit = this.form.controls.priceUnit.value;
    const quantityCtrl = this.form.controls.requestedQuantity;
    const approxCtrl = this.form.controls.approxWeightValue;

    if (requestedUnit === 'UN') {
      quantityCtrl.setValidators([
        Validators.required,
        Validators.min(1),
        this.integerNumberValidator(),
      ]);
      approxCtrl.setValidators([Validators.min(0.01)]);
    } else {
      quantityCtrl.setValidators([Validators.required, Validators.min(0.01)]);
      approxCtrl.clearValidators();
      approxCtrl.setValue(null, { emitEvent: false });
    }

    quantityCtrl.updateValueAndValidity({ emitEvent: false });
    approxCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private resolveProductPrice(product: Product): number {
    const specificPrice = this.data.productPrices.find((price) => {
      return (
        price.establishmentId === this.data.establishmentId &&
        price.productId === product.id
      );
    });

    if (specificPrice) {
      return specificPrice.price;
    }

    return product.defaultPrice ?? 0;
  }

  private toApproxKg(value: number | null | undefined, unit: 'KG' | 'G' | null | undefined): number | undefined {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return undefined;
    }

    if (unit === 'G') {
      return numeric / 1000;
    }

    return numeric;
  }

  private integerNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = Number(control.value);
      if (!Number.isFinite(value)) {
        return { integer: true };
      }

      return Number.isInteger(value) ? null : { integer: true };
    };
  }

  private asOptional(value: string | null | undefined): string | undefined {
    const trimmed = (value ?? '').trim();
    return trimmed.length ? trimmed : undefined;
  }

  private toOptionalNumber(value: number | null | undefined): number | undefined {
    const numeric = Number(value ?? 0);

    if (!Number.isFinite(numeric) || numeric <= 0) {
      return undefined;
    }

    return numeric;
  }
}
