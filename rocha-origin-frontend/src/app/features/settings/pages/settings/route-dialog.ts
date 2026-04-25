import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { Route } from '../../../../core/models/route.model';

export interface RouteDialogData {
  mode: 'create' | 'edit';
  route?: Route;
}

export interface RouteDialogResult {
  name: string;
  sortOrder?: number;
  isActive: boolean;
}

@Component({
  selector: 'app-route-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  templateUrl: './route-dialog.html',
  styleUrl: './route-dialog.scss',
})
export class RouteDialogComponent {
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<RouteDialogComponent, RouteDialogResult>,
    @Inject(MAT_DIALOG_DATA) readonly data: RouteDialogData,
  ) {
    this.form = this.fb.group({
      name: [data.route?.name ?? '', [Validators.required, Validators.maxLength(100)]],
      sortOrder: [
        data.route?.sortOrder ?? null as number | null,
        [Validators.min(0), Validators.max(2147483647)],
      ],
      isActive: [data.route?.isActive ?? true, Validators.required],
    });
  }

  get title(): string {
    return this.data.mode === 'create' ? 'Nova rota' : 'Editar rota';
  }

  get subtitle(): string {
    return this.data.mode === 'create'
      ? 'Cria uma rota para ficar disponível no sistema.'
      : 'Atualiza os dados base da rota.';
  }

  get submitLabel(): string {
    return this.data.mode === 'create' ? 'Criar rota' : 'Guardar alterações';
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
    const normalizedSortOrder = raw.sortOrder === null || raw.sortOrder === undefined
      ? undefined
      : Number(raw.sortOrder);

    this.dialogRef.close({
      name: String(raw.name ?? '').trim(),
      sortOrder: Number.isFinite(normalizedSortOrder) ? normalizedSortOrder : undefined,
      isActive: !!raw.isActive,
    });
  }
}
