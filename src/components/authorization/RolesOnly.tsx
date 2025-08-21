import { ReactNode } from "react";
import { useAppSelector } from "../../hooks/redux-hooks";
import { Role } from "../../types/user_types";

const RolesOnly = ({ roles, children }: { roles: Role[], children: ReactNode }) => {
    const frontEndPrivilege = useAppSelector(state => state.auth.frontEndPrivilege);
    
    return (
        <>
            {roles.includes(frontEndPrivilege as Role) ? children : `Page usable only by roles: ${roles.join(', ')}`}
        </>
    )
};

export default RolesOnly;