import { useEffect, useState } from "react";
import { Sector } from "../../types/sector_types";
import DebouncingSearchBar from "./DebouncingSearchBar";
import DepartmentSelection from "./DepartmentSelection";
import SectorSelection from "./SectorSelection";
import classes from './HomePage.module.css';
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import { viewingActions } from "../../store/viewing-slice";
import { backendFirebaseUri } from "../../backend-variables/address";

const SearchMenu = ({ hideArchive = false }: { hideArchive?: boolean }) => {
    const dispatch = useAppDispatch();
    const [sectors, setSectors] = useState<Sector[]>([]);
    const showArchived = useAppSelector(state => state.viewing.searching.showArchived);
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
        // setSelectedSector(value);
        // setSelectedDepartment("");
    }
    const handleSetDepartment = (value: string) => {
        console.log("Department changed to:", value);
        dispatch(viewingActions.changeSearchCriteria({ department: value }));
        // setSelectedDepartment(value);
    }
    const handleShowArchived = (value: boolean) => {
        console.log("Show archived changed to:", value);
        dispatch(viewingActions.changeSearchCriteria({ showArchived: value }));
        // setSelectedDepartment(value);
    }
    const sectorNames = sectors.map(s => s.sectorName);
    const departmentsToChooseFrom = selectedSector ? (sectors.filter(s => s.sectorName === selectedSector)?.[0]?.departments ?? []) : [];
    
    return (
        <div className={classes.searchMenu}> 
            <div className={classes.searchRow}>
                <div className={classes.searchBarWrapper}>
                    <DebouncingSearchBar sectorsLoaded={!!sectors} sector={selectedSector} department={selectedDepartment} />
                </div>
                {!hideArchive && (
                    <div className={classes.archiveToggle}>
                        <label>
                            <input
                                type="checkbox"
                                checked={showArchived}
                                onChange={(e) => handleShowArchived(e.target.checked)}
                            />
                            הצג פריטים בארכיון
                        </label>
                    </div>
                )}
            </div>
            {!sectors && <>{/* LOADING SPINNER OR SHINING RECTANGLES */}</>}
            {sectors && <>
                <SectorSelection sectorNames={sectorNames} handleSetSector={handleSetSector} priorChosenSector={selectedSector} />
                <DepartmentSelection departments={departmentsToChooseFrom} handleSetDepartment={handleSetDepartment} priorChosenDepartment={selectedDepartment} />
            </>}
        </div>
    )
}

export default SearchMenu;