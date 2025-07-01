import React from 'react';

interface DeptObj {
  departmentName: string;
}

interface Props {
  departments: DeptObj[];                       // <- matches SearchMenu
  handleSetDepartment: (value: string) => void;
  priorChosenDepartment?: string;
}

const DepartmentSelection: React.FC<Props> = ({
  departments,
  handleSetDepartment,
  priorChosenDepartment = '',
}) => {
  const onSelect = (e: React.ChangeEvent<HTMLSelectElement>) =>
    handleSetDepartment(e.target.value);

  return (
    <select
      name="departments"
      id="departments"
      value={priorChosenDepartment}
      onChange={onSelect}
      title="בחר מדור רפואי"
      aria-label="בחירת מדור רפואי"
    >
      <option value="">בחר מדור...</option>
      {departments.map(({ departmentName }) => (
        <option key={departmentName} value={departmentName}>
          {departmentName}
        </option>
      ))}
    </select>
  );
};

export default DepartmentSelection;
