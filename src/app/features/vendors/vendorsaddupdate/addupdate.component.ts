import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { VendorsService } from '../service/vendors.service';
import { vendorsTypes } from '../interface/vendorsTypes';
import { TextareaComponent } from "../../../../shared";

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, TextareaComponent],
  templateUrl: './addupdate.component.html',
})
export class VendorsAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vendorsService = inject(VendorsService);
  private snackbar = inject(SnackbarService);

  vendor_id = signal<number | null>(null);
  isEditMode = computed(() => this.vendor_id() !== null);
  name = 'ร้านค้า';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));
  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    vendor_name: ['', [Validators.required]],
    tax_no: [''],
    address: [''],
    phone: [''],
    email: [''],
    contact_name: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.vendor_id.set(id);
      this.loadOperationTypes(id);
    }
  }

  private loadOperationTypes(id: number) {
    const stateloadvendors = history.state?.vendors as vendorsTypes | undefined;

    if (stateloadvendors?.vendor_id === id) {
      this.patchForm(stateloadvendors);
      return;
    }

    this.isLoading.set(true);

    this.vendorsService
      .getVendor(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/vendors']);
        },
      });
  }

  private patchForm(ven: vendorsTypes) {
    this.form.patchValue({
      vendor_name: ven.vendor_name ?? '',
      tax_no: ven.tax_no ?? '',
      address: ven.address ?? '',
      phone: ven.phone ?? '',
      email: ven.email ?? '',
      contact_name: ven.contact_name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<vendorsTypes> = {
      vendor_id: this.vendor_id() ?? 0,
      vendor_name: this.form.value.vendor_name,
      tax_no: this.form.value.tax_no,
      address: this.form.value.address,
      phone: this.form.value.phone,
      email: this.form.value.email,
      contact_name: this.form.value.contact_name,
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.vendorsService.updateVendors(this.vendor_id()!, payload)
      : this.vendorsService.createVendors(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/vendors']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/vendors']);
  }
}
