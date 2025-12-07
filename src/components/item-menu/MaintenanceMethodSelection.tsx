import { MaintenanceMethod } from "../../types/item_types";

const MaintenanceMethodSelection = ({ maintenanceMethods, selectMaintenanceMethod, currentMaintenanceMethod }: { maintenanceMethods?: MaintenanceMethod[], selectMaintenanceMethod: ((maintenanceMethod: MaintenanceMethod) => void) | undefined, currentMaintenanceMethod: MaintenanceMethod }) => {
    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        selectMaintenanceMethod?.(event.target.value as MaintenanceMethod);
    }

    return (
        <select name="maintenancemethod" id="maintenancemethod" onChange={handleSelect} value={currentMaintenanceMethod}>
            {(maintenanceMethods ?? Object.values(MaintenanceMethod)).map(mm => <option>{mm}</option>)}
        </select>
    )
};

export default MaintenanceMethodSelection;