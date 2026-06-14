import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, finalize, forkJoin } from 'rxjs';

import { InputComponent } from '../../../../shared/input/input.component';
import { SelectComponent } from '../../../../shared';
import { DatePickerComponent } from '../../../shared/date-picker/date-picker.component';

import { SnackbarService } from '../../../core/services/snackbar.service';
import { toThaiBahtText } from '../../../shared/thai-baht-text';

import {
  procurementrecordCreateTypes,
  procurementWithAssetsCreateTypes,
} from '../interface/procurementrecordTypes';

import { ProcurementrecordService } from '../service/procurementrecord.service';

import { FiscalyearsService } from '../../fiscalyears/service/fiscalyears.service';
import { StaffsService } from '../../staffs/service/staffsType.service';
import { OperationsTypeService } from '../../operationTypes/service/operationTypes.service';
import { ExpensetypesService } from '../../expenseTypes/service/expenseTypes.service';
import { DepartmentService } from '../../departments/service/department.service';
import { VendorsService } from '../../vendors/service/vendors.service';
import { FundcategorysService } from '../../fundcategorys/service/fundcategorys.service';
import { BudgetsourceService } from '../../budgetsource/service/budgetSource.service';
import { ProjectsService } from '../../projects/service/projects.service';

import { AssetCategoriesService } from '../../assetCategories/service/assetCategories.service';
import { MaterialUnitsService } from '../../materialUnits/service/materialUnits.service';
import { AcquisitionMethodService } from '../../acquisitionMethod/service/acquisitionMethod.service';
import { MaterialItemsService } from '../../MaterialItems/service/materialItems.service';

import {
  AssetSectionPayload,
  ProcurementAssetSectionComponent,
} from '../components/procurement-asset-section/procurement-asset-section/procurement-asset-section.component';

import {
  HireSectionPayload,
  ProcurementHireSectionComponent,
} from '../components/procurement-asset-section/procurement-hire-section/procurement-hire-section.component';

