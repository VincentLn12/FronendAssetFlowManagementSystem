import { assetItemsCreateTypes } from '../../assetItems/interface/assetItemsTypes';

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
  approval_date: string | null;
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

export interface assetSubItemCreateTypes {
  asset_sub_item_id?: number | null;
  asset_id?: number | null;
  item_no?: number | null;
  sub_item_name: string;
  asset_category_id: number | null;
  quantity: number;
  unit_id: number | null;
  unit_price?: number | null;
  total_price?: number | null;
  useful_life_year: number;
}

export interface procurementWithAssetsCreateTypes {
  procurement_record: procurementrecordCreateTypes;
  asset_item: assetItemsCreateTypes;
  asset_sub_items: assetSubItemCreateTypes[];
}

export interface hireDetailCreateTypes {
  hire_detail_id: number;
  procurement_record_id: number;
  item_no: number;
  hire_name: string;
  quantity: number;
  unit_id: number | null;
  unit_price: number;
  total_amount: number;
  total_text: string;
  operation_reason: string | null;
  remark: string | null;
}

export interface procurementWithHireCreateTypes {
  procurement_record: procurementrecordCreateTypes;
  hire_details: hireDetailCreateTypes[];
}
