import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Params } from '../../shared/models/allType';
import { AlertService } from '../../../shared.service';
import { hireDetailCreateType, hireDetailType } from './interface/hireDetailType';
import { HireDetailsService } from './service/hireDetail.service';
import { toThaiBahtText } from '../../shared/thai-baht-text';
import { MaterialUnitsService } from '../materialUnits/service/materialUnits.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hireDetails.component.html',
})
export class HireDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  private hireDetailsService = inject(HireDetailsService);
  private MaterialUnitsService = inject(MaterialUnitsService);
  private alertService = inject(AlertService);
  private snackbar = inject(AlertService);

  hiredetails = signal<hireDetailType[]>([]);
  Params = new Params();

  procurement_record_id = signal<number | null>(null);
  unit = signal<any[]>([]);

  isFormOpen = signal(false);
  isEditMode = signal(false);

  headercolor = 'bg-green-100 text-green-800';

  form = signal<hireDetailCreateType>({
    hire_detail_id: 0,
    procurement_record_id: 0,
    item_no: 1,
    hire_name: '',
    quantity: 0,
    unit_price: 0,
    total_amount: 0,
    total_text: '',
    operation_reason: '',
    remark: '',
    unit_id: null,
  });

  ngOnInit(): void {
    this.loadDropdowns();
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    const procurementrecord = history.state?.procurementrecord;

    // ถ้าไม่มี state แปลว่าพิมพ์ URL เอง
    if (!procurementrecord) {
      this.router.navigate(['/admin/procurements']);
      return;
    }

    // hireDetails เข้าได้เฉพาะ จัดจ้าง
    if (procurementrecord.expense_type_name !== 'จัดจ้าง') {
      this.router.navigate(['/admin/procurements']);
      return;
    }
    if (id && Number.isFinite(id)) {
      this.procurement_record_id.set(id);
      this.LoadgetHiredetail(id);
    }
  }

  LoadgetHiredetail(id: number) {
    this.hireDetailsService.getHireDetailsbyProcuremen(id).subscribe({
      next: (response) => {
        this.hiredetails.set(response);
      },
      error: (error) => console.error(error),
    });
  }

  private loadDropdowns() {
    forkJoin({
      unit: this.MaterialUnitsService.getMaterialUnits({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
    }).subscribe({
      next: (res) => {
        this.unit.set(res.unit.data);
      },
      error: () => {
        this.snackbar.error('โหลดข้อมูลตัวเลือกไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
      },
    });
  }

  openAddForm() {
    const procurementId = this.procurement_record_id();
    if (!procurementId) return;

    this.isFormOpen.set(true);
    this.isEditMode.set(false);

    this.form.set({
      hire_detail_id: 0,
      procurement_record_id: procurementId,
      item_no: this.hiredetails().length + 1,
      hire_name: '',
      quantity: 0,
      unit_price: 0,
      total_amount: 0,
      total_text: '',
      operation_reason: '',
      remark: '',
      unit_id: null,
    });
  }

  openEditForm(item: hireDetailType) {
    this.isFormOpen.set(true);
    this.isEditMode.set(true);

    this.form.set({ ...item });
  }

  closeForm() {
    this.isFormOpen.set(false);
    this.isEditMode.set(false);
  }

  calculateTotal() {
    const data = this.form();

    const total = Number(data.quantity || 0) * Number(data.unit_price || 0);

    this.form.set({
      ...data,
      total_amount: total,
      total_text: toThaiBahtText(total),
    });
  }

  getTotalAmount(): number {
    return this.hiredetails().reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
  }

  getTotalText(): string {
    return toThaiBahtText(this.getTotalAmount());
  }

  saveHiredetail() {
    const data = this.form();

    if (!data.hire_name) {
      this.alertService.error?.('กรุณากรอกรายการ', 'ชื่อรายการไม่สามารถเว้นว่างได้');
      return;
    }

    if (this.isEditMode()) {
      this.hireDetailsService.updateHireDetails(data.hire_detail_id, data).subscribe({
        next: () => {
          this.alertService.successNo('แก้ไขรายการเรียบร้อยแล้ว');
          this.closeForm();
          this.LoadgetHiredetail(data.procurement_record_id);
        },
        error: (error) => console.error(error),
      });
    } else {
      this.hireDetailsService.createHireDetails(data).subscribe({
        next: () => {
          this.alertService.successNo('เพิ่มรายการเรียบร้อยแล้ว');
          this.closeForm();
          this.LoadgetHiredetail(data.procurement_record_id);
        },
        error: (error) => console.error(error),
      });
    }
  }

  deleteHiredetail(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบรายการนี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
      }
    });
  }

  cancel() {
    const id = history.state?.procurement_record_id;

    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/admin/projects']);
    }
  }

  confirmDelete(id: number) {
    const procurementId = this.procurement_record_id();

    if (!procurementId) return;

    this.hireDetailsService.deleteHireDetails(id).subscribe({
      next: () => {
        this.alertService.successNo('ลบรายการเรียบร้อยแล้ว');
        this.LoadgetHiredetail(procurementId);
      },
      error: (error) => console.error(error),
    });
  }
}
