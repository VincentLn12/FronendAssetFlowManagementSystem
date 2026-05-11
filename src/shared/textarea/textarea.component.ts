import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputErrorComponent } from '../input-error/input-error.component';

@Component({
  selector: 'app-textarea',
  imports: [ReactiveFormsModule, InputErrorComponent],
  templateUrl: './textarea.component.html',
})
export class TextareaComponent {
  @Input() label!: string;
  @Input() control!: FormControl;
  @Input() placeholder: string = '';
  @Input() rows: number = 4;
  @Input() required: boolean = false;
}
