import { Component, OnInit, inject, signal, Pipe } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableComponent, TableAction } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { AlertService } from '../../../shared.service';
import { assetSubItemTypes } from './interface/assetsubItemsTypes';
import { AssetSubItemsService } from './service/assetsubItem.service';
import { TableState } from '../../../shared/TableState';
import { AssetItemsService } from '../assetItems/service/assetItems.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent, CommonModule, FormsModule],
  templateUrl: './assetsubItem.component.html',
})
export class AssetSubItemsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetSubItemsService = inject(AssetSubItemsService);
  private assetItemsService = inject(AssetItemsService);
  private alertService = inject(AlertService);
  private table = new TableState();

  headerColor = 'bg-amber-700';
  headerBorderColor = 'border-amber-700';
  butttonColor = 'bg-amber-700 hover:bg-amber-800 ';

  asset_id = signal<number | null>(null);
  parentAssetRecordId = signal<number | null>(null);

  assetsubItem?: Pagination<assetSubItemTypes>;
  assetsubItems = signal<assetSubItemTypes[]>([]);

  Params = new Params();
  totalCount = signal<number>(0);

  // Disposal states
  showDisposalFormModal = signal<boolean>(false);
  showDisposalInfoModal = signal<boolean>(false);
  selectedSubItemId = signal<number | null>(null);
  selectedSubItemName = signal<string>('');

  disposalForm = {
    disposal_date: new Date().toISOString().split('T')[0],
    disposal_method: 'ขายทอดตลาด',
    disposal_reason: '',
    document_no: '',
    approved_by: '',
    notes: ''
  };

  disposalInfo = signal<any>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.asset_id.set(id);
      this.LoadgetAssetSubItems(id);
      this.loadParentAsset(id);
    }
  }

  loadParentAsset(id: number) {
    this.assetItemsService.getAssetItem(id).subscribe({
      next: (asset) => {
        if (asset && asset.procurement_record_id) {
          this.parentAssetRecordId.set(asset.procurement_record_id);
        }
      },
      error: (error) => console.error(error)
    });
  }

  LoadgetAssetSubItems(id: number) {
    this.assetSubItemsService.getAssetSubItemsbyProcuremen(this.table.params, id).subscribe({
      next: (response) => {
        this.assetsubItems.set(response.data);
        this.totalCount.set(response.count);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    const id = this.asset_id();

    if (!id) return;

    this.table.onSearch(value, () => this.LoadgetAssetSubItems(id));
  }

  onPageChange(page: number) {
    const id = this.asset_id();

    if (!id) return;

    this.table.onPageChange(page, () => this.LoadgetAssetSubItems(id));
  }

  onSort(value: string) {
    const id = this.asset_id();

    if (!id) return;

    this.table.onSort(value, () => this.LoadgetAssetSubItems(id));
  }

  deleteAssetSubItems(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบเรียบร้อยแล้ว');
      }
    });
  }

  confirmDelete(id: number) {
    const procurementId = this.asset_id();

    if (!procurementId) return;

    this.assetSubItemsService.deleteAssetSubItems(id).subscribe({
      next: () => {
        this.alertService.successNo('ลบรายการเรียบร้อยแล้ว');
        this.LoadgetAssetSubItems(procurementId);
      },
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    const asset_id = this.asset_id();

    if (!asset_id) return;

    this.router.navigate(['/admin/assetsubItems/create'], {
      queryParams: {
        asset_id: asset_id,
      },
    });
  }

  goToEdit(assetSubItem: assetSubItemTypes) {
    this.router.navigate(['/admin/assetsubItems/update', assetSubItem.asset_sub_item_id], {
      state: {
        assetItem: assetSubItem,
      },
    });
  }
  cancel() {
    const procurementRecordId = this.parentAssetRecordId();
    if (procurementRecordId) {
      this.router.navigate(['/admin/assetItems', procurementRecordId]);
    } else {
      this.router.navigate(['/admin/assetItems']);
    }
  }
  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge'; pipe?: 'thaiDate' }[] =
    [
      { label: 'รหัสเริ่มต้น', key: 'asset_code_start' },
      { label: 'รหัสสิ้นสุด', key: 'asset_code_end' },
      { label: 'ชื่อคุรุภัณฑ์ย่อย', key: 'sub_item_name' },
      { label: 'หมวดหมู่', key: 'category_name' },
      { label: 'ราคา', key: 'unit_price' },
      { label: 'จำนวน', key: 'quantity_with_unit' },
      { label: 'ราคารวม', key: 'total_price' },
      { label: 'สถานะ', key: 'status', type: 'badge' },
    ];

  handleAction(event: TableAction) {
    if (event.type === 'dispose') {
      this.selectedSubItemId.set(event.item.asset_sub_item_id);
      this.selectedSubItemName.set(event.item.sub_item_name);
      this.disposalForm = {
        disposal_date: new Date().toISOString().split('T')[0],
        disposal_method: 'ขายทอดตลาด',
        disposal_reason: '',
        document_no: '',
        approved_by: '',
        notes: ''
      };
      this.showDisposalFormModal.set(true);
    } else if (event.type === 'disposalDetail') {
      this.selectedSubItemId.set(event.item.asset_sub_item_id);
      this.selectedSubItemName.set(event.item.sub_item_name);
      this.assetSubItemsService.getAssetSubItemDisposal(event.item.asset_sub_item_id).subscribe({
        next: (res) => {
          this.disposalInfo.set(res);
          this.showDisposalInfoModal.set(true);
        },
        error: (err) => {
          this.alertService.error('ดึงข้อมูลล้มเหลว', 'ไม่สามารถดึงข้อมูลประวัติการจำหน่ายได้');
        }
      });
    }
  }

  submitDisposal() {
    const id = this.selectedSubItemId();
    const assetId = this.asset_id();
    if (!id || !assetId) return;

    this.assetSubItemsService.disposeAssetSubItem(id, this.disposalForm).subscribe({
      next: (res) => {
        this.alertService.successNo('จำหน่ายครุภัณฑ์ย่อยสำเร็จ');
        this.closeDisposalForm();
        this.LoadgetAssetSubItems(assetId);
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('จำหน่ายล้มเหลว', err.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    });
  }

  closeDisposalForm() {
    this.showDisposalFormModal.set(false);
    this.selectedSubItemId.set(null);
  }

  closeDisposalInfo() {
    this.showDisposalInfoModal.set(false);
    this.disposalInfo.set(null);
    this.selectedSubItemId.set(null);
  }
}
