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
    const selectedSectorData = sectors.find(s => s.sectorName === selectedSector);
    const departmentsRaw = selectedSectorData?.departments || [];
    
    // Convert (string | Department)[] to string[] - THIS IS THE KEY FIX
    const departmentsToChooseFrom: string[] = departmentsRaw.map(dept => {
        if (typeof dept === 'string') {
            return dept;
        }
        // If dept is a Department object, extract the name property
        return (dept as any).name || (dept as any).departmentName || String(dept);
    });
    
    return (
        <div className={classes.searchMenu}>
            <DebouncingSearchBar sectorsLoaded={!!sectors} sector={selectedSector} department={selectedDepartment} />
            {!sectors && <>{/* LOADING SPINNER OR SHINING RECTANGLES */}</>}
            {sectors && <>
                <SectorSelection 
                    sectorNames={sectorNames} 
                    handleSetSector={handleSetSector} 
                    priorChosenSector={selectedSector} 
                />
                <DepartmentSelection 
                    departments={departmentsToChooseFrom} 
                    handleSetDepartment={handleSetDepartment} 
                    priorChosenDepartment={selectedDepartment}
                />
            </>}
        </div>
    )
}

export default SearchMenu;
