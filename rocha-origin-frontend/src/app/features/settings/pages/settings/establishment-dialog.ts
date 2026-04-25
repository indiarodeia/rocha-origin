import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { Client } from '../../../../core/models/client.model';
import { Establishment } from '../../../../core/models/establishment.model';
import { Route } from '../../../../core/models/route.model';

export interface EstablishmentDialogData {
  mode: 'create' | 'edit';
  establishment?: Establishment;
  clients: Client[];
  routes: Route[];
}

export interface EstablishmentDialogResult {
  clientId: string;
  name: string;
  deliveryStreet?: string;
  deliveryDoorNumber?: string;
  deliveryPostalCode?: string;
  deliveryCity?: string;
  deliveryCountry?: string;
  routeId?: string;
  localContactPhone?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-establishment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  templateUrl: './establishment-dialog.html',
  styleUrl: './establishment-dialog.scss',
})
export class EstablishmentDialogComponent {
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<EstablishmentDialogComponent, EstablishmentDialogResult>,
    @Inject(MAT_DIALOG_DATA) readonly data: EstablishmentDialogData,
  ) {
    this.form = this.fb.group({
      clientId: [data.establishment?.clientId ?? '', Validators.required],
      name: [data.establishment?.name ?? '', [Validators.required, Validators.maxLength(200)]],
      deliveryStreet: [data.establishment?.deliveryStreet ?? '', [Validators.maxLength(255)]],
      deliveryDoorNumber: [data.establishment?.deliveryDoorNumber ?? '', [Validators.maxLength(20)]],
      deliveryPostalCode: [data.establishment?.deliveryPostalCode ?? '', [Validators.maxLength(20)]],
      deliveryCity: [data.establishment?.deliveryCity ?? '', [Validators.maxLength(100)]],
      deliveryCountry: [data.establishment?.deliveryCountry ?? 'Portugal', [Validators.maxLength(100)]],
      routeId: [data.establishment?.apiRouteId ?? '', []],
      localContactPhone: [data.establishment?.localContactPhone ?? '', [Validators.maxLength(30)]],
      isActive: [data.establishment?.isActive ?? true],
    });
  }

  get title(): string {
    return this.data.mode === 'create' ? 'Novo estabelecimento' : 'Editar estabelecimento';
  }

  get subtitle(): string {
    return this.data.mode === 'create'
      ? 'Define os dados base do estabelecimento.'
      : 'Atualiza os dados principais do estabelecimento.';
  }

  get submitLabel(): string {
    return this.data.mode === 'create' ? 'Criar estabelecimento' : 'Guardar alterações';
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.dialogRef.close({
      clientId: String(raw.clientId ?? ''),
      name: String(raw.name ?? '').trim(),
      deliveryStreet: this.toOptionalString(raw.deliveryStreet),
      deliveryDoorNumber: this.toOptionalString(raw.deliveryDoorNumber),
      deliveryPostalCode: this.toOptionalString(raw.deliveryPostalCode),
      deliveryCity: this.toOptionalString(raw.deliveryCity),
      deliveryCountry: this.toOptionalString(raw.deliveryCountry),
      routeId: this.toOptionalString(raw.routeId),
      localContactPhone: this.toOptionalString(raw.localContactPhone),
      isActive: !!raw.isActive,
    });
  }

  private toOptionalString(value: string | null | undefined): string | undefined {
    const trimmed = (value ?? '').trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
