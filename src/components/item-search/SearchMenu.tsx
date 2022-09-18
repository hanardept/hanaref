import { useEffect, useState } from "react";
import { Sector } from "../../types/sector_types";
import DebouncingSearchBar from "./DebouncingSearchBar";
import DepartmentSelection from "./DepartmentSelection";
import SectorSelection from "./SectorSelection";
import classes from './HomePage.module.css';
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import { viewingActions } from "../../store/viewing-slice";

const SearchMenu = () => {
    const dispatch = useAppDispatch();
    const [sectors, setSectors] = useState<Sector[]>([]);
    const selectedSector = useAppSelector(state => state.viewing.searching.sector);
    const selectedDepartment = useAppSelector(state => state.viewing.searching.department);
    const authToken = useAppSelector(state => state.auth.jwt);

    useEffect(() => {
        // FETCH SECTORS FROM API + use setSectors on them.
        fetch(`/sectors`, {
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
        dispatch(viewingActions.changeSearchCriteria({ department: value }));
        // setSelectedDepartment(value);
    }
    const sectorNames = sectors.map(s => s.sectorName);
    const departmentsToChooseFrom = selectedSector ? sectors.filter(s => s.sectorName === selectedSector)[0].departments : [];
    
    return (
        <div className={classes.searchMenu}>
            <DebouncingSearchBar sectorsLoaded={!!sectors} sector={selectedSector} department={selectedDepartment} />
            {!sectors && <>{/* LOADING SPINNER OR SHINING RECTANGLES */}</>}
            {sectors && <>
                <SectorSelection sectorNames={sectorNames} handleSetSector={handleSetSector} />
                <DepartmentSelection departments={departmentsToChooseFrom} handleSetDepartment={handleSetDepartment} />
            </>}
        </div>
    )
}

export default SearchMenu;