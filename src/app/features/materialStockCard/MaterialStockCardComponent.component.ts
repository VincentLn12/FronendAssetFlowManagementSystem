import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialStockCardTypes } from './interface/materialStockCardTypes';
import { ThaiDatePipe } from '../../shared/pipes/thai-date-pipe';
import { materialItemsTypes } from '../MaterialItems/interface/materialItemsTypes';
import { MaterialStockCardService } from './service/materialStockCard.service';

@Component({
  selector: 'app-material-stock-card',
  standalone: true,
  imports: [CommonModule, ThaiDatePipe],
  templateUrl: './MaterialStockCardComponent.component.html',
})
export class MaterialStockCardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(MaterialStockCardService);

  material_item_id = signal<number | null>(null);
  fiscalYearId = signal<number | null>(history.state?.fiscalYearId ?? null);

  stockCards = signal<MaterialStockCardTypes[]>([]);
  materialItems = (history.state.materialItems as materialItemsTypes | undefined) ?? undefined;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    const fiscalYearIdParam = this.route.snapshot.queryParamMap.get('fiscal_year_id');

    const fiscalYearId = fiscalYearIdParam ? Number(fiscalYearIdParam) : null;

    this.fiscalYearId.set(fiscalYearId && Number.isFinite(fiscalYearId) ? fiscalYearId : null);

    if (id && Number.isFinite(id)) {
      this.material_item_id.set(id);
      this.loadStockCard(id);
    }
  }

  loadStockCard(id: number) {
    this.service.getStockCard(id, this.fiscalYearId()).subscribe({
      next: (res) => this.stockCards.set(res),
      error: (err) => console.error(err),
    });
  }

  getOpeningRow() {
    return this.stockCards().find((item) => item.transaction_type === 'BALANCE') ?? null;
  }

  getTransactionRows() {
    return this.stockCards().filter((item) => item.transaction_type !== 'BALANCE');
  }

  getDisplayRows() {
    const rows = this.getTransactionRows();
    const minRows = 10;
    const emptyRows = Math.max(minRows - rows.length, 0);

    return {
      rows,
      emptyRows: Array.from({ length: emptyRows }, (_, index) => index),
    };
  }

  getTotalIn() {
    return this.stockCards().reduce((sum, x) => sum + Number(x.quantity_in || 0), 0);
  }

  getTotalOut() {
    return this.stockCards().reduce((sum, x) => sum + Number(x.quantity_out || 0), 0);
  }

  getBalance() {
    const last = this.stockCards().at(-1);
    return last?.balance_qty ?? 0;
  }

  getUnitPrice() {
    return (
      this.getOpeningRow()?.unit_price ??
      this.stockCards().find((item) => item.unit_price)?.unit_price ??
      0
    );
  }

  getTotalAmount() {
    const opening = this.getOpeningRow();
    return opening?.total_amount ?? this.getUnitPrice() * this.getBalance();
  }

  getTransactionLabel(type: string | null | undefined) {
    switch (type) {
      case 'IN':
        return 'รับเข้า';
      case 'OUT':
        return 'จ่ายออก';
      case 'BALANCE':
        return 'ยอดยกมา';
      default:
        return 'ปรับปรุง';
    }
  }

  getTransactionDetail(item: MaterialStockCardTypes) {
    if (item.transaction_type === 'IN') {
      return item.reference_document_no || '-';
    }

    if (item.transaction_type === 'OUT') {
      return item.staff_name ? `ผู้เบิก ${item.staff_name}` : '-';
    }

    return item.staff_name || item.reference_document_no || '-';
  }

  gotoMaterialReceiveDetails(item: MaterialStockCardTypes) {
    console.log('clicked item:', item);

    if (!item.procurement_record_id) {
      console.log('ไม่มี procurement_record_id');
      return;
    }

    this.router.navigate(['/admin/materialReceiveDetails', item.procurement_record_id], {
      state: {
        procurementrecord: {
          procurement_record_id: item.procurement_record_id,
          document_no: item.reference_document_no,
        },
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/MaterialItems']);
  }
}
