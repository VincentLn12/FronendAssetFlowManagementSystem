export interface assetRepairsTypes {
  asset_repair_id: number;
  repair_document_no?: string | null;
  repair_date: string;
  problem_description?: string;
  repair_description?: string | null;
  repair_shop_name?: string | null;
  repair_cost?: number | null;
  decree_document_no?: string | null;
  status: string;
  procurement_withdrawal_id: number;
}
