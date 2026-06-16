import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ProcurementSaveSummaryItem {
  title: string;
  subtitle?: string;
  quantity?: number;
  unitLabel?: string;
  unitPrice?: number;
  totalPrice?: number;
  note?: string;
}

export interface ProcurementSaveSummarySection {
  title: string;
  items: ProcurementSaveSummaryItem[];
}

@Component({
  selector: 'app-procurement-save-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './procurement-save-confirmation-modal.component.html',
})
export class ProcurementSaveConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Input() modeLabel = 'บันทึกข้อมูล';
  @Input() documentNo = '';
  @Input() expenseTypeName = '';
  @Input() vendorName = '';
  @Input() totalAmount = 0;
  @Input() amountText = '';
  @Input() sections: ProcurementSaveSummarySection[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  getSectionTotal(section: ProcurementSaveSummarySection): number {
    return section.items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  }
}
