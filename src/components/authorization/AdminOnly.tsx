import { ReactNode } from "react";
import { Role } from "../../types/user_types";
import RolesOnly from "./RolesOnly";

const AdminOnly = ({ children }: { children: ReactNode }) => 
    <RolesOnly roles={[ Role.Admin ]} children={children} />

export default AdminOnly;