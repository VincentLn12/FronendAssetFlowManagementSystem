import { Component, OnInit, inject, signal, Pipe } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { AlertService } from '../../../shared.service';
import { materialReceiveDetailTypes } from './interface/materialReceiveDetailTypes';
import { TableState } from '../../../shared/TableState';
import { DecimalPipe, Location } from '@angular/common';
import { MaterialReceiveDetailService } from './service/materialReceiveDetail.service';

@Component({
  selector: 'app-material-receive-detail',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './materialReceiveDetail.component.html',
})
export class MaterialReceiveDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private materialReceiveDetailService = inject(MaterialReceiveDetailService);
  private alertService = inject(AlertService);
  private table = new TableState();
  private location = inject(Location);

  procurement_record_id = signal<number | null>(null);
  MaterialReceiveDetail?: Pagination<materialReceiveDetailTypes>;
  MaterialReceiveDetails = signal<materialReceiveDetailTypes[]>([]);
  Params = new Params();
  totalCount = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    console.log('Project State:', history.state?.projectstate);

    if (id && Number.isFinite(id)) {
      this.procurement_record_id.set(id);
      this.LoadgetMaterialReceiveDetail(id);
    }
  }

  LoadgetMaterialReceiveDetail(id: number) {
    this.materialReceiveDetailService
      .getMaterialReceiveDetailbyProcuremens(this.table.params, id)
      .subscribe({
        next: (response) => {
          this.MaterialReceiveDetails.set(response.data);
          this.totalCount.set(response.count);
        },
        error: (error) => console.error(error),
      });
  }

  onSearch(value: string) {
    const id = this.procurement_record_id();

    if (!id) return;

    this.table.onSearch(value, () => this.LoadgetMaterialReceiveDetail(id));
  }

  onPageChange(page: number) {
    const id = this.procurement_record_id();

    if (!id) return;

    this.table.onPageChange(page, () => this.LoadgetMaterialReceiveDetail(id));
  }

  onSort(value: string) {
    const id = this.procurement_record_id();

    if (!id) return;

    this.table.onSort(value, () => this.LoadgetMaterialReceiveDetail(id));
  }

  deleteMaterialReceiveDetail(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบหรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบเรียบร้อยแล้ว');
      }
    });
  }

  confirmDelete(id: number) {
    const procurementId = this.procurement_record_id();

    if (!procurementId) return;

    this.materialReceiveDetailService.deleteMaterialReceiveDetail(id).subscribe({
      next: () => {
        this.alertService.successNo('ลบรายการเรียบร้อยแล้ว');
        this.LoadgetMaterialReceiveDetail(procurementId);
      },
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    const procurementId = this.procurement_record_id();
    const procurementrecord = history.state?.procurementrecord;

    if (!procurementId) return;

    this.router.navigate(['/admin/materialReceiveDetails/create'], {
      queryParams: {
        procurement_record_id: procurementId,
      },
      state: {
        procurementrecord,
      },
    });
  }

  goToEdit(mat: materialReceiveDetailTypes) {
    this.router.navigate(['/admin/materialReceiveDetails/update', mat.receive_detail_id], {
      state: {
        MaterialReceiveDetail: mat,
        procurementrecord: history.state?.procurementrecord,
      },
    });
  }

  getTotalAmount() {
    return this.MaterialReceiveDetails().reduce((sum, item) => {
      return sum + Number(item.total_amount || 0);
    }, 0);
  }

  cancel() {
    this.router.navigate(['/admin/project/procurementrecord'], {
      queryParams: { project_id: history.state?.procurementrecord.project_id },
      state: {
        procurementrecord: history.state?.procurementrecord,
        project_id: history.state?.project_id,
        projectstate: history.state?.projectstate,
      },
    });
  }
}
