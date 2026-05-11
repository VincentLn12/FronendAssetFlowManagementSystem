import { Injectable, Pipe, PipeTransform } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})

//บริการแจ้งเตือนต่างๆ
export class AlertService {
  confirm(title: string, text: string) {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ไม่, ยกเลิก!',
    });
  }

  success(title: string, text: string) {
    return Swal.fire({
      title,
      text,
      icon: 'success',
    });
  }

  error(title: string, text: string) {
    return Swal.fire({
      title,
      text,
      icon: 'error',
    });
  }

  successNo(title: string) {
    return Swal.fire({
      icon: 'success',
      title,
      showConfirmButton: false,
      timer: 1500,
    });
  }
}

@Pipe({
  name: 'thaiDate',
  standalone: true,
})
export class ThaiDatePipe implements PipeTransform {
  transform(value: string | Date | number | null | undefined): string {
    if (!value) return '-';

    const d = new Date(value);
    if (isNaN(d.getTime())) return value.toString();

    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }
}
