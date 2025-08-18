export enum Role {
    Admin = 'admin',
    Technician = 'technician',
}

export const roleNames: Record<string, string> = {
    admin: "מנהל",
    technician: "טכנאי",
}

export type User = {
    id: string,
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    role: Role,
    association: string,
    archived?: boolean,
    _id: string
};