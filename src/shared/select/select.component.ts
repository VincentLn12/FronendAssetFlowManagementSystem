import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { InputErrorComponent } from '../input-error/input-error.component';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgSelectModule, InputErrorComponent],
  templateUrl: './select.component.html',
})
export class SelectComponent {
  @Input() label!: string;
  @Input() control!: FormControl;
  @Input() options: any[] = [];
  @Input() optionLabel = 'name';
  @Input() optionValue = 'id';
  @Input() placeholder = '-- เลือก --';
  @Input() required = false;
  @Input() searchable = true;
  @Input() clearable = true;

  searchText = '';

  get filteredOptions() {
    if (!this.searchText) return this.options;

    return this.options.filter((item) =>
      String(item[this.optionLabel] ?? '')
        .toLowerCase()
        .includes(this.searchText.toLowerCase()),
    );
  }
}
