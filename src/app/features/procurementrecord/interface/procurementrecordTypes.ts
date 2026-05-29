export interface procurementrecordTypes {
  procurement_record_id: number;
  document_no: string;
  document_date: string;
  inspection_date: string;
  total_amount: number;
  amount_text: string;
  approval_date: string;
  reference_no: string;
  status: string;
  remark: string;
  project_id: number;
  project_code: string;
  fiscal_year_id: number;
  fiscal_year_name: string;
  operation_type_id: number;
  operation_type_name: string;
  expense_type_id: number;
  expense_type_name: string;
  department_id: number;
  department_name: string;
  vendor_id: number;
  vendor_name: string;
  fund_category_id: number;
  fund_category_name: string;
  budget_source_id: number;
  budget_source_name: string;
  staff_id: number;
  staff_fullname: string;
  attachment_file_path: string;
}

export interface procurementrecordCreateTypes {
  procurement_record_id: number;
  document_no: string;
  document_date: string;
  inspection_date: string;
  total_amount: number;
  amount_text: string;
  approval_date: string;
  reference_no: string;
  status: string;
  remark: string;
  project_id: number;
  fiscal_year_id: number;
  operation_type_id: number;
  expense_type_id: number;
  department_id: number;
  vendor_id: number;
  fund_category_id: number;
  budget_source_id: number;
  staff_id: number;
  attachment_file_path: string;
}
