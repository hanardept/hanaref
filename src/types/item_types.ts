export type AbbreviatedItem = { _id?: string, name: string, cat: string, imageLink?: string, manufacturer?: string, archived?: boolean };
export type Item = {
    _id: string,
    name: string,
    cat: string,
    sector: string,
    department: string,
    catType: "מכשיר" | "אביזר" | "מתכלה" | "חלקי חילוף",
    description: string,
    imageLink?: string,
    qaStandardLink?: string,
    userManualLink?: string,
    serviceManualLink?: string,
    hebrewManualLink?: string,
    supplier?: string,
    lifeSpan?: string,
    models?: AbbreviatedItem[],
    accessories?: AbbreviatedItem[],
    consumables?: AbbreviatedItem[],
    spareParts?: AbbreviatedItem[],
    belongsToDevice?: AbbreviatedItem[],
    kitItem?: AbbreviatedItem[]
    archived?: boolean;
};
