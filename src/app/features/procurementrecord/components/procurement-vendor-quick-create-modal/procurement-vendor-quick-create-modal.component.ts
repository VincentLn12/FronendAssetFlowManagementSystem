import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-procurement-vendor-quick-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './procurement-vendor-quick-create-modal.component.html',
})
export class ProcurementVendorQuickCreateModalComponent {
  private fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Input() initialVendorName = '';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();

  form = this.fb.nonNullable.group({
    vendor_name: ['', Validators.required],
  });

  ngOnChanges() {
    this.form.patchValue({
      vendor_name: this.initialVendorName ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.controls.vendor_name.value.trim());
  }
}
