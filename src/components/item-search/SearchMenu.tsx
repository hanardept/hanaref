import { useEffect, useState } from 'react';
import { Sector, Department } from '../../types/sector_types';
import DebouncingSearchBar from './DebouncingSearchBar';
import DepartmentSelection from './DepartmentSelection';
import SectorSelection from './SectorSelection';
import classes from './HomePage.module.css';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import { backendFirebaseUri } from '../../backend-variables/address';

const SearchMenu = () => {
  const dispatch = useAppDispatch();
  const [sectors, setSectors] = useState<Sector[]>([]);
  
  const selectedSector = useAppSelector(state => state.viewing.searching.sector);
  const selectedDepartment = useAppSelector(state => state.viewing.searching.department);
  const authToken = useAppSelector(state => state.auth.jwt);

  useEffect(() => {
    fetch(`${backendFirebaseUri}/sectors`, {
      headers: authToken ? { 'auth-token': authToken } : {}
    })
      .then(res => res.json())
      .then(res => setSectors(res))
      .catch(err => console.error('Failed to load sectors:', err));
  }, [authToken]);

  const handleSetSector = (value: string) => {
    dispatch(viewingActions.changeSearchCriteria({ sector: value, department: '' }));
  };

  const handleSetDepartment = (value: string) => {
    dispatch(viewingActions.changeSearchCriteria({ department: value }));
  };

  const sectorNames = sectors.map(s => s.sectorName);
  
  const selectedSectorData = sectors.find(s => s.sectorName === selectedSector);
  const departmentsRaw: (string | Department)[] = selectedSectorData?.departments || [];

  // Normalize all departments to { departmentName: string } format
  const departmentsToChooseFrom: { departmentName: string }[] = departmentsRaw.map(d => {
    if (typeof d === 'string') {
      return { departmentName: d };
    }
    return d;
  });

  return (
    <div className={classes.searchMenu}>
      <DebouncingSearchBar
        sectorsLoaded={!!sectors.length}
        sector={selectedSector}
        department={selectedDepartment}
      />
      
      {!sectors.length && <></>}
      
      {!!sectors.length && (
        <>
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
        </>
      )}
    </div>
  );
};

export default SearchMenu;
