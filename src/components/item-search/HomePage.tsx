// src/components/item-search/HomePage.tsx

import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import ListItem from "./ListItem";
import SearchMenu from "./SearchMenu";
import classes from './HomePage.module.css';
import LoadingSpinner from "../UI/LoadingSpinner";
import { UIEvent, useEffect, useState } from "react";
import { viewingActions } from "../../store/viewing-slice";
import { itemsActions } from "../../store/item-slice";
import { backendFirebaseUri } from "../../backend-variables/address";

const HomePage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const items = useAppSelector(state => state.items.items);
    const searchComplete = useAppSelector(state => state.items.searchComplete);
    const { searchVal, sector, department, showArchived, page, blockScrollSearch } = useAppSelector(state => state.viewing.searching);
    const authToken = useAppSelector(state => state.auth.jwt);
    const userPrivilege = useAppSelector(state => state.auth.frontEndPrivilege); // Debug
    const isAdmin = userPrivilege === "admin";
    const [initialized, setInitialized] = useState(false);

    // For debugging admin status
    useEffect(() => {
        console.log("[HomePage] User Privilege:", userPrivilege, "Is Admin:", isAdmin);
    }, [userPrivilege, isAdmin]);

    const goToItemPage = (cat: string) => {
        navigate(`/items/${cat}`);
    }

    // This useEffect will now trigger a new search whenever the checkbox state changes.
    useEffect(() => {
        // This function will be called to start a new search
        const triggerNewSearch = () => {
            const archiveStatus = showArchived ? 'all' : 'active';
            fetch(encodeURI(`${backendFirebaseUri}/items?search=${searchVal}&sector=${sector}&department=${department}&page=1&status=${archiveStatus}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then(jsonedRes => {
                // Replace the current list with the new results
                dispatch(itemsActions.setItems(jsonedRes)); 
                // Reset pagination and scroll lock for the new search
                dispatch(viewingActions.changeSearchCriteria({ page: 2 }));
                dispatch(viewingActions.changeBlockSearcScroll(false));
                dispatch(itemsActions.declareSearchComplete(true));
            })
            .catch(err => {
                console.error("Error during new search:", err);
                dispatch(itemsActions.declareSearchComplete(true));
            });
        };

        // We clear the old search criteria when the component mounts.
        // We trigger a new search when the checkbox changes.
        if (searchVal === "" && sector === "" && department === "" && (showArchived === null || showArchived === undefined)) {
             dispatch(viewingActions.emptySearchCriteria());
        }
        triggerNewSearch();

    }, [dispatch, showArchived, searchVal, sector, department, authToken]); // This effect now depends on showArchived

     useEffect(() => {
        const urlSector = searchParams.get('sector') || '';
        const urlDepartment = searchParams.get('department') || '';
        const urlShowArchived = searchParams.get('showArchived') === 'true';
        const urlSearchVal = searchParams.get('search') || '';

        console.log(`URL Params - Sector: ${urlSector}, Department: ${urlDepartment}, Show Archived: ${urlShowArchived}, Search Value: ${urlSearchVal}`);

        if (urlSector || urlDepartment || urlSearchVal || urlShowArchived) {
            dispatch(viewingActions.changeSearchCriteria({
                sector: urlSector,
                department: urlDepartment,
                showArchived: urlShowArchived,
                searchVal: urlSearchVal
            }));
        } else {
            dispatch(viewingActions.emptySearchCriteria());
        }
        setInitialized(true);
    }, [dispatch, searchParams]);

    // NEW: Fetch data whenever search criteria change
    useEffect(() => {
        if (!initialized) return;

        // Clear existing items first
        dispatch(itemsActions.clearItemList());
        
        const archiveStatus = showArchived ? 'all' : 'active';
        // Fetch new data
        fetch(encodeURI(`${backendFirebaseUri}/items?search=${searchVal}&sector=${sector}&department=${department}&status=${archiveStatus}&page=0`), {
            headers: {
                'auth-token': authToken
            }
        })
        .then((res) => res.json())
        .then((jsonedRes) => {
            dispatch(itemsActions.addItems(jsonedRes));
            dispatch(viewingActions.changeSearchCriteria({ page: 1 })); // Reset page for infinite scroll
            dispatch(viewingActions.changeBlockSearcScroll(false)); // Re-enable scrolling
        })
        .catch((error) => {
            console.error("Failed to fetch items:", error);
        });
    }, [searchVal, sector, department, showArchived, authToken, dispatch, initialized]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchVal) params.set('search', searchVal);
        if (sector) params.set('sector', sector);
        if (department) params.set('department', department);
        params.set('showArchived', showArchived.toString());
        console.log(`url params: ${params.toString()}`);
        
        setSearchParams(params, { replace: true });
    }, [searchVal, sector, department, showArchived, setSearchParams]);

    let scrollThrottler = true;
    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        if (!blockScrollSearch && scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70)) {
            scrollThrottler = false;
            // 2. Ensure the infinite scroll also respects the archive status
            const archiveStatus = showArchived ? 'all' : 'active';
            fetch(encodeURI(`${backendFirebaseUri}/items?search=${searchVal}&sector=${sector}&department=${department}&page=${page}&status=${archiveStatus}`), {
                headers: { 'auth-token': authToken }
            })
            .then((res) => res.json())
            .then((jsonedRes) => {
                if (jsonedRes.length > 0) {
                    dispatch(viewingActions.changeSearchCriteria({ page: page + 1 }));
                    dispatch(itemsActions.addItems(jsonedRes));
                } else {
                    dispatch(viewingActions.changeBlockSearcScroll(true));
                }
            });
        }
    }

    return (
        <>
            <SearchMenu hideArchive={!isAdmin}/>
            <div className={classes.listItemPusher}></div>
            {!searchComplete && <LoadingSpinner />}
            {searchComplete && items.length === 0 && <p className={classes.noResults}>לא נמצאו פריטים</p>}
            <div className={classes.itemsWrapper} onScroll={handleScroll}>
                {/* 4. Pass the `isArchived` prop down to the ListItem component */}
                {items.map(i => <ListItem key={i._id} name={i.name} cat={i.cat} shouldBeColored={i.imageLink === "" && isAdmin} goToItemPage={goToItemPage} isArchived={i.archived} />)}
            </div>
        </>
    )
};

export default HomePage;
