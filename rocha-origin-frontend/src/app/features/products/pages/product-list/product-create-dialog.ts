import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ProductUpsertInput } from '../../../../core/api/mappers/product.mapper';
import { ProductCategory, ProductUnit } from '../../../../core/api/models';

interface ProductCreateDialogData {
  categories: ProductCategory[];
  units: ProductUnit[];
}

@Component({
  selector: 'app-product-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  templateUrl: './product-create-dialog.html',
  styleUrl: './product-create-dialog.scss',
})
export class ProductCreateDialogComponent {
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<ProductCreateDialogComponent, ProductUpsertInput>,
    @Inject(MAT_DIALOG_DATA) readonly data: ProductCreateDialogData,
  ) {
    const defaultUnit = this.resolveDefaultUnit(data.units);

    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', [Validators.required, Validators.minLength(2)]],
      defaultUnit: [defaultUnit?.id ?? (null as number | null), Validators.required],
      defaultPrice: [0, [Validators.required, Validators.min(0)]],
      defaultVatRate: [6, [Validators.required, Validators.min(0), Validators.max(100)]],
      internalCode: [''],
      defaultApproxKgPerUnit: [null as number | null, [Validators.min(0.001)]],
      description: [''],
      isActive: [true],
    });
  }

  get filteredCategories(): ProductCategory[] {
    const query = (this.form.controls.category.value ?? '').trim().toLowerCase();
    const all = this.data.categories ?? [];

    if (!query) {
      return all.slice(0, 10);
    }

    return all.filter((c) => c.label.toLowerCase().includes(query)).slice(0, 10);
  }

  get isUnitUn(): boolean {
    const selectedId = this.form.controls.defaultUnit.value;
    const unit = this.data.units.find((u) => u.id === selectedId);
    const label = (unit?.label ?? '').toUpperCase();
    return label === 'UN' || label.startsWith('UNID');
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

  onCategorySelected(event: MatAutocompleteSelectedEvent): void {
    const selected = String(event.option.value ?? '').trim();
    this.form.controls.category.setValue(selected);
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const categoryLabel = (raw.category ?? '').trim();
    const found = this.data.categories.find(
      (c) => c.label.toLowerCase() === categoryLabel.toLowerCase(),
    );

    if (!found) {
      this.form.controls.category.setErrors({ notFound: true });
      return;
    }

    this.dialogRef.close({
      name: (raw.name ?? '').trim(),
      productCategoryId: found.id,
      defaultUnitId: raw.defaultUnit!,
      defaultVatRate: this.toOptionalNumber(raw.defaultVatRate),
      defaultSellPrice: this.toOptionalNumber(raw.defaultPrice),
      internalCode: this.toOptionalString(raw.internalCode),
      description: this.toOptionalString(raw.description),
      isActive: !!raw.isActive,
    });
  }

  private resolveDefaultUnit(units: ProductUnit[]): ProductUnit | undefined {
    return units.find((u) => u.label.toUpperCase() === 'KG') ?? units[0];
  }

  private toOptionalString(value: string | null | undefined): string | undefined {
    const trimmed = (value ?? '').trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private toOptionalNumber(value: number | null | undefined): number | undefined {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }
}
