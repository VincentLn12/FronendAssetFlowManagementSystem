export interface projectsTypes {
  project_id: number;
  project_code: string;
  project_name: string;
  fiscal_year_id: number;
  fiscal_year_name: string;
  project_budget_amount: number;
  staff_id: number;
  staff_name: string;
  filePath: string;
  created_at: string;
}

export interface ProjectAddUpdateDto {
  project_id?: number;
  project_code: string;
  project_name?: string;
  fiscal_year_id: number;
  project_budget_amount: number;
  staff_id?: number;
  filePath: string;
  created_at?: string;
}
