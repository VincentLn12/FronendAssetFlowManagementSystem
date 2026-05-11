import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-input-error',
  templateUrl: './input-error.component.html',
})
export class InputErrorComponent {
  @Input() control!: AbstractControl | null;
  @Input() label: string = 'This field';
  @Input() type: 'input' | 'select' | 'textarea' = 'input';
}