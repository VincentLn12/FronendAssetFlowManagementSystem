import { Component, OnInit, inject, signal, Pipe } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { AlertService } from '../../../shared.service';
import { TableState } from '../../../shared/TableState';
import { AssetRepairsService } from './service/assetRepairs.service';
import { assetRepairsTypes } from './interface/assetRepairsTypes';
import { ThaiDatePipe } from '../../shared/pipes/thai-date-pipe';
import { Location } from '@angular/common';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [ThaiDatePipe],
  templateUrl: './assetRepairs.component.html',
})
export class AssetRepairsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetRepairsService = inject(AssetRepairsService);
  private alertService = inject(AlertService);
  private table = new TableState();
  private location = inject(Location);
  procurement_withdrawal_id = signal<number | null>(null);
  assetRepair?: Pagination<assetRepairsTypes>;
  assetRepairs = signal<assetRepairsTypes[]>([]);
  Params = new Params();
  totalCount = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.procurement_withdrawal_id.set(id);
      this.LoadgetAssetRepairs(id);
    }
  }

  LoadgetAssetRepairs(id: number) {
    this.assetRepairsService.getAssetRepairsby(this.table.params, id).subscribe({
      next: (response) => {
        this.assetRepairs.set(response.data);
        this.totalCount.set(response.count);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    const id = this.procurement_withdrawal_id();

    if (!id) return;

    this.table.onSearch(value, () => this.LoadgetAssetRepairs(id));
  }

  onPageChange(page: number) {
    const id = this.procurement_withdrawal_id();

    if (!id) return;

    this.table.onPageChange(page, () => this.LoadgetAssetRepairs(id));
  }

  onSort(value: string) {
    const id = this.procurement_withdrawal_id();

    if (!id) return;

    this.table.onSort(value, () => this.LoadgetAssetRepairs(id));
  }

  deleteAssetRepairs(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบเรียบร้อยแล้ว');
      }
    });
  }

  confirmDelete(id: number) {
    const procurementId = this.procurement_withdrawal_id();

    if (!procurementId) return;

    this.assetRepairsService.deleteAssetRepairs(id).subscribe({
      next: () => {
        this.alertService.successNo('ลบรายการเรียบร้อยแล้ว');
        this.LoadgetAssetRepairs(procurementId);
      },
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    const asset_ids = this.procurement_withdrawal_id();

    if (!asset_ids) return;

    this.router.navigate(['/admin/assetRepairs/create'], {
      queryParams: {
        asset_id: asset_ids,
      },
    });
  }

  goToEdit(mat: assetRepairsTypes) {
    this.router.navigate(['/admin/assetRepairs/update', mat.asset_repair_id], {
      state: {
        assetRepair: mat,
      },
    });
  }

  goToDetail(assetRepairs: assetRepairsTypes) {
    this.router.navigate(['/admin/assetRepairs/detail', assetRepairs.asset_repair_id], {
      state: { assetRepairs },
    });
  }



  

  cancel() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/admin/AssetWithdrawal', this.procurement_withdrawal_id()]);
    }
  }
}
