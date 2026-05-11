import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputErrorComponent } from '../input-error/input-error.component';

@Component({
  selector: 'app-select',
  imports: [ReactiveFormsModule, InputErrorComponent],
  templateUrl: './select.component.html',
})
export class SelectComponent {
  @Input() label!: string;
  @Input() control!: FormControl;
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'name';
  @Input() optionValue: string = 'id';
  @Input() placeholder: string = '-- เลือก --';
  @Input() required: boolean = false;
}
