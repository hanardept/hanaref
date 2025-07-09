import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import { viewingActions } from "../../store/viewing-slice";
import classes from './HomePage.module.css';

const DEBOUNCE_LAG = 800;

const DebouncingSearchBar = () => {
    const dispatch = useAppDispatch();
    const noItemsLoaded = useAppSelector(state => state.items.items.length === 0);
    const searchVal = useAppSelector(state => state.viewing.searching.searchVal);
    const authToken = useAppSelector(state => state.auth.jwt);

    const [localSearchVal, setLocalSearchVal] = useState("");

    const eraseSearchVal = () => {
        dispatch(viewingActions.changeSearchCriteria({ searchVal: "" }));
    }

    useEffect(() => {
        setLocalSearchVal(searchVal);
    }, [searchVal]);

    let debouncer = useRef(setTimeout(() => {}, DEBOUNCE_LAG));

    return (
        <div className={classes.searchBarWrapper}>
            <input type="text" value={localSearchVal} onChange={(event) => { 
                setLocalSearchVal(event.target.value);
                console.log("setting local search val to:", event.target.value);
                if (debouncer.current) {
                    console.log(`debouncer current exists!`);
                    clearTimeout(debouncer.current);
                }
                debouncer.current = setTimeout(() => {
                    console.log("Changing search criteria to:", event.target.value);
                    dispatch(viewingActions.changeSearchCriteria({ searchVal: event.target.value }));
                }, DEBOUNCE_LAG)}} />
            {localSearchVal.length > 0 && <div className={classes.xButton} onClick={eraseSearchVal}>×</div>}
        </div>
    )
};

export default DebouncingSearchBar;