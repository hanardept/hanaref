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
        // FETCH SECTORS FROM API + use setSectors on them.
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
    
    // THE FIX: Safe access to departments with proper null checking
    const selectedSectorData = sectors.find(s => s.sectorName === selectedSector);
    const departmentsToChooseFrom = selectedSectorData?.departments || [];
    
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
