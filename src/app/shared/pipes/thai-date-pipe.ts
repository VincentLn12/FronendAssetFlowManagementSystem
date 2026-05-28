import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thaiDate',
  standalone: true,
})
export class ThaiDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
