import { useEffect, useState } from "react";
import { Sector } from "../../types/sector_types";
import DebouncingSearchBar from "./DebouncingSearchBar";
import DepartmentSelection from "./DepartmentSelection";
import SectorSelection from "./SectorSelection";
import classes from './HomePage.module.css';
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import { viewingActions } from "../../store/viewing-slice";
import { backendFirebaseUri } from "../../backend-variables/address";

const SearchMenu = () => {
    const dispatch = useAppDispatch();
    const [sectors, setSectors] = useState<Sector[]>([]);
    const selectedSector = useAppSelector(state => state.viewing.searching.sector);
    const selectedDepartment = useAppSelector(state => state.viewing.searching.department);
    const authToken = useAppSelector(state => state.auth.jwt);

    useEffect(() => {
        fetch(`${backendFirebaseUri}/sectors`, {
            headers: authToken ? {
                'auth-token': authToken
            } : {}
        }).then((res) => res.json()).then((res) => {
            setSectors(res);
        });
    }, [authToken]);

    const handleSetSector = (value: string) => {
        dispatch(viewingActions.changeSearchCriteria({ sector: value, department: "" }));
    }
    
    const handleSetDepartment = (value: string) => {
        dispatch(viewingActions.changeSearchCriteria({ department: value }));
    }
    
    const sectorNames = sectors.map(s => s.sectorName);
    
    // Fix: Safe access and convert Department objects to strings
    const selectedSectorData = sectors.find(s => s.sectorName === selectedSector);
    const departmentsToChooseFrom = selectedSectorData?.departments || [];
    
    // Convert Department objects to string array if needed
    const departmentNames = Array.isArray(departmentsToChooseFrom) 
        ? departmentsToChooseFrom.map(d => typeof d === 'string' ? d : d.name || d.departmentName || String(d))
        : [];
    
    return (
        <div className={classes.searchMenu}>
            <DebouncingSearchBar 
                sectorsLoaded={!!sectors} 
                sector={selectedSector} 
                department={selectedDepartment} 
            />
            {!sectors.length && <>{/* LOADING SPINNER */}</>}
            {sectors.length > 0 && (
                <>
                    <SectorSelection 
                        sectorNames={sectorNames} 
                        handleSetSector={handleSetSector} 
                        priorChosenSector={selectedSector} 
                    />
                    <DepartmentSelection 
                        departments={departmentNames} 
                        handleSetDepartment={handleSetDepartment} 
                        priorChosenDepartment={selectedDepartment}
                    />
                </>
            )}
        </div>
    );
};

export default SearchMenu;
