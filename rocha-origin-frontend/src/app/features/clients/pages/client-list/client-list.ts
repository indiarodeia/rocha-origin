import { CommonModule } from '@angular/common';
import { afterNextRender, Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { PaymentType as ApiPaymentType } from '../../../../core/api/models';
import { Client } from '../../../../core/models/client.model';
import { ClientsService } from '../../../../core/services/clients.service';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';
import { ClientDialogComponent, ClientDialogResult } from './client-dialog';

interface ClientListRow {
  id: string;
  companyName: string;
  vatNumber: string;
  phone: string;
  city: string;
  paymentTypeLabel: string;
  paymentTypeId?: number;
  email: string;
  createdAt: string;
  statusLabel: string;
  isActive: boolean;
}

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    ListPageComponent,
    MatDialogModule,
    MatSnackBarModule,
    ...MATERIAL_MODULES,
  ],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
})
export class ClientList {
  searchText = '';
  cityFilter = 'ALL';
  paymentTypeFilter = 'ALL';
  sortBy: 'NAME_ASC' | 'NAME_DESC' | 'CREATED_DESC' | 'CREATED_ASC' = 'NAME_ASC';
  pageIndex = 0;
  readonly pageSize = 20;
  totalCount = 0;
  isLoading = true;
  hasError = false;
  isEmpty = false;
  errorMessage = '';
  emptyMessage = 'Não existem clientes para os filtros aplicados.';
  listReady = false;
  paymentTypes: ApiPaymentType[] = [];
  pendingClientId?: string;

  readonly displayedColumns = [
    'companyName',
    'vatNumber',
    'phone',
    'city',
    'paymentType',
    'status',
    'actions',
  ];

  readonly dataSource = new MatTableDataSource<ClientListRow>([]);

  constructor(
    private readonly clientsService: ClientsService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {
    afterNextRender(() => {
      this.listReady = true;
      this.loadPaymentTypes();
      this.loadClients();
    });
  }

  onAddClient(): void {
    if (this.paymentTypes.length === 0) {
      this.snackBar.open('Não foi possível carregar os tipos de pagamento.', 'Fechar', {
        duration: 3200,
      });
      return;
    }

    const dialogRef = this.dialog.open(ClientDialogComponent, {
      width: '860px',
      maxWidth: '96vw',
      autoFocus: false,
      data: {
        mode: 'create',
        paymentTypes: this.paymentTypes,
      },
    });

    dialogRef.afterClosed().subscribe((result?: ClientDialogResult) => {
      if (!result) {
        return;
      }

      this.clientsService.create(result).subscribe({
        next: () => {
          this.snackBar.open('Cliente criado com sucesso.', 'Fechar', { duration: 2800 });
          this.pageIndex = 0;
          this.loadClients();
        },
        error: () => {
          this.snackBar.open('Não foi possível criar o cliente.', 'Fechar', { duration: 3200 });
        },
      });
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.loadClients();
  }

  openEditClient(row: ClientListRow): void {
    if (this.paymentTypes.length === 0) {
      this.snackBar.open('Não foi possível carregar os tipos de pagamento.', 'Fechar', {
        duration: 3200,
      });
      return;
    }

    this.pendingClientId = row.id;

    this.clientsService.getById(row.id).subscribe({
      next: (client) => {
        this.pendingClientId = undefined;

        const dialogRef = this.dialog.open(ClientDialogComponent, {
          width: '860px',
          maxWidth: '96vw',
          autoFocus: false,
          data: {
            mode: 'edit',
            client,
            paymentTypes: this.paymentTypes,
          },
        });

        dialogRef.afterClosed().subscribe((result?: ClientDialogResult) => {
          if (!result) {
            return;
          }

          this.clientsService.update(row.id, result).subscribe({
            next: () => {
              this.snackBar.open('Cliente atualizado com sucesso.', 'Fechar', { duration: 2800 });
              this.loadClients();
            },
            error: () => {
              this.snackBar.open('Não foi possível atualizar o cliente.', 'Fechar', {
                duration: 3200,
              });
            },
          });
        });
      },
      error: () => {
        this.pendingClientId = undefined;
        this.snackBar.open('Não foi possível carregar o cliente.', 'Fechar', { duration: 3200 });
      },
    });
  }

  inactivateClient(row: ClientListRow): void {
    if (!row.isActive) {
      return;
    }

    const confirmed = window.confirm(`Tem a certeza que pretende inativar o cliente "${row.companyName}"?`);
    if (!confirmed) {
      return;
    }

    this.pendingClientId = row.id;
    this.clientsService.setAsInactive(row.id).subscribe({
      next: () => {
        this.pendingClientId = undefined;
        this.snackBar.open('Cliente inativado com sucesso.', 'Fechar', { duration: 2800 });
        this.loadClients();
      },
      error: () => {
        this.pendingClientId = undefined;
        this.snackBar.open('Não foi possível inativar o cliente.', 'Fechar', {
          duration: 3200,
        });
      },
    });
  }

  isRowBusy(row: ClientListRow): boolean {
    return row.id === this.pendingClientId;
  }

  private loadPaymentTypes(): void {
    this.clientsService.getPaymentTypes().subscribe({
      next: (paymentTypes) => {
        this.paymentTypes = paymentTypes;
      },
      error: () => {
        this.paymentTypes = [];
      },
    });
  }

  private loadClients(): void {
    this.isLoading = true;
    this.hasError = false;
    this.isEmpty = false;
    this.errorMessage = '';
    this.dataSource.data = [];

    this.clientsService.search({
      searchText: this.searchText,
      city: this.cityFilter,
      paymentTypeId: this.paymentTypeFilter === 'ALL' ? undefined : Number(this.paymentTypeFilter),
      sortBy: this.sortBy,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    }).subscribe({
      next: ({ items, totalCount }) => {
        if (this.pageIndex > 0 && items.length === 0 && totalCount > 0) {
          this.pageIndex = Math.max(0, Math.ceil(totalCount / this.pageSize) - 1);
          this.loadClients();
          return;
        }

        this.isLoading = false;
        this.totalCount = totalCount;
        const rows = items.map((client) => this.toRow(client));
        this.isEmpty = rows.length === 0;
        this.dataSource.data = rows;
      },
      error: () => {
        this.isLoading = false;
        this.hasError = true;
        this.isEmpty = false;
        this.totalCount = 0;
        this.dataSource.data = [];
        this.errorMessage = 'Não foi possível carregar os clientes. Tente novamente.';
      },
    });
  }

  private toRow(client: Client): ClientListRow {
    return {
      id: client.id,
      companyName: client.companyName,
      vatNumber: client.vatNumber,
      phone: client.phone,
      city: client.billingCity ?? '-',
      paymentTypeLabel: client.defaultPaymentTypeLabel ?? '-',
      paymentTypeId: client.defaultPaymentTypeId,
      email: client.email ?? '',
      createdAt: client.createdAt,
      statusLabel: client.isActive === false ? 'Inativo' : 'Ativo',
      isActive: client.isActive !== false,
    };
  }
}
