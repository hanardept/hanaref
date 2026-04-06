export type Supplier = {
    id?: string;
    name?: string;
    street?: string;
    city?: string;
    officePhone?: string;
    contacts?: {
        fullName: string;
        role?: string;
        officePhone?: string;
        cell?: string;
        email?: string;        
        comments?: string;
    }[];
    _id: string;
};