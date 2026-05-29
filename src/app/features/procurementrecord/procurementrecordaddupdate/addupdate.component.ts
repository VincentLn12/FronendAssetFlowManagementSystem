import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { SelectComponent } from '../../../../shared';
import { FiscalyearsService } from '../../fiscalyears/service/fiscalyears.service';
import { StaffsService } from '../../staffs/service/staffsType.service';
import { procurementrecordCreateTypes } from '../interface/procurementrecordTypes';
import { ProcurementrecordService } from '../service/procurementrecord.service';
import { OperationsTypeService } from '../../operationTypes/service/operationTypes.service';
import { ExpensetypesService } from '../../expenseTypes/service/expenseTypes.service';
import { DepartmentService } from '../../departments/service/department.service';
import { VendorsService } from '../../vendors/service/vendors.service';
import { FundcategorysService } from '../../fundcategorys/service/fundcategorys.service';
import { BudgetsourceService } from '../../budgetsource/service/budgetSource.service';
import { DatePickerComponent } from '../../../shared/date-picker/date-picker.component';
import { ProjectsService } from '../../projects/service/projects.service';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    DatePickerComponent,
  ],
  templateUrl: './addupdate.component.html',
})
export class ProcurementsAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);

  private procurementrecordService = inject(ProcurementrecordService);
  private fiscalyearsService = inject(FiscalyearsService);
  private operationsTypeService = inject(OperationsTypeService);
  private expensetypesService = inject(ExpensetypesService);
  private departmentService = inject(DepartmentService);
  private vendorsService = inject(VendorsService);
  private fundcategorysService = inject(FundcategorysService);
  private budgetsourceService = inject(BudgetsourceService);
  private staffsService = inject(StaffsService);
  private projectsService = inject(ProjectsService);

  procurement_record_id = signal<number | null>(null);
  isEditMode = computed(() => this.procurement_record_id() !== null);
  name = 'ชื่อโครงการ';
  selectedFile: File | null = null;

  fiscal_years = signal<any[]>([]);
  staffs = signal<any[]>([]);
  operation_types = signal<any[]>([]);
  expense_types = signal<any[]>([]);
  departments = signal<any[]>([]);
  vendors = signal<any[]>([]);
  fund_categorys = signal<any[]>([]);
  budget_sources = signal<any[]>([]);
  projects = signal<any[]>([]);

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));
  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    procurement_record_id: this.procurement_record_id() ?? 0,
    document_no: ['', Validators.required],
    document_date: [new Date().toISOString().split('T')[0]],
    inspection_date: [new Date().toISOString().split('T')[0]],
    total_amount: [0, Validators.required],
    amount_text: [''],
    approval_date: [new Date().toISOString().split('T')[0]],
    reference_no: [''],
    status: ['ร่าง'],
    remark: [''],
    project_id: [null as number | null],
    fiscal_year_id: [null as number | null],
    operation_type_id: [null as number | null],
    expense_type_id: [null as number | null],
    department_id: [null as number | null],
    vendor_id: [null as number | null],
    fund_category_id: [null as number | null],
    budget_source_id: [null as number | null],
    staff_id: [null as number | null],
    attachment_file_path: [''],
  });

  ngOnInit(): void {
    this.loadDropdowns();

    this.form.controls.total_amount.valueChanges.subscribe((amount) => {
      const value = Number(amount || 0);

      this.form.patchValue(
        {
          amount_text: this.toThaiBahtText(value),
        },
        { emitEvent: false },
      );
    });
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.procurement_record_id.set(id);
      this.loadProcurements(id);
    }
  }

  private loadProcurements(id: number) {
    const stateloadProcurementrecord = history.state?.procurementrecord as
      | procurementrecordCreateTypes
      | undefined;

    if (stateloadProcurementrecord?.procurement_record_id === id) {
      this.patchForm(stateloadProcurementrecord);
      return;
    }

    this.isLoading.set(true);

    this.procurementrecordService
      .getProcurementrecord(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/procurements']);
        },
      });
  }

  private loadDropdowns() {
    forkJoin({
      fiscal_year: this.fiscalyearsService.getFiscalyears({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      staff: this.staffsService.getStaffs({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      operation_type: this.operationsTypeService.getOperationtypes({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      expense_type: this.expensetypesService.getExpenseTypes({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      department: this.departmentService.getDepartments({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      vendor: this.vendorsService.getVendors({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      fund_category: this.fundcategorysService.getFundcategorys({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      budget_source: this.budgetsourceService.getBudgetsources({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      project: this.projectsService.getProjects({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
    }).subscribe({
      next: (res) => {
        this.fiscal_years.set(res.fiscal_year.data);
        this.staffs.set(res.staff.data);
        this.operation_types.set(res.operation_type.data);
        this.expense_types.set(res.expense_type.data);
        this.departments.set(res.department.data);
        this.vendors.set(res.vendor.data);
        this.fund_categorys.set(res.fund_category.data);
        this.budget_sources.set(res.budget_source.data);
        this.projects.set(res.project.data);
      },
      error: () => {
        this.snackbar.error('โหลดข้อมูลตัวเลือกไม่สำเร็จ');
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    this.selectedFile = input.files[0];
  }

  private patchForm(exp: procurementrecordCreateTypes) {
    this.form.patchValue({
      procurement_record_id: exp.procurement_record_id,
      document_no: exp.document_no,
      document_date: exp.document_date,
      inspection_date: exp.inspection_date,
      total_amount: exp.total_amount,
      amount_text: exp.amount_text,
      approval_date: exp.approval_date,
      reference_no: exp.reference_no,
      status: exp.status,
      remark: exp.remark,
      project_id: exp.project_id,
      fiscal_year_id: exp.fiscal_year_id,
      operation_type_id: exp.operation_type_id,
      expense_type_id: exp.expense_type_id,
      department_id: exp.department_id,
      vendor_id: exp.vendor_id,
      fund_category_id: exp.fund_category_id,
      budget_source_id: exp.budget_source_id,
      staff_id: exp.staff_id,
      attachment_file_path: exp.attachment_file_path,
    });
  }
  formatDates = (value: any) => {
    if (!value) return null;

    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    return value;
  };

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const saveData = (filePath?: string) => {
      const raw = this.form.getRawValue();
      const totalAmount = Number(raw.total_amount || 0);

      const payload = {
        ...raw,

        procurement_record_id: this.procurement_record_id() ?? 0,

        document_date: this.formatDates(raw.document_date),

        approval_date: raw.status === 'ดำเนินการแล้ว' ? raw.approval_date || null : null,

        total_amount: totalAmount,
        amount_text: this.toThaiBahtText(totalAmount),

        attachment_file_path: filePath ?? raw.attachment_file_path,
      } as any;

      console.log('Payload:', payload);

      const request$ = this.isEditMode()
        ? this.procurementrecordService.updateProcurementrecord(
            this.procurement_record_id()!,
            payload,
          )
        : this.procurementrecordService.createProcurementrecord(payload);

      request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
        next: () => {
          this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
          this.router.navigate(['/admin/procurements']);
        },
        error: (err) => {
          console.error('Save error:', err);
          this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
        },
      });
    };

    if (this.selectedFile) {
      this.procurementrecordService.uploadFile(this.selectedFile).subscribe({
        next: (res) => {
          saveData(res.filePath);
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.isSubmitting.set(false);
          this.snackbar.error('อัปโหลดไฟล์ไม่สำเร็จ');
        },
      });
    } else {
      saveData();
    }
  }

  cancel() {
    this.router.navigate(['/admin/procurements']);
  }

  statusOptions: {
    label: ProcurementRecordStatus;
    value: ProcurementRecordStatus;
  }[] = [
    { label: 'ร่าง', value: 'ร่าง' },
    { label: 'รอดำเนินการ', value: 'รอดำเนินการ' },
    { label: 'ดำเนินการแล้ว', value: 'ดำเนินการแล้ว' },
  ];

  private toThaiBahtText(amount: number): string {
    amount = Number(amount || 0);

    if (amount <= 0) return 'ศูนย์บาทถ้วน';

    if (amount > 100000000) {
      return 'จำนวนเงินต้องไม่เกินหนึ่งร้อยล้านบาท';
    }

    const numberText = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    const positionText = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

    const convertLessThanMillion = (num: string): string => {
      let result = '';
      const len = num.length;

      for (let i = 0; i < len; i++) {
        const digit = Number(num[i]);
        const pos = len - i - 1;

        if (digit === 0) continue;

        if (pos === 0) {
          if (digit === 1 && len > 1) {
            result += 'เอ็ด';
          } else {
            result += numberText[digit];
          }
        } else if (pos === 1) {
          if (digit === 1) {
            result += 'สิบ';
          } else if (digit === 2) {
            result += 'ยี่สิบ';
          } else {
            result += numberText[digit] + 'สิบ';
          }
        } else {
          result += numberText[digit] + positionText[pos];
        }
      }

      return result;
    };

    const convert = (num: string): string => {
      num = String(Number(num));

      if (num === '0') return '';

      if (num.length > 6) {
        const millionPart = num.slice(0, -6);
        const restPart = num.slice(-6);

        return convertLessThanMillion(millionPart) + 'ล้าน' + convertLessThanMillion(restPart);
      }

      return convertLessThanMillion(num);
    };

    const fixed = amount.toFixed(2);
    const [baht, satang] = fixed.split('.');

    const bahtText = convert(baht);

    if (satang === '00') {
      return `${bahtText}บาทถ้วน`;
    }

    return `${bahtText}บาท${convertLessThanMillion(satang)}สตางค์`;
  }
}

export type ProcurementRecordStatus = 'ร่าง' | 'รอดำเนินการ' | 'ดำเนินการแล้ว';
