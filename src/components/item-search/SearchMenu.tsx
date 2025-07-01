import { useEffect, useState } from 'react';
import DebouncingSearchBar from './DebouncingSearchBar';
import DepartmentSelection from './DepartmentSelection';
import SectorSelection from './SectorSelection';
import classes from './HomePage.module.css';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import { backendFirebaseUri } from '../../backend-variables/address';
import { Sector, Department } from '../../types/sector_types';

const SearchMenu = () => {
  const dispatch = useAppDispatch();

  /* ────────────────────────────────────  state  */
  const [sectors, setSectors] = useState<Sector[]>([]);

  /* ────────────────────────────────────  redux  */
  const selectedSector     = useAppSelector(s => s.viewing.searching.sector);
  const selectedDepartment = useAppSelector(s => s.viewing.searching.department);
  const authToken          = useAppSelector(s => s.auth.jwt);

  /* ────────────────────────────────────  fetch sectors  */
  useEffect(() => {
    fetch(`${backendFirebaseUri}/sectors`, {
      headers: authToken ? { 'auth-token': authToken } : {}
    })
      .then(res => res.json())
      .then(setSectors)
      .catch(err => console.error('Failed to load sectors:', err));
  }, [authToken]);

  /* ────────────────────────────────────  handlers  */
  const handleSetSector = (val: string) =>
    dispatch(viewingActions.changeSearchCriteria({ sector: val, department: '' }));

  const handleSetDepartment = (val: string) =>
    dispatch(viewingActions.changeSearchCriteria({ department: val }));

  /* ────────────────────────────────────  derive lists  */
  const sectorNames = sectors.map(s => s.sectorName);

  const selectedSectorData = sectors.find(s => s.sectorName === selectedSector);
  const departmentsRaw: (string | Department)[] =
    selectedSectorData?.departments ?? [];

  /* ❶ NORMALISE  */
  const departmentsToChooseFrom: { departmentName: string }[] = departmentsRaw.map(
    d => (typeof d === 'string' ? { departmentName: d } : d)
  );

  /* ────────────────────────────────────  render  */
  return (
    <div className={classes.searchMenu}>
      <DebouncingSearchBar
        sectorsLoaded={!!sectors.length}
        sector={selectedSector}
        department={selectedDepartment}
      />

      {!sectors.length && <></> /* optional loading skeleton */ }

      {!!sectors.length && (
        <>
          <SectorSelection
            sectorNames={sectorNames}
            handleSetSector={handleSetSector}
            priorChosenSector={selectedSector}
          />

          <DepartmentSelection
            departments={departmentsToChooseFrom}   {/* ❷ pass uniform array */}
            handleSetDepartment={handleSetDepartment}
            priorChosenDepartment={selectedDepartment}
          />
        </>
      )}
    </div>
  );
};

export default SearchMenu;
