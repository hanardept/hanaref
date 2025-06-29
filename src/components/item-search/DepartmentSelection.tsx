import React from "react";

const DepartmentSelection = ({ 
    departments, 
    handleSetDepartment, 
    priorChosenDepartment 
}: { 
    departments: string[], 
    handleSetDepartment: (value: string) => void, 
    priorChosenDepartment?: string 
}) => {
    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSetDepartment(event.target.value);
    }
    
    return (
        <select 
            name="departments" 
            id="departments" 
            onChange={handleSelect} 
            value={priorChosenDepartment || ""} 
            title="בחר מדור רפואי"
            aria-label="בחירת מדור רפואי"
        >
            <option value="">בחר מדור...</option>
            {departments.map(d => (
                <option key={`${d}y`} value={d}>{d}</option>
            ))}
        </select>
    );
};

export default DepartmentSelection;
