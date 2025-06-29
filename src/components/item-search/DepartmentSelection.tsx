const DepartmentSelection = ({ departments, handleSetDepartment, priorChosenDepartment }: { 
    departments: string[], 
    handleSetDepartment: (value: string) => void, 
    priorChosenDepartment?: string // NEW: Added prop to receive selected value
}) => {
    return (
        <select 
            name="departments" 
            id="departments" 
            onChange={handleSelect} 
            value={priorChosenDepartment || ""} // NEW: Shows selected department
            title="בחר מדור רפואי" // NEW: Accessibility attribute
            aria-label="בחירת מדור רפואי" // NEW: Screen reader support
        >
            <option value="">בחר מדור...</option>
            {departments.map(d => <option key={`${d}y`} value={d}>{d}</option>)}
        </select>
    );
};

// SUMMARY OF CHANGES:
// 1. Added priorChosenDepartment prop for showing selected value
// 2. Added accessibility attributes to fix console warnings
// 3. Proper controlled component behavior with value attribute
