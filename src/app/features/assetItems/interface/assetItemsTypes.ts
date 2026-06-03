import { assetSubItemTypes } from '../../assetsubItems/interface/assetsubItemsTypes';

export interface assetItemsTypes {
  asset_id: number;
  procurement_record_id: number | null;
  item_no: number;
  asset_code_prefix: string;
  asset_name: string;
  receive_date: string;
  fund_category_id: number | null;
  category_name: string | null;
  department_id: number | null;
  department_name: string | null;
  acquisition_method_id: number | null;
  acquisition_method_name: string | null;
}

export interface assetItemsCreateTypes {
  asset_id: number | null;
  procurement_record_id: number | null;
  item_no: number;
  asset_code_prefix?: string | null;
  asset_name: string;
  receive_date: string;
  fund_category_id: number | null;
  department_id: number | null;
  acquisition_method_id: number | null;
}

export interface assetItemsdetailsTypes {
  asset_id: number;
  project_code: string | null;
  staff_name: string | null;
  department_name: string | null;
  vendor_name: string | null;
  vendor_address: string | null;
  vendor_tel: string | null;
  fund_name: string | null;
  acquisition_method_name: string | null;
  receive_date: string;
  asset_sub_items: assetSubItemTypes[];
}
