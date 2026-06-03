export interface assetWithdrawalTypes {
  procurement_withdrawal_id: number;
  procurement_record_id: number;
  withdrawal_document_no: string;
  staff_id: number;
  staff_name: string;
  storage_location: string;
  purpose: string;
  remark: string;
  withdrawal_date: string | null;
}

export interface assetWithdrawalCreateTypes {
  procurement_withdrawal_id: number | null;
  procurement_record_id: number | null;
  staff_id: number | null;
  storage_location: string | null;
  purpose: string | null;
  remark: string | null;
  withdrawal_date: string | null;
}
