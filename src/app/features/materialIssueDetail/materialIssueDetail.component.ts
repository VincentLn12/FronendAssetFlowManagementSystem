import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { AlertService } from '../../../shared.service';
import { TableState } from '../../../shared/TableState';
import { MaterialIssueDetailTypes } from './interface/materialIssueDetailTypes';
import { MaterialIssueDetailService } from './service/materialIssueDetailDetail.service';

@Component({
  selector: 'app-material-issue-detail',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './materialIssueDetail.component.html',
})
export class MaterialIssueDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private materialIssueDetailService = inject(MaterialIssueDetailService);
  private alertService = inject(AlertService);
  private table = new TableState();

  procurement_record_id = signal<number | null>(null);
  materialIssueDetail?: Pagination<MaterialIssueDetailTypes>;
  materialIssueDetails = signal<MaterialIssueDetailTypes[]>([]);
  Params = new Params();
  totalCount = signal<number>(0);
  procurementrecord = history.state?.procurementrecord;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.procurement_record_id.set(id);
      this.loadMaterialIssueDetail(id);
    }
  }

  loadMaterialIssueDetail(id: number) {
    this.materialIssueDetailService
      .getMaterialIssueDetailByProcurements(this.table.params, id)
      .subscribe({
        next: (response) => {
          this.materialIssueDetail = response;
          this.materialIssueDetails.set(response.data);
          this.totalCount.set(response.count);
        },
        error: (error) => console.error(error),
      });
  }

  onSearch(value: string) {
    const id = this.procurement_record_id();
    if (!id) return;

    this.table.onSearch(value, () => this.loadMaterialIssueDetail(id));
  }

  onPageChange(page: number) {
    const id = this.procurement_record_id();
    if (!id) return;

    this.table.onPageChange(page, () => this.loadMaterialIssueDetail(id));
  }

  onSort(value: string) {
    const id = this.procurement_record_id();
    if (!id) return;

    this.table.onSort(value, () => this.loadMaterialIssueDetail(id));
  }

  deleteMaterialIssueDetail(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบหรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
      }
    });
  }

  confirmDelete(id: number) {
    const procurementId = this.procurement_record_id();
    if (!procurementId) return;

    this.materialIssueDetailService.deleteMaterialIssueDetail(id).subscribe({
      next: () => {
        this.alertService.successNo('ลบรายการเรียบร้อยแล้ว');
        this.loadMaterialIssueDetail(procurementId);
      },
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    const procurementId = this.procurement_record_id();
    if (!procurementId) return;

    this.router.navigate(['/admin/MaterialIssueDetail/create'], {
      queryParams: {
        procurement_record_id: procurementId,
      },
      state: {
        procurementrecord: history.state?.procurementrecord,
      },
    });
  }

  goToEdit(item: MaterialIssueDetailTypes) {
    this.router.navigate(['/admin/MaterialIssueDetail/update', item.issue_detail_id], {
      state: {
        materialIssueDetail: item,
        procurementrecord: history.state?.procurementrecord,
      },
    });
  }

  getTotalAmount() {
    return this.materialIssueDetails().reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
  }

  cancel() {
    this.router.navigate(['/admin/project/procurementrecord'], {
      queryParams: { project_id: history.state?.procurementrecord?.project_id },
      state: {
        procurementrecord: history.state?.procurementrecord,
        project_id: history.state?.project_id,
        projectstate: history.state?.projectstate,
      },
    });
  }
}
