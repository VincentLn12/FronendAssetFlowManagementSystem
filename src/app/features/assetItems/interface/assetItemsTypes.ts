export interface assetItemsTypes {
  asset_id: number;
  procurement_record_id: number | null;
  item_no: number;
  asset_code_prefix: string;
  asset_name: string;
  receive_date: string;
  // useful_life_year: number;
  // asset_category_id: number;
  // asset_category_name: string;
  fund_category_id: number | null;
  category_name: string | null;
  department_id: number | null;
  department_name: string | null;
  staff_id: number | null;
  staff_name: string | null;
  vendor_id: number | null;
  vendor_name: string | null;
}

export interface assetItemsCreateTypes {
  asset_id: number | null;
  procurement_record_id: number | null;
  item_no: number;
  asset_code_prefix: string;
  asset_name: string;
  receive_date: string;
  // useful_life_year: number;
  // asset_category_id: number;
  fund_category_id: number | null;
  department_id: number | null;
  staff_id: number | null;
  vendor_id: number | null;
}
