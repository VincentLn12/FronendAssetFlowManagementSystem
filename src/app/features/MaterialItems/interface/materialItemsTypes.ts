export interface materialItemsTypes {
  material_item_id: number;
  material_code: string;
  material_name: string;
  specification: string;
  unit_id: number | null;
  unit_name?: string;
  opening_balance: number;
  quantity_in: number;
  quantity_out: number;
  current_balance: number;
  unit_price: number;
  total_amount: number;
  remark: string;
  min_stock: number;
}
