export interface IUnit {
    id?: string;
    unit_code: string;
    unit_name: string;
    description?: string;
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