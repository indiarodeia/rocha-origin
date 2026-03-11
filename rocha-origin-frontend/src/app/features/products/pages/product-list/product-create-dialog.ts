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
import { Product } from '../../../../core/models/product.model';

interface ProductCreateDialogData {
  categories: string[];
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
    private readonly dialogRef: MatDialogRef<ProductCreateDialogComponent, Omit<Product, 'id' | 'createdAt'>>,
    @Inject(MAT_DIALOG_DATA) readonly data: ProductCreateDialogData,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', [Validators.required, Validators.minLength(2)]],
      defaultUnit: ['KG' as Product['defaultUnit'], Validators.required],
      defaultPrice: [0, [Validators.required, Validators.min(0)]],
      defaultVatRate: [6, [Validators.required, Validators.min(0), Validators.max(100)]],
      internalCode: [''],
      defaultApproxKgPerUnit: [null as number | null, [Validators.min(0.001)]],
      description: [''],
      isActive: [true],
    });
  }

  get filteredCategories(): string[] {
    const query = (this.form.controls.category.value ?? '').trim().toLowerCase();
    const all = this.data.categories ?? [];

    if (!query) {
      return all.slice(0, 10);
    }

    return all
      .filter((category) => category.toLowerCase().includes(query))
      .slice(0, 10);
  }

  get isUnitUn(): boolean {
    return this.form.controls.defaultUnit.value === 'UN';
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
    this.dialogRef.close({
      name: (raw.name ?? '').trim(),
      category: (raw.category ?? '').trim(),
      defaultUnit: raw.defaultUnit ?? 'KG',
      defaultPrice: this.toOptionalNumber(raw.defaultPrice),
      defaultVatRate: this.toOptionalNumber(raw.defaultVatRate),
      internalCode: this.toOptionalString(raw.internalCode),
      defaultApproxKgPerUnit: this.toOptionalNumber(raw.defaultApproxKgPerUnit),
      description: this.toOptionalString(raw.description),
      isActive: !!raw.isActive,
    });
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
