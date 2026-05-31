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
}
