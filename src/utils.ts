export const isoDate = (date: Date | undefined): string => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("he-IL").replace(/\./g, "-");
}