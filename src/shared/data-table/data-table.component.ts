import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() isAdmin = false;

  @Input() searchKeys: string[] = [];
  @Input() enableSearch = true;

  @Input() categories: { id: string; name: string }[] = [];
  @Input() categoryKey = 'category';
  @Input() enableCategory = false;

  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  searchTerm = '';
  selectedCategory = '';

  // ✅ filter + category
  get filteredData() {
    const term = this.searchTerm.toLowerCase();
    const keys = this.searchKeys.length ? this.searchKeys : this.columns.map((c) => c.key);

    return this.data.filter(
      (item) =>
        (!term ||
          keys.some((k) =>
            String(item[k] ?? '')
              .toLowerCase()
              .includes(term),
          )) &&
        (!this.selectedCategory || String(item[this.categoryKey]) === this.selectedCategory),
    );
  }

  // ✅ pagination
  currentPage = 1;
  pageSize = 10;

  get paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }

  onSearch(value: string) {
    this.searchTerm = (value ?? '').trim().toLowerCase();
    this.currentPage = 1;
  }
}
