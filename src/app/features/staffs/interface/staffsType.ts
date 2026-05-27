export interface staffsType {
  staff_id: number;
  full_name: string;
  email: string;
  phone: string;
  department_id: number;
  department_name?: string;
  position_name?: string;
  position_id: number;
  prefix_id: number;
  is_active: boolean;
}

export interface staffsTypeCreate {
  staff_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: number;
  position_id: number;
  prefix_id: number;
}
