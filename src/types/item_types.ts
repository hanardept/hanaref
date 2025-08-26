export type AbbreviatedItem = { _id?: string, name: string, cat: string, imageLink?: string, manufacturer?: string, archived?: boolean };
export type Item = {
    _id: string,
    name: string,
    cat: string,
    kitCats?: string[],
    sector: string,
    department: string,
    catType: "מכשיר" | "אביזר" | "מתכלה" | "חלק חילוף",
    certificationPeriodMonths?: number,
    description: string,
    imageLink?: string,
    qaStandardLink?: string,
    medicalEngineeringManualLink?: string;
    userManualLink?: string,
    serviceManualLink?: string,
    hebrewManualLink?: string,
    emergency?: boolean,
    supplier?: string,
    lifeSpan?: string,
    models?: AbbreviatedItem[],
    accessories?: AbbreviatedItem[],
    consumables?: AbbreviatedItem[],
    spareParts?: AbbreviatedItem[],
    belongsToDevices?: AbbreviatedItem[],
    archived?: boolean;
};
