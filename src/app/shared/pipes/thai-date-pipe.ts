import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thaiDate',
  standalone: true,
})
export class ThaiDatePipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    includeTime = false,
  ): string {
    if (!value) return '-';

    const normalizedValue =
      typeof value === 'string' && includeTime && !/[zZ]|[+\-]\d{2}:\d{2}$/.test(value)
        ? `${value}Z`
        : value;

    const date = new Date(normalizedValue);
    if (Number.isNaN(date.getTime())) return '-';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Bangkok',
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return date.toLocaleString('th-TH', options);
  }
}
