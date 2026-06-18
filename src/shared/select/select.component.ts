import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { InputErrorComponent } from '../input-error/input-error.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgSelectModule, InputErrorComponent, CommonModule],
  templateUrl: './select.component.html',
})
export class SelectComponent {
  @ViewChild(NgSelectComponent) ngSelect?: NgSelectComponent;

  @Input() label!: string;
  @Input() control!: FormControl;
  @Input() options: any[] = [];
  @Input() optionLabel = 'name';
  @Input() optionValue = 'id';
  @Input() placeholder = '-- เลือก --';
  @Input() required = false;
  @Input() searchable = true;
  @Input() clearable = true;
  @Input() readonly = false;
  @Input() notFoundText = 'ไม่พบข้อมูล';
  @Input() notFoundActionLabel = '';
  @Input() showNotFoundAction = false;

  @Output() notFoundAction = new EventEmitter<string>();

  searchText = '';
  filteredOptions: any[] = [];

  ngOnInit() {
    this.filteredOptions = this.options ?? [];
  }

  ngOnChanges() {
    this.filteredOptions = this.options ?? [];
  }

  onOpenSelect() {
    this.searchText = '';
    this.filteredOptions = this.options ?? [];
  }

  filterOptions() {
    const text = this.searchText.toLowerCase().trim();

    if (!text) {
      this.filteredOptions = this.options ?? [];
      return;
    }

    this.filteredOptions = (this.options ?? []).filter((item: any) => {
      const label = String(item[this.optionLabel] ?? '').toLowerCase();
      return label.includes(text);
    });
  }

  triggerNotFoundAction() {
    const text = this.searchText.trim();

    if (!text) return;

    this.ngSelect?.close();
    this.notFoundAction.emit(text);
  }
}
