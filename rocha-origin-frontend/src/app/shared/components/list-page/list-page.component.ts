import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnDestroy,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatColumnDef, MatTable, MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { MATERIAL_MODULES } from '../../material/material.module';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_MODULES],
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
})
export class ListPageComponent<T>
  implements AfterContentInit, AfterViewInit, OnChanges, OnDestroy
{
  @Input() title = '';
  @Input() addLabel?: string;

  @Input() dataSource!: MatTableDataSource<T>;
  @Input() displayedColumns: string[] = [];
  renderedColumns: string[] = [];

  @Input() pageSize = 25;
  @Input() showPaginator = true;

  @Output() add = new EventEmitter<void>();

  @ViewChild(MatTable) table?: MatTable<T>;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ContentChildren(MatColumnDef, { descendants: true })
  projectedColumnDefs?: QueryList<MatColumnDef>;

  private registeredColumnDefs: MatColumnDef[] = [];
  private projectedColumnDefsSub?: Subscription;

  ngAfterContentInit(): void {
    this.syncColumnDefs();
    this.projectedColumnDefsSub = this.projectedColumnDefs?.changes.subscribe(() => {
      this.syncColumnDefs();
    });
  }

  ngAfterViewInit(): void {
    this.bindPaginator();
    this.syncColumnDefs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource']) {
      this.bindPaginator();
    }
    if (changes['displayedColumns']) {
      this.syncColumnDefs();
    }
  }

  ngOnDestroy(): void {
    this.projectedColumnDefsSub?.unsubscribe();
    this.clearColumnDefs();
  }

  private bindPaginator(): void {
    if (!this.dataSource || !this.paginator || !this.showPaginator) {
      return;
    }

    this.dataSource.paginator = this.paginator;
  }

  private syncColumnDefs(): void {
    if (!this.table) {
      return;
    }

    this.renderedColumns = [];
    this.clearColumnDefs();

    this.registeredColumnDefs = this.projectedColumnDefs?.toArray() ?? [];
    this.registeredColumnDefs.forEach((columnDef) =>
      this.table?.addColumnDef(columnDef),
    );

    const availableColumns = new Set(this.registeredColumnDefs.map((column) => column.name));
    this.renderedColumns = this.displayedColumns.filter((column) =>
      availableColumns.has(column),
    );
    this.table.renderRows();
  }

  private clearColumnDefs(): void {
    if (!this.table) {
      return;
    }

    this.registeredColumnDefs.forEach((columnDef) =>
      this.table?.removeColumnDef(columnDef),
    );
    this.registeredColumnDefs = [];
  }
}
