export type AbbreviatedItem = { _id?: string, name: string, cat: string, imageLink?: string };
export type Item = {
    _id: string,
    name: string,
    cat: string,
    sector: string,
    department: string,
    catType: "מקט רגיל" | "מקט ערכה",
    description: string,
    imageLink?: string,
    qaStandardLink?: string,
    models?: AbbreviatedItem[],
    accessories?: AbbreviatedItem[],
    consumables?: AbbreviatedItem[],
    belongsToKits?: AbbreviatedItem[],
    similarItems?: AbbreviatedItem[],
    kitItem?: AbbreviatedItem[]
};