import {
  MaterialSectionPayload,
  ProcurementMaterialSectionComponent,
} from '../components/procurement-asset-section/procurement-material-section/procurement-material-section.component';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    DatePickerComponent,
    ProcurementAssetSectionComponent,
    ProcurementHireSectionComponent,
    ProcurementMaterialSectionComponent,
  ],
  templateUrl: './addupdate.component.html',
})
export class ProcurementsAddUpdateComponent implements OnInit {
  // =========================
  // Inject Services
  // =========================
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);

  private procurementrecordService = inject(ProcurementrecordService);

  private fiscalyearsService = inject(FiscalyearsService);
  private staffsService = inject(StaffsService);
  private operationsTypeService = inject(OperationsTypeService);
  private expensetypesService = inject(ExpensetypesService);
  private departmentService = inject(DepartmentService);
  private vendorsService = inject(VendorsService);
  private fundcategorysService = inject(FundcategorysService);
  private budgetsourceService = inject(BudgetsourceService);
  private projectsService = inject(ProjectsService);

  private assetCategoriesService = inject(AssetCategoriesService);
  private materialUnitsService = inject(MaterialUnitsService);
  private acquisitionMethodsService = inject(AcquisitionMethodService);
  private materialItemsService = inject(MaterialItemsService);

  // =========================
  // State
  // =========================
  procurement_record_id = signal<number | null>(null);
  projectstate = history.state?.projects?.projects ?? history.state?.projects ?? null;

  isLoading = signal(false);
  isSubmitting = signal(false);

  selectedFile: File | null = null;

  name = 'เอกสารการจัดซื้อจัดจ้าง';

  // =========================
  // Dropdown Signals
  // =========================
  fiscal_years = signal<any[]>([]);
  staffs = signal<any[]>([]);
  operation_types = signal<any[]>([]);
  expense_types = signal<any[]>([]);
  departments = signal<any[]>([]);
  vendors = signal<any[]>([]);
  fund_categorys = signal<any[]>([]);
  budget_sources = signal<any[]>([]);
  projects = signal<any[]>([]);

  asset_category = signal<any[]>([]);
  unit = signal<any[]>([]);
  aquisition_methods = signal<any[]>([]);
  material_items = signal<any[]>([]);

  // =========================
  // Child Section Payloads
  // =========================
  assetPayload = signal<AssetSectionPayload | null>(null);
  isAssetSectionValid = signal(false);

  hirePayload = signal<HireSectionPayload | null>(null);
  isHireSectionValid = signal(false);

  materialPayload = signal<MaterialSectionPayload | null>(null);
  isMaterialSectionValid = signal(false);

  // =========================
  // Expense Type State
  // =========================
  selectedExpenseTypeId = signal<number | null>(null);

  // =========================
  // Form
  // =========================
  form = this.fb.group({
    procurement_record_id: [0],
    document_no: ['', Validators.required],
    document_date: [new Date().toISOString().split('T')[0]],
    inspection_date: [new Date().toISOString().split('T')[0]],
    total_amount: [0, Validators.required],
    amount_text: [''],
    approval_date: [new Date().toISOString().split('T')[0] as string | null],
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

  // =========================
  // Computed
  // =========================
  isEditMode = computed(() => this.procurement_record_id() !== null);

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));

  selectedExpenseTypeName = computed(() => {
    const id = this.selectedExpenseTypeId();

    return (
      this.expense_types().find((x) => Number(x.expense_type_id) === Number(id))
        ?.expense_type_name ?? ''
    );
  });

  isAssetType = computed(() => {
    const type = this.selectedExpenseTypeName();

    return type === 'ครุภัณฑ์' || type.includes('ครุ') || type.includes('คุรุ');
  });

  isHireType = computed(() => this.selectedExpenseTypeName() === 'จัดจ้าง');

  isMaterialType = computed(() => {
    const type = this.selectedExpenseTypeName();

    return type === 'วัสดุ' || type === 'พัสดุ';
  });

  // =========================
  // Lifecycle
  // =========================
  ngOnInit(): void {
    this.patchProjectState();
    this.loadDropdowns();
    this.watchTotalAmount();
    this.watchExpenseType();
    this.checkEditMode();
  }

  // =========================
  // Initial Setup
  // =========================
  private patchProjectState() {
    this.form.patchValue({
      project_id: this.projectstate?.project_id ?? null,
      fiscal_year_id: this.projectstate?.fiscal_year_id ?? null,
    });
  }

  private watchTotalAmount() {
    this.form.controls.total_amount.valueChanges.subscribe((amount) => {
      const value = Number(amount || 0);

      this.form.patchValue(
        {
          amount_text: toThaiBahtText(value),
        },
        { emitEvent: false },
      );
    });
  }

  private watchExpenseType() {
    this.selectedExpenseTypeId.set(this.form.controls.expense_type_id.value);

    this.form.controls.expense_type_id.valueChanges.subscribe((id) => {
      this.selectedExpenseTypeId.set(id ? Number(id) : null);
    });
  }

  private checkEditMode() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.procurement_record_id.set(id);
      this.loadProcurement(id);
    }
  }

  // =========================
  // Load Data
  // =========================
  private loadProcurement(id: number) {
    const stateProcurementrecord = history.state?.procurementrecord as
      | procurementrecordCreateTypes
      | undefined;

    if (stateProcurementrecord?.procurement_record_id === id) {
      this.patchForm(stateProcurementrecord);
      return;
    }

    this.isLoading.set(true);

    this.procurementrecordService
      .getProcurementrecord(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => this.patchForm(response),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/procurements']);
        },
      });
  }

  private loadDropdowns() {
    forkJoin({
      fiscal_year: this.fiscalyearsService.getFiscalyears(this.dropdownParams()),
      staff: this.staffsService.getStaffs(this.dropdownParams()),
      operation_type: this.operationsTypeService.getOperationtypes(this.dropdownParams()),
      expense_type: this.expensetypesService.getExpenseTypes(this.dropdownParams()),
      department: this.departmentService.getDepartments(this.dropdownParams()),
      vendor: this.vendorsService.getVendors(this.dropdownParams()),
      fund_category: this.fundcategorysService.getFundcategorys(this.dropdownParams()),
      budget_source: this.budgetsourceService.getBudgetsources(this.dropdownParams()),
      project: this.projectsService.getProjects(this.dropdownParams()),

      assetCategories: this.assetCategoriesService.getAssetCategories(this.dropdownParams()),
      unit: this.materialUnitsService.getMaterialUnits(this.dropdownParams()),
      aquisition_methods: this.acquisitionMethodsService.getAcquisitionMethods(
        this.dropdownParams(),
      ),
      material_items: this.materialItemsService.getMaterialItems(this.dropdownParams()),
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

        this.asset_category.set(res.assetCategories.data);
        this.unit.set(res.unit.data);
        this.aquisition_methods.set(res.aquisition_methods.data);
        this.material_items.set(
          res.material_items.data.map((x: any) => ({
            ...x,
            display_name: `${x.material_code} - ${x.material_name} ราคา ${x.unit_price ?? 0} บาท`,
          })),
        );

        this.patchProjectState();
      },
      error: () => {
        this.snackbar.error('โหลดข้อมูลตัวเลือกไม่สำเร็จ');
      },
    });
  }

  private dropdownParams() {
    return {
      sort: '',
      search: '',
      pageSize: 100,
      pageNumber: 1,
    };
  }

  // =========================
  // Patch Form
  // =========================
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

    this.selectedExpenseTypeId.set(exp.expense_type_id);
  }

  // =========================
  // File
  // =========================
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    this.selectedFile = input.files[0];
  }

  // =========================
  // Payload Builders
  // =========================
  private formatDates(value: any): string | null {
    if (!value) return null;

    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    return value;
  }

  private buildProcurementPayload(filePath?: string): procurementrecordCreateTypes {
    const raw = this.form.getRawValue();
    const totalAmount = Number(raw.total_amount || 0);

    return {
      procurement_record_id: this.procurement_record_id() ?? 0,
      document_no: raw.document_no ?? '',
      document_date: this.formatDates(raw.document_date) ?? '',
      inspection_date: this.formatDates(raw.inspection_date) ?? '',
      total_amount: totalAmount,
      amount_text: toThaiBahtText(totalAmount),
      approval_date: raw.status === 'ดำเนินการแล้ว' ? this.formatDates(raw.approval_date) : null,
      reference_no: raw.reference_no ?? '',
      status: raw.status ?? 'ร่าง',
      remark: raw.remark ?? '',

      project_id: raw.project_id ?? 0,
      fiscal_year_id: raw.fiscal_year_id ?? 0,
      operation_type_id: raw.operation_type_id ?? 0,
      expense_type_id: raw.expense_type_id ?? 0,
      department_id: raw.department_id ?? 0,
      vendor_id: raw.vendor_id ?? 0,
      fund_category_id: raw.fund_category_id ?? 0,
      budget_source_id: raw.budget_source_id ?? 0,
      staff_id: raw.staff_id ?? 0,

      attachment_file_path: filePath ?? raw.attachment_file_path ?? '',
    };
  }

  private buildFullAssetPayload(
    procurementPayload: procurementrecordCreateTypes,
    asset: AssetSectionPayload,
  ): procurementWithAssetsCreateTypes {
    return {
      procurement_record: procurementPayload,
      asset_items: asset.asset_items,
    };
  }

  // =========================
  // Submit
  // =========================
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.validateChildSections()) return;

    this.isSubmitting.set(true);

    if (this.selectedFile) {
      this.uploadFileAndSave();
      return;
    }

    this.saveData();
  }

  private validateChildSections(): boolean {
    if (this.isEditMode()) return true;

    if (this.isAssetType() && (!this.assetPayload() || !this.isAssetSectionValid())) {
      this.snackbar.error('กรุณากรอกข้อมูลครุภัณฑ์ให้ครบถ้วน');
      return false;
    }

    if (this.isHireType() && (!this.hirePayload() || !this.isHireSectionValid())) {
      this.snackbar.error('กรุณากรอกข้อมูลจัดจ้างให้ครบถ้วน');
      return false;
    }

    if (this.isMaterialType() && (!this.materialPayload() || !this.isMaterialSectionValid())) {
      this.snackbar.error('กรุณากรอกข้อมูลพัสดุให้ครบถ้วน');
      return false;
    }

    return true;
  }

  private uploadFileAndSave() {
    this.procurementrecordService.uploadFile(this.selectedFile!).subscribe({
      next: (res) => this.saveData(res.filePath),
      error: (err: any) => {
        console.error('Upload error:', err);
        this.isSubmitting.set(false);
        this.snackbar.error('อัปโหลดไฟล์ไม่สำเร็จ');
      },
    });
  }

  private saveData(filePath?: string) {
    const procurementPayload = this.buildProcurementPayload(filePath);
    const request$ = this.getSaveRequest(procurementPayload);

    if (!request$) {
      this.isSubmitting.set(false);
      return;
    }

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.goBackToProcurementList();
      },
      error: (err: any) => {
        console.error('Save error:', err);
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  private getSaveRequest(procurementPayload: procurementrecordCreateTypes): Observable<any> | null {
    if (this.isEditMode()) {
      return this.procurementrecordService.updateProcurementrecord(
        this.procurement_record_id()!,
        procurementPayload,
      );
    }

    if (this.isAssetType()) {
      const asset = this.assetPayload();

      if (!asset) {
        this.snackbar.error('ไม่พบข้อมูลครุภัณฑ์');
        return null;
      }

      return this.procurementrecordService.createProcurementWithAssets(
        this.buildFullAssetPayload(procurementPayload, asset),
      );
    }

    if (this.isHireType()) {
      const hire = this.hirePayload();

      if (!hire) {
        this.snackbar.error('ไม่พบข้อมูลจัดจ้าง');
        return null;
      }

      return this.procurementrecordService.createProcurementWithHire({
        procurement_record: procurementPayload,
        hire_details: hire.hire_details,
      });
    }

    if (this.isMaterialType()) {
      const material = this.materialPayload();

      if (!material) {
        this.snackbar.error('ไม่พบข้อมูลพัสดุ');
        return null;
      }

      return this.procurementrecordService.createProcurementWithMaterials({
        procurement_record: procurementPayload,
        material_receive_details: material.material_receive_details,
      });
    }

    return this.procurementrecordService.createProcurementrecord(procurementPayload);
  }

  // =========================
  // Navigation
  // =========================
  cancel() {
    this.goBackToProcurementList();
  }

  private goBackToProcurementList() {
    this.router.navigate(['/admin/project/procurementrecord'], {
      queryParams: {
        project_id: this.projectstate?.project_id,
        fiscal_year_id: this.projectstate?.fiscal_year_id,
      },
      state: {
        projects: this.projectstate,
      },
    });
  }

  // =========================
  // Options
  // =========================
  statusOptions: {
    label: ProcurementRecordStatus;
    value: ProcurementRecordStatus;
  }[] = [
    { label: 'ร่าง', value: 'ร่าง' },
    { label: 'รออนุมัติ', value: 'รออนุมัติ' },
    { label: 'อนุมัติแล้ว', value: 'อนุมัติแล้ว' },
    { label: 'รอเบิกจ่าย', value: 'รอเบิกจ่าย' },
    { label: 'เบิกจ่ายแล้ว', value: 'เบิกจ่ายแล้ว' },
    { label: 'ขึ้นทะเบียนแล้ว', value: 'ขึ้นทะเบียนแล้ว' },
    { label: 'เสร็จสิ้น', value: 'เสร็จสิ้น' },
    { label: 'ยกเลิก', value: 'ยกเลิก' },
  ];
}

export type ProcurementRecordStatus =
  | 'ร่าง'
  | 'รออนุมัติ'
  | 'อนุมัติแล้ว'
  | 'เบิกจ่ายแล้ว'
  | 'ขึ้นทะเบียนแล้ว'
  | 'รอเบิกจ่าย'
  | 'เสร็จสิ้น'
  | 'ยกเลิก';
