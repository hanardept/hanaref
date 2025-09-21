import { Department } from "../../types/sector_types";

const DepartmentSelection = ({ departments, handleSetDepartment, priorChosenDepartment, required }:
    { departments: Department[], handleSetDepartment: ((value: string) => void) | undefined, priorChosenDepartment?: string, required?: boolean }) => {
    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSetDepartment?.(event.target.value);
    }
    
    return (
        <select name="departments" id="departments" onChange={handleSelect} value={priorChosenDepartment} required={required}>
            <option value="">בחר תחום...{required ? ' *' : ''}</option>
            {departments.map(d => <option key={d._id} value={d.departmentName}>{d.departmentName}</option>)}
        </select>
    );
};

export default DepartmentSelection;