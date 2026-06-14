export interface MaterialWithdrawalTypes {
  material_withdrawal_id: number;
  material_receive_id?: string | null;
  receive_document_no?: string | null;
  withdrawal_document_no?: string | null;
  staff_id: number;
  staff_name?: string | null;
  procurement_record_id: number;
  remark?: string | null;
}

export interface MaterialWithdrawalCreateTypes {
  material_withdrawal_id: number;
  material_receive_id?: string | null;
  receive_document_no?: string | null;
  withdrawal_document_no?: string | null;
  staff_id: number;
  procurement_record_id: number;
  remark?: string | null;
}
