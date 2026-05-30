export interface hireDetailType {
  hire_detail_id: number;
  procurement_record_id: number;
  document_no: string;
  item_no: number;
  hire_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  total_text: string;
  operation_reason: string;
  remark: string;
  unit_id: number;
  unit_name: string;
}

export interface hireDetailCreateType {
  hire_detail_id: number;
  procurement_record_id: number;
  item_no: number;
  hire_name: string;
  quantity: number;
  unit_id: number | null;
  unit_price: number;
  total_amount: number;
  total_text: string;
  operation_reason: string;
  remark: string;
}
