import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { procurementrecordTypes } from '../interface/procurementrecordTypes';
import { ThaiDatePipe } from "../../../shared/pipes/thai-date-pipe";

@Component({
  selector: 'app-procurementrecord-details',
  imports: [ThaiDatePipe],
  templateUrl: './procurementrecorddetails.component.html',
})
export class ProcurementrecordDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = signal(false);

  procurementRecord = signal<procurementrecordTypes | null>(null);
  procurement_record_id = signal<number | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.procurement_record_id.set(id);

    const stateRecord = history.state?.procurementrecord as procurementrecordTypes | undefined;

    if (stateRecord) {
      this.procurementRecord.set(stateRecord);
      return;
    }

    console.warn('ไม่พบข้อมูลจาก state อาจเกิดจาก refresh หน้า หรือเปิด URL โดยตรง');
  }

  cancel() {
    this.router.navigate(['/admin/procurements']);
  }
}
