export enum Role {
    Admin = 'admin',
    Technician = 'technician',
    Viewer = 'viewer',
}

export enum UserStatus {
    Registered = 'registered',
    Active = 'active',
}

export const roleNames: Record<string, string> = {
    admin: "מנהל",
    technician: "טכנאי",
    viewer: "יחידות הרפואה",
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
    status?: UserStatus,
    _id: string
};