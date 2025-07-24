export type Certification = {
    itemId: string;
    itemCat: string;
    itemName: string;
    technicianId: string;
    technicianFirstName: string;
    technicianLastName: string;
    certificationDocumentLink?: string;
    firstCertificationDate?: Date;
    lastCertificationDate?: Date;
    lastCertificationExpirationDate?: Date;
    plannedCertificationDate?: Date;
    _id: string
};