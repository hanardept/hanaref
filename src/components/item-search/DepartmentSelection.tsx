import React from 'react';
import { Department } from '../../types/sector_types';   //  <-- your existing type

type DeptOption = string | Department;

interface Props {
  departments: DeptOption[];             // ←  **now allows both**
  handleSetDepartment: (value: string) => void;
  priorChosenDepartment?: string;
}

const DepartmentSelection: React.FC<Props> = ({
  departments,
  handleSetDepartment,
  priorChosenDepartment = '',
}) => {
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) =>
    handleSetDepartment(e.target.value);

  // turn every option into a plain string once
  const options: string[] = departments.map((d) =>
    typeof d === 'string'
      ? d
      : d.name || (d as any).departmentName || JSON.stringify(d)
  );

  return (
    <select
      name="departments"
      id="departments"
      value={priorChosenDepartment}
      onChange={handleSelect}
      title="בחר מדור רפואי"
      aria-label="בחירת מדור רפואי"
    >
      <option value="">בחר מדור...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};

export default DepartmentSelection;
