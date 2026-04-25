import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { PaymentType } from '../../../../core/api/models';
import { Client } from '../../../../core/models/client.model';

export interface ClientDialogData {
  mode: 'create' | 'edit';
  client?: Client;
  paymentTypes: PaymentType[];
}

export interface ClientDialogResult {
  companyName: string;
  vatNumber: string;
  phone: string;
  email: string;
  billingStreet?: string;
  billingDoorNumber?: string;
  billingPostalCode?: string;
  billingCity?: string;
  billingCountry?: string;
  paymentTypeId: number;
  notes?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-client-dialog',
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
  templateUrl: './client-dialog.html',
  styleUrl: './client-dialog.scss',
})
export class ClientDialogComponent {
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<ClientDialogComponent, ClientDialogResult>,
    @Inject(MAT_DIALOG_DATA) readonly data: ClientDialogData,
  ) {
    this.form = this.fb.group({
      companyName: [data.client?.companyName ?? '', [Validators.required, Validators.maxLength(200)]],
      vatNumber: [data.client?.vatNumber ?? '', [Validators.required, Validators.maxLength(50)]],
      phone: [data.client?.phone ?? '', [Validators.required, Validators.maxLength(30)]],
      email: [
        data.client?.email ?? '',
        [Validators.required, Validators.email, Validators.maxLength(200)],
      ],
      billingStreet: [data.client?.billingStreet ?? '', [Validators.maxLength(255)]],
      billingDoorNumber: [data.client?.billingDoorNumber ?? '', [Validators.maxLength(20)]],
      billingPostalCode: [data.client?.billingPostalCode ?? '', [Validators.maxLength(20)]],
      billingCity: [data.client?.billingCity ?? '', [Validators.maxLength(100)]],
      billingCountry: [data.client?.billingCountry ?? 'Portugal', [Validators.maxLength(100)]],
      paymentTypeId: [data.client?.defaultPaymentTypeId ?? null as number | null, Validators.required],
      notes: [data.client?.notes ?? '', [Validators.maxLength(2000)]],
      isActive: [data.client?.isActive ?? true],
    });
  }

  get title(): string {
    return this.data.mode === 'create' ? 'Novo cliente' : 'Editar cliente';
  }

  get subtitle(): string {
    return this.data.mode === 'create'
      ? 'Define os dados base do cliente.'
      : 'Atualiza os dados principais do cliente.';
  }

  get submitLabel(): string {
    return this.data.mode === 'create' ? 'Criar cliente' : 'Guardar alterações';
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
      companyName: String(raw.companyName ?? '').trim(),
      vatNumber: String(raw.vatNumber ?? '').trim(),
      phone: String(raw.phone ?? '').trim(),
      email: String(raw.email ?? '').trim(),
      billingStreet: this.toOptionalString(raw.billingStreet),
      billingDoorNumber: this.toOptionalString(raw.billingDoorNumber),
      billingPostalCode: this.toOptionalString(raw.billingPostalCode),
      billingCity: this.toOptionalString(raw.billingCity),
      billingCountry: this.toOptionalString(raw.billingCountry),
      paymentTypeId: Number(raw.paymentTypeId),
      notes: this.toOptionalString(raw.notes),
      isActive: !!raw.isActive,
    });
  }

  private toOptionalString(value: string | null | undefined): string | undefined {
    const trimmed = (value ?? '').trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
