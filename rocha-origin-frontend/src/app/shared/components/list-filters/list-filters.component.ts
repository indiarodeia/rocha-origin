import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MATERIAL_MODULES } from '../../material/material.module';

export interface ListFilterOption {
  value: string | number;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-list-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, ...MATERIAL_MODULES],
  templateUrl: './list-filters.component.html',
  styleUrl: './list-filters.component.scss',
})
export class ListFiltersComponent {
  @Input() searchText = '';
  @Output() searchTextChange = new EventEmitter<string>();

  @Input() searchPlaceholder = 'Pesquisar...';

  @Input() cityLabel = 'Cidade';
  @Input() cityValue: string | string[] = 'ALL';
  @Output() cityValueChange = new EventEmitter<string | string[]>();
  @Input() cityOptions: string[] = [];
  @Input() cityMultiple = false;
  @Input() cityShowAllOption = true;
  @Input() cityAllLabel = 'Todas';

  @Input() paymentLabel = 'Pagamento';
  @Input() paymentValue: string | string[] = 'ALL';
  @Output() paymentValueChange = new EventEmitter<string | string[]>();
  @Input() paymentOptions: ListFilterOption[] = [];
  @Input() paymentMultiple = false;
  @Input() paymentShowAllOption = true;
  @Input() paymentAllLabel = 'Todos';

  @Input() sortLabel = 'Ordenar';
  @Input() sortValue: string | string[] = '';
  @Output() sortValueChange = new EventEmitter<string | string[]>();
  @Input() sortOptions: ListFilterOption[] = [];
  @Input() sortMultiple = false;
  @Input() sortShowAllOption = false;
  @Input() sortAllLabel = 'Todos';

  @Input() clearLabel = 'Limpar';
  @Input() showClear = true;

  @Output() changed = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();

  onSearchChange(value: string): void {
    this.searchTextChange.emit(value);
    this.changed.emit();
  }

  onCityChange(value: string | string[]): void {
    this.cityValueChange.emit(value);
    this.changed.emit();
  }

  onPaymentChange(value: string | string[]): void {
    this.paymentValueChange.emit(value);
    this.changed.emit();
  }

  onSortChange(value: string | string[]): void {
    this.sortValueChange.emit(value);
    this.changed.emit();
  }
}
