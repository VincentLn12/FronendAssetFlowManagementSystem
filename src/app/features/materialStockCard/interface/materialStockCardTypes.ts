export interface MaterialStockCardTypes {
  stock_card_id: number;
  material_item_id: number;
  transaction_date: string;
  transaction_type: string;
  reference_document_no: string | null;
  quantity_in: number;
  quantity_out: number;
  balance_qty: number;
  unit_price: number;
  total_amount: number;
  procurement_record_id?: number | null;
  staff_name?: string;
}
