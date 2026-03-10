import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MOCK_SUPPLIERS } from '../../../../core/mocks/supplier.mock';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';

interface SupplierListRow {
  id: string;
  name: string;
  explorationCode: string;
  city: string;
  phone: string;
  certifications: string;
}

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, ListPageComponent, ...MATERIAL_MODULES],
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.scss',
})
export class SupplierList {
  readonly displayedColumns = [
    'id',
    'name',
    'explorationCode',
    'city',
    'phone',
    'certifications',
  ];

  readonly dataSource = new MatTableDataSource<SupplierListRow>(
    MOCK_SUPPLIERS.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      explorationCode: supplier.explorationCode ?? '-',
      city: supplier.addressCity ?? '-',
      phone: supplier.phone ?? '-',
      certifications: supplier.certifications ?? '-',
    })),
  );

  onAddSupplier(): void {
    // Placeholder until supplier creation flow exists.
    console.log('Criar novo fornecedor');
  }
}
