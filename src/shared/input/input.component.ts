import { Component, Input, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputErrorComponent } from '../input-error/input-error.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  imports: [InputErrorComponent, ReactiveFormsModule,CommonModule],
  templateUrl: './input.component.html',
})
export class InputComponent {
  @Input() label!: string;
  @Input() control!: FormControl;
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() required: boolean = false;

  get isInvalid() {
    return this.control?.invalid && this.control?.touched;
  }
}
