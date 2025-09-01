export enum CatType {
    Device = 'מכשיר',
    Accessory = 'אביזר',
    Consumable = 'מתכלה',
    SparePart = 'חלק חילוף',
}

export interface SupplierSummary {
    _id: string;
    name: string;
}

export type AbbreviatedItem = { _id?: string, name: string, cat: string, imageLink?: string, manufacturer?: string, archived?: boolean, createdAt?: string, supplier?: SupplierSummary };
export type Item = {
    _id: string,
    name: string,
    cat: string,
    kitCats?: string[],
    sector: string,
    department: string,
    catType: CatType,
    certificationPeriodMonths?: number,
    description: string,
    imageLink?: string,
    qaStandardLink?: string,
    medicalEngineeringManualLink?: string;
    userManualLink?: string,
    serviceManualLink?: string,
    hebrewManualLink?: string,
    emergency?: boolean,
    supplier?: SupplierSummary,
    lifeSpan?: string,
    models?: AbbreviatedItem[],
    accessories?: AbbreviatedItem[],
    consumables?: AbbreviatedItem[],
    spareParts?: AbbreviatedItem[],
    belongsToDevices?: AbbreviatedItem[],
    archived?: boolean;
};
