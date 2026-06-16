export interface materialReceiveDetailTypes {
  receive_detail_id: number;
  procurement_record_id: number;
  item_no?: number;
  material_item_id: number;
  quantity: number;
  unit_price: number;
  total_amount: number;
  operation_reason: string;
  material_name?: string;
}
