export type Certification = {
    item: {
        _id: string;
        cat: string;
        name: string;
        imageLink?: string;
    };
    technician: {
        _id: string;
        id: string;
        firstName: string;
        lastName: string;
    };
    certificationDocumentLink?: string;
    firstCertificationDate?: Date;
    lastCertificationDate?: Date;
    lastCertificationDurationMonths?: number;
    //lastCertificationExpirationDate?: Date;
    plannedCertificationDate?: Date;
    _id: string
};

export const fromJson = (json: any): Certification => {
    return {
        ...json,
        firstCertificationDate: json.firstCertificationDate ? new Date(json.firstCertificationDate) : undefined,
        lastCertificationDate: json.lastCertificationDate ? new Date(json.lastCertificationDate) : undefined,
        //lastCertificationExpirationDate: json.lastCertificationExpirationDate ? new Date(json.lastCertificationExpirationDate) : undefined,
        plannedCertificationDate: json.plannedCertificationDate ? new Date(json.plannedCertificationDate) : undefined,
    };
}