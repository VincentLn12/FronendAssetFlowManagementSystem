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
      showConfirmButton: false,
      timer: 1500,
      icon: 'error',
    });
  }

  select(
    title: string,
    text: string,
    inputOptions: Record<string, string>,
    inputValue?: string,
  ) {
    return Swal.fire({
      title,
      text,
      input: 'select',
      inputOptions,
      inputValue,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      inputPlaceholder: 'เลือกสถานะ',
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
