import { Role, roleNames } from "../../types/user_types";

const RoleSelection = ({ selectRole, currentRole }: { selectRole: (role: Role) => void, currentRole: Role }) => {
    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        selectRole(Object.keys(roleNames).find(role => roleNames[role] === event.target.value) as Role);
    }

    return (
        <select name="role" id="role" onChange={handleSelect} value={roleNames[currentRole]}>
            {
                Object.values(Role).map(role => 
                    <option key={role}>{roleNames[role]}</option>)
            }
        </select>
    )
};

export default RoleSelection;