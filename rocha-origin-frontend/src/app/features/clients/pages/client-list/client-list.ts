import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MOCK_CLIENTS } from '../../../../core/mocks/client.mock';
import { Client } from '../../../../core/models/client.model';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';

interface ClientListRow {
  id: string;
  companyName: string;
  vatNumber: string;
  phone: string;
  city: string;
  paymentType: string;
}

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, ListPageComponent, ...MATERIAL_MODULES],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
})
export class ClientList {
  readonly displayedColumns = [
    'id',
    'companyName',
    'vatNumber',
    'phone',
    'city',
    'paymentType',
  ];

  readonly dataSource = new MatTableDataSource<ClientListRow>(
    MOCK_CLIENTS.map((client) => ({
      id: client.id,
      companyName: client.companyName,
      vatNumber: client.vatNumber,
      phone: client.phone,
      city: client.billingCity ?? '-',
      paymentType: this.paymentLabel(client.defaultPaymentType),
    })),
  );

  paymentLabel(paymentType: Client['defaultPaymentType']): string {
    const labels = {
      IMMEDIATE: 'Pronto pagamento',
      CREDIT: 'Credito',
      CUSTOMER: 'Conta cliente',
    };

    return paymentType ? labels[paymentType] : '-';
  }

  onAddClient(): void {
    // Placeholder until client creation flow exists.
    console.log('Criar novo cliente');
  }
}
