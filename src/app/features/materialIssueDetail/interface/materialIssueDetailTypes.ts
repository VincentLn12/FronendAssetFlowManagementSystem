export interface MaterialIssueDetailTypes {
  issue_detail_id: number;
  procurement_record_id?: number | null;
  material_item_id: number;
  item_no?: number | null;
  material_name?: string | null;
  staff_id?: number | null;
  staff_fullname?: string | null;
  issue_date?: string | null;
  quantity: number;
  unit_price: number;
  total_amount?: number | null;
  remark?: string | null;
}
