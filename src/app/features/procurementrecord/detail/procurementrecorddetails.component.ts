import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  procurementRecordStatusHistoryTypes,
  procurementrecordTypes,
} from '../interface/procurementrecordTypes';
import { ThaiDatePipe } from '../../../shared/pipes/thai-date-pipe';
import { Location } from '@angular/common';
import { ProcurementrecordService } from '../service/procurementrecord.service';
@Component({
  selector: 'app-procurementrecord-details',
  imports: [ThaiDatePipe],
  templateUrl: './procurementrecorddetails.component.html',
})
export class ProcurementrecordDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private procurementrecordService = inject(ProcurementrecordService);

  isLoading = signal(false);

  procurementRecord = signal<procurementrecordTypes | null>(null);
  statusHistories = signal<procurementRecordStatusHistoryTypes[]>([]);
  procurement_record_id = signal<number | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.procurement_record_id.set(id);

    const stateRecord = history.state?.procurementrecord as procurementrecordTypes | undefined;

    if (stateRecord) {
      this.procurementRecord.set(stateRecord);
      this.loadStatusHistory(id);
      return;
    }

    this.loadProcurementRecord(id);
  }

  private loadProcurementRecord(id: number) {
    this.isLoading.set(true);

    this.procurementrecordService.getProcurementrecord(id).subscribe({
      next: (record) => {
        this.procurementRecord.set(record);
        this.loadStatusHistory(id);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.procurementRecord.set(null);
      },
    });
  }

  private loadStatusHistory(id: number) {
    this.procurementrecordService.getProcurementrecordStatusHistory(id).subscribe({
      next: (histories) => this.statusHistories.set(histories),
      error: () => this.statusHistories.set([]),
    });
  }

  cancel() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/admin/procurementrecord']);
    }
  }
}
