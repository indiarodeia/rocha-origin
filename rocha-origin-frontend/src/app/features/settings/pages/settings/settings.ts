import { CommonModule } from '@angular/common';
import { afterNextRender, Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { buildRouteVisualClass } from '../../../../core/api/mappers/route.mapper';
import { Client } from '../../../../core/models/client.model';
import { Establishment } from '../../../../core/models/establishment.model';
import { Route } from '../../../../core/models/route.model';
import { ClientsService } from '../../../../core/services/clients.service';
import { EstablishmentsService } from '../../../../core/services/establishments.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';
import {
  EstablishmentDialogComponent,
  EstablishmentDialogResult,
} from './establishment-dialog';
import {
  RouteDialogComponent,
  RouteDialogResult,
} from './route-dialog';

interface RouteListRow {
  id: string;
  apiId?: string;
  name: string;
  sortOrder: number | null;
  statusLabel: string;
  statusClass: string;
  visualClass: string;
  isActive: boolean;
}

interface EstablishmentListRow {
  id: string;
  clientName: string;
  name: string;
  city: string;
  routeName: string;
  localContactPhone: string;
  statusLabel: string;
  statusClass: string;
  isActive: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ListPageComponent, MatDialogModule, MatSnackBarModule, ...MATERIAL_MODULES],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  readonly routeDisplayedColumns = ['name', 'sortOrder', 'status', 'actions'];
  readonly routeDataSource = new MatTableDataSource<RouteListRow>([]);
  readonly establishmentDisplayedColumns = ['client', 'name', 'city', 'route', 'phone', 'status', 'actions'];
  readonly establishmentDataSource = new MatTableDataSource<EstablishmentListRow>([]);

  listReady = false;

  routeLoading = true;
  routeHasError = false;
  routeIsEmpty = false;
  routeErrorMessage = '';
  routeEmptyMessage = 'Ainda não existem rotas registadas.';
  pendingRouteApiId?: string;

  establishmentLoading = true;
  establishmentHasError = false;
  establishmentIsEmpty = false;
  establishmentErrorMessage = '';
  establishmentEmptyMessage = 'Ainda não existem estabelecimentos registados.';
  pendingEstablishmentId?: string;

  private routeOptions: Route[] = [];
  private clientOptions: Client[] = [];

  constructor(
    private readonly routesService: RoutesService,
    private readonly clientsService: ClientsService,
    private readonly establishmentsService: EstablishmentsService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {
    afterNextRender(() => {
      this.listReady = true;
      this.loadSupportData();
      this.loadRoutes();
      this.loadEstablishments();
    });
  }

  openCreateRouteDialog(): void {
    const dialogRef = this.dialog.open(RouteDialogComponent, {
      width: '560px',
      maxWidth: '96vw',
      autoFocus: false,
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result?: RouteDialogResult) => {
      if (!result) {
        return;
      }

      this.routesService.create(result).subscribe({
        next: () => {
          this.snackBar.open('Rota criada com sucesso.', 'Fechar', { duration: 2800 });
          this.loadRoutes();
          this.loadSupportData();
        },
        error: () => {
          this.snackBar.open('Não foi possível criar a rota.', 'Fechar', { duration: 3200 });
        },
      });
    });
  }

  openEditRouteDialog(row: RouteListRow): void {
    if (!row.apiId) {
      this.snackBar.open('A rota selecionada não tem identificador de backend.', 'Fechar', {
        duration: 3200,
      });
      return;
    }

    this.pendingRouteApiId = row.apiId;
    this.routesService.getById(row.apiId).subscribe({
      next: (route) => {
        this.pendingRouteApiId = undefined;

        const dialogRef = this.dialog.open(RouteDialogComponent, {
          width: '560px',
          maxWidth: '96vw',
          autoFocus: false,
          data: { mode: 'edit', route },
        });

        dialogRef.afterClosed().subscribe((result?: RouteDialogResult) => {
          if (!result) {
            return;
          }

          this.routesService.update(route.apiId ?? row.apiId ?? '', result).subscribe({
            next: () => {
              this.snackBar.open('Rota atualizada com sucesso.', 'Fechar', { duration: 2800 });
              this.loadRoutes();
              this.loadSupportData();
              this.loadEstablishments();
            },
            error: () => {
              this.snackBar.open('Não foi possível atualizar a rota.', 'Fechar', {
                duration: 3200,
              });
            },
          });
        });
      },
      error: () => {
        this.pendingRouteApiId = undefined;
        this.snackBar.open('Não foi possível carregar a rota.', 'Fechar', { duration: 3200 });
      },
    });
  }

  inactivateRoute(row: RouteListRow): void {
    if (!row.apiId || !row.isActive) {
      return;
    }

    const confirmed = window.confirm(`Tem a certeza que pretende inativar a rota "${row.name}"?`);
    if (!confirmed) {
      return;
    }

    this.pendingRouteApiId = row.apiId;
    this.routesService.setAsInactive(row.apiId).subscribe({
      next: () => {
        this.pendingRouteApiId = undefined;
        this.snackBar.open('Rota inativada com sucesso.', 'Fechar', { duration: 2800 });
        this.loadRoutes();
        this.loadSupportData();
        this.loadEstablishments();
      },
      error: () => {
        this.pendingRouteApiId = undefined;
        this.snackBar.open('Não foi possível inativar a rota.', 'Fechar', { duration: 3200 });
      },
    });
  }

  openCreateEstablishmentDialog(): void {
    if (this.clientOptions.length === 0) {
      this.snackBar.open('Não foi possível carregar os clientes para o estabelecimento.', 'Fechar', {
        duration: 3200,
      });
      return;
    }

    const dialogRef = this.dialog.open(EstablishmentDialogComponent, {
      width: '900px',
      maxWidth: '96vw',
      autoFocus: false,
      data: {
        mode: 'create',
        clients: this.clientOptions,
        routes: this.routeOptions.filter((route) => route.isActive),
      },
    });

    dialogRef.afterClosed().subscribe((result?: EstablishmentDialogResult) => {
      if (!result) {
        return;
      }

      this.establishmentsService.create(result).subscribe({
        next: () => {
          this.snackBar.open('Estabelecimento criado com sucesso.', 'Fechar', { duration: 2800 });
          this.loadEstablishments();
        },
        error: () => {
          this.snackBar.open('Não foi possível criar o estabelecimento.', 'Fechar', {
            duration: 3200,
          });
        },
      });
    });
  }

  openEditEstablishmentDialog(row: EstablishmentListRow): void {
    if (this.clientOptions.length === 0) {
      this.snackBar.open('Não foi possível carregar os clientes para o estabelecimento.', 'Fechar', {
        duration: 3200,
      });
      return;
    }

    this.pendingEstablishmentId = row.id;

    this.establishmentsService.getById(row.id).subscribe({
      next: (establishment) => {
        this.pendingEstablishmentId = undefined;

        const dialogRef = this.dialog.open(EstablishmentDialogComponent, {
          width: '900px',
          maxWidth: '96vw',
          autoFocus: false,
          data: {
            mode: 'edit',
            establishment,
            clients: this.clientOptions,
            routes: this.routeOptions.filter((route) => route.isActive),
          },
        });

        dialogRef.afterClosed().subscribe((result?: EstablishmentDialogResult) => {
          if (!result) {
            return;
          }

          this.establishmentsService.update(row.id, result).subscribe({
            next: () => {
              this.snackBar.open('Estabelecimento atualizado com sucesso.', 'Fechar', {
                duration: 2800,
              });
              this.loadEstablishments();
            },
            error: () => {
              this.snackBar.open('Não foi possível atualizar o estabelecimento.', 'Fechar', {
                duration: 3200,
              });
            },
          });
        });
      },
      error: () => {
        this.pendingEstablishmentId = undefined;
        this.snackBar.open('Não foi possível carregar o estabelecimento.', 'Fechar', {
          duration: 3200,
        });
      },
    });
  }

  inactivateEstablishment(row: EstablishmentListRow): void {
    if (!row.isActive) {
      return;
    }

    const confirmed = window.confirm(
      `Tem a certeza que pretende inativar o estabelecimento "${row.name}"?`,
    );
    if (!confirmed) {
      return;
    }

    this.pendingEstablishmentId = row.id;
    this.establishmentsService.setAsInactive(row.id).subscribe({
      next: () => {
        this.pendingEstablishmentId = undefined;
        this.snackBar.open('Estabelecimento inativado com sucesso.', 'Fechar', {
          duration: 2800,
        });
        this.loadEstablishments();
      },
      error: () => {
        this.pendingEstablishmentId = undefined;
        this.snackBar.open('Não foi possível inativar o estabelecimento.', 'Fechar', {
          duration: 3200,
        });
      },
    });
  }

  isRouteRowBusy(row: RouteListRow): boolean {
    return !!row.apiId && row.apiId === this.pendingRouteApiId;
  }

  isEstablishmentRowBusy(row: EstablishmentListRow): boolean {
    return row.id === this.pendingEstablishmentId;
  }

  private loadSupportData(): void {
    this.routesService.getAll().subscribe({
      next: (routes) => {
        this.routeOptions = routes;
      },
      error: () => {
        this.routeOptions = [];
      },
    });

    this.clientsService.search({
      searchText: '',
      city: 'ALL',
      sortBy: 'NAME_ASC',
      pageIndex: 0,
      pageSize: 500,
    }).subscribe({
      next: ({ items }) => {
        this.clientOptions = items.filter((client) => client.isActive !== false);
      },
      error: () => {
        this.clientOptions = [];
      },
    });
  }

  private loadRoutes(): void {
    this.routeLoading = true;
    this.routeHasError = false;
    this.routeIsEmpty = false;
    this.routeErrorMessage = '';
    this.routeDataSource.data = [];

    this.routesService.getAll().subscribe({
      next: (routes) => {
        this.routeLoading = false;
        const rows = routes.map((route) => this.toRouteRow(route));
        this.routeIsEmpty = rows.length === 0;
        this.routeDataSource.data = rows;
      },
      error: () => {
        this.routeLoading = false;
        this.routeHasError = true;
        this.routeIsEmpty = false;
        this.routeDataSource.data = [];
        this.routeErrorMessage = 'Não foi possível carregar as rotas. Tente novamente.';
      },
    });
  }

  private loadEstablishments(): void {
    this.establishmentLoading = true;
    this.establishmentHasError = false;
    this.establishmentIsEmpty = false;
    this.establishmentErrorMessage = '';
    this.establishmentDataSource.data = [];

    this.establishmentsService.getAll().subscribe({
      next: (items) => {
        this.establishmentLoading = false;
        const rows = items.map((item) => this.toEstablishmentRow(item));
        this.establishmentIsEmpty = rows.length === 0;
        this.establishmentDataSource.data = rows;
      },
      error: () => {
        this.establishmentLoading = false;
        this.establishmentHasError = true;
        this.establishmentIsEmpty = false;
        this.establishmentDataSource.data = [];
        this.establishmentErrorMessage =
          'Não foi possível carregar os estabelecimentos. Tente novamente.';
      },
    });
  }

  private toRouteRow(route: Route): RouteListRow {
    return {
      id: route.id,
      apiId: route.apiId,
      name: route.name,
      sortOrder: route.sortOrder ?? null,
      statusLabel: route.isActive ? 'Ativa' : 'Inativa',
      statusClass: route.isActive ? 'status-active' : 'status-inactive',
      visualClass: buildRouteVisualClass(route),
      isActive: route.isActive,
    };
  }

  private toEstablishmentRow(establishment: Establishment): EstablishmentListRow {
    return {
      id: establishment.id,
      clientName: establishment.clientName ?? establishment.clientId,
      name: establishment.name,
      city: establishment.deliveryCity || '-',
      routeName: establishment.routeName ?? '-',
      localContactPhone: establishment.localContactPhone ?? '-',
      statusLabel: establishment.isActive ? 'Ativo' : 'Inativo',
      statusClass: establishment.isActive ? 'status-active' : 'status-inactive',
      isActive: establishment.isActive,
    };
  }
}
