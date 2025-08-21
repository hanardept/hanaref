import { ReactNode } from "react";
import { Role } from "../../types/user_types";
import RolesOnly from "./RolesOnly";

const AdminOnly = ({ hide, children }: { hide?: boolean, children: ReactNode }) => 
    <RolesOnly hide={hide} roles={[ Role.Admin ]} children={children} />

export default AdminOnly;