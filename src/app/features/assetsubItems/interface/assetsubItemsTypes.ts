export interface assetSubItemTypes {
  asset_sub_item_id: number;
  asset_id: number;
  asset_code_start: string;
  asset_code_end: string;
  item_no: number | null;
  sub_item_name: string;
  asset_category_id: number;
  category_name: string;
  running_start_no: number | null;
  running_end_no: number | null;
  fiscal_asset_year: number;
  quantity: number;
  unit_id: number;
  unit_name: string;
  unit_price: number | null;
  total_price: number | null;
  useful_life_year: number | null;
  quantity_with_unit: string;
  status: string | null;
}

export interface assetSubItemCreateTypes {
  asset_sub_item_id: number | null;
  asset_id: number;
  item_no: number | null;
  sub_item_name: string;
  asset_category_id: number;
  running_start_no: number;
  running_end_no: number;
  fiscal_asset_year: number;
  quantity: number;
  unit_id: number;
  unit_price: number | null;
  total_price: number | null;
  useful_life_year: number | null;
  status: string | null;
}

export interface assetSubItemDisposalTypes {
  sub_item_disposal_id?: number;
  asset_sub_item_id?: number;
  disposal_date: string;
  disposal_method: string;
  disposal_reason?: string;
  document_no?: string;
  approved_by?: string;
  quantity_disposed?: number;
  notes?: string;
}
