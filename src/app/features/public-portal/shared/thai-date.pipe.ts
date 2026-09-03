import { Pipe, PipeTransform } from '@angular/core';

/** Formats public-facing dates with Thai month names and the Buddhist Era. */
@Pipe({ name: 'thaiDate', standalone: true })
export class ThaiDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '-';

    const date = this.toLocalDate(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist-nu-latn', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private toLocalDate(value: string | Date): Date {
    if (value instanceof Date) return value;

    // API dates without a time are calendar dates, not UTC timestamps.
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

    return new Date(value);
  }
}
