import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThaiDatePipe } from '../../app/shared/pipes/thai-date-pipe';

export type TableActionType = 'detail' | 'pathTo' | 'repair' | 'withdraw' | 'history';

export interface TableAction {
  type: TableActionType;
  item: any;
}

export interface TableColumn {
  label: string;
  key: string;
  type?: 'text' | 'price' | 'badge' | 'file';
  pipe?: 'thaiDate';

  // สำหรับคลิกหัวตารางแล้ว sort
  sortAsc?: string;
  sortDesc?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, ThaiDatePipe],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent {
  @Input() title = '';
  @Input() subtitle = '';

  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];

  @Input() isAdmin = false;
  @Input() enableSearch = true;

  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;

  @Input() idKey = 'id';

  @Input() sortOptions: { label: string; value: string }[] = [];

  @Input() fileBaseUrl = '';
  @Input() Namepath = 'ไป';

  @Input() filterOptions: {
    key: string;
    label: string;
    options: { label: string; value: any }[];
  }[] = [];

  @Input() headerColor = 'bg-blue-900';
  @Input() headerBorderColor = 'border-blue-900';
  @Input() butttonColor = 'bg-blue-900 hover:bg-blue-800 ';

  @Input() showBack = false;
  @Input() showDetail = false;
  @Input() showPathTo = false;
  @Input() showRepair = false;
  @Input() showWithdraw = false;
  @Input() showHistory = false;

  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  @Output() search = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<{ key: string; value: any }>();

  @Output() back = new EventEmitter<void>();
  @Output() action = new EventEmitter<TableAction>();

  activeSortKey = '';
  sortDirection: 'asc' | 'desc' = 'desc';

  get totalPages() {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.emit(value);
  }

  onSort(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.sortChange.emit(value);
  }

  onHeaderSort(col: TableColumn) {
    if (!col.sortAsc && !col.sortDesc) return;

    if (this.activeSortKey === col.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.activeSortKey = col.key;
      this.sortDirection = 'desc';
    }

    const sortValue = this.sortDirection === 'asc' ? col.sortAsc : col.sortDesc;

    if (sortValue) {
      this.sortChange.emit(sortValue);
    }
  }

  onFilter(key: string, event: Event) {
    const value = (event.target as HTMLSelectElement).value;

    this.filterChange.emit({
      key,
      value: value || null,
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageChange.emit(page);
  }

  emitAction(type: TableActionType, item: any) {
    this.action.emit({ type, item });
  }

  getValue(item: any, key: string) {
    return key.split('.').reduce((obj, prop) => obj?.[prop], item) ?? '-';
  }

  openFileFromBackend(path: string | null | undefined) {
    if (!path || path === '-') return;

    const url = path.startsWith('http') ? path : `${this.fileBaseUrl}${path}`;

    window.open(url, '_blank');
  }

  isEmptyValue(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      value === '-' ||
      (Array.isArray(value) && value.length === 0)
    );
  }

  getColumnValue(item: any, col: TableColumn): any {
    const rawValue = this.getValue(item, col.key);
    return (col as any).transform ? (col as any).transform(rawValue, item) : rawValue;
  }

  hasColumnData(col: TableColumn): boolean {
    return this.data.some((item: any) => {
      const value = this.getColumnValue(item, col);
      return !this.isEmptyValue(value);
    });
  }

  visibleColumns() {
    return this.columns.filter((col: TableColumn) => this.hasColumnData(col));
  }

  displayValue(item: any, col: TableColumn): any {
    const value = this.getColumnValue(item, col);

    if (this.isEmptyValue(value)) {
      return '-';
    }

    return value;
  }
}
