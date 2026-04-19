import { Sector } from "./sector_types";

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
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    role: Role,
    association: string,
    sector?: Sector,
    archived?: boolean,
    status?: UserStatus,
    _id: string
};