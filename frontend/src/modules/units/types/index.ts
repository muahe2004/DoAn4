export interface IUnit {
  id?: string;
  unit_name: string;
  description?: string;
  type?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IMultiUnitCreate {
  units: IUnit[];
}

export interface IUnitResponse extends IUnit {
  status: string;
}
