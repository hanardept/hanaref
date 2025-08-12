export const isoDate = (date: Date | undefined): string => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("he-IL").replace(/\./g, "-");
}

export const getFilename = (file?: File | string): string => {
    if (!file) {
        return '';
    }
    return typeof file === 'string' ? file : file.name;
}