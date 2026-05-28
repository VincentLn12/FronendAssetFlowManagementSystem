import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import { Thai } from 'flatpickr/dist/l10n/th';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FlatpickrModule],
  templateUrl: './date-picker.component.html',
})
export class DatePickerComponent {
  @Input() label = '';
  @Input() control!: FormControl;
  @Input() placeholder = 'เลือกวันที่';

  thaiLocale = Thai;
  formatThaiYear(event: any) {
    const instance = event.instance ?? event;

    if (!instance) return;

    // เปลี่ยนปีใน input
    if (instance.selectedDates?.length && instance.altInput) {
      const date = instance.selectedDates[0];

      const day = date.getDate();

      const month = date.toLocaleString('th-TH', {
        month: 'long',
      });

      const year = date.getFullYear() + 543;

      instance.altInput.value = `${day} ${month} ${year}`;
    }

    // เปลี่ยนปีบน header calendar
    setTimeout(() => {
      const yearInput = instance.currentYearElement;

      if (yearInput) {
        yearInput.value = String(instance.currentYear + 543);
      }
    });
  }
}
