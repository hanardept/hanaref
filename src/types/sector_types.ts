export interface Department {
    name?: string;
    departmentName?: string;
    [key: string]: any;
}

export interface Sector {
    sectorName: string;
    departments: (Department | string)[];
    [key: string]: any;
}
