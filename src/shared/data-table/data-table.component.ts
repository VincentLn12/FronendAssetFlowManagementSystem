import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() isAdmin = false;

  @Input() enableSearch = true;

  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;

  @Input() idKey = 'id';
  @Input() sortOptions: { label: string; value: string }[] = [];

  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() search = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<string>();

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
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageChange.emit(page);
  }

  getValue(item: any, key: string) {
    return key.split('.').reduce((obj, prop) => obj?.[prop], item) ?? '-';
  }
}
