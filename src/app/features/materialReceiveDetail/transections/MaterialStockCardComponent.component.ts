import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialStockCardTypes } from '../interface/materialReceiveDetailTypes';
import { MaterialReceiveDetailService } from '../service/materialReceiveDetail.service';
import { ThaiDatePipe } from '../../../shared/pipes/thai-date-pipe';

@Component({
  selector: 'app-material-stock-card',
  standalone: true,
  imports: [CommonModule, ThaiDatePipe],
  templateUrl: './MaterialStockCardComponent.component.html',
})
export class MaterialStockCardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(MaterialReceiveDetailService);

  material_item_id = signal<number | null>(null);
  stockCards = signal<MaterialStockCardTypes[]>([]);
  materialItems = history.state.materialItems;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    console.log(this.materialItems);
    if (id && Number.isFinite(id)) {
      this.material_item_id.set(id);
      this.loadStockCard(id);
    }
  }

  loadStockCard(id: number) {
    this.service.getStockCard(id).subscribe({
      next: (res) => this.stockCards.set(res),
      error: (err) => console.error(err),
    });
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

  cancel() {
    this.router.navigate(['/admin/MaterialItems']);
  }
}
