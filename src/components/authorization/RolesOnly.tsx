import { ReactNode } from "react";
import { useAppSelector } from "../../hooks/redux-hooks";
import { Role } from "../../types/user_types";

const RolesOnly = ({ hide, roles, children }: { hide?: boolean, roles: Role[], children: ReactNode }) => {
    const frontEndPrivilege = useAppSelector(state => state.auth.frontEndPrivilege);
    console.log(`allowed roles: ${roles}`);
    return (
        <>
            {roles.includes(frontEndPrivilege as Role) ? children : hide ? <></> : `Page usable only by roles: ${roles.join(', ')}`}
        </>
    )
};

export default RolesOnly;