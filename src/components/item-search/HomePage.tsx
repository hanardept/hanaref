import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import ListItem from "./ListItem";
import SearchMenu from "./SearchMenu";
import classes from './HomePage.module.css';
import LoadingSpinner from "../UI/LoadingSpinner";
import { UIEvent, useEffect } from "react";
import { viewingActions } from "../../store/viewing-slice";
import { itemsActions } from "../../store/item-slice";
import { backendFirebaseUri } from "../../backend-variables/address";
import { useNavigate, useSearchParams } from "react-router-dom"; // Add useSearchParams


const HomePage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const items = useAppSelector(state => state.items.items);
    const searchComplete = useAppSelector(state => state.items.searchComplete);
    const { searchVal, sector, department, page, blockScrollSearch } = useAppSelector(state => state.viewing.searching); 
    const authToken = useAppSelector(state => state.auth.jwt);
    const isAdmin = useAppSelector(state => state.auth.frontEndPrivilege === "admin");

    const goToItemPage = (cat: string) => {
        navigate(`/items/${cat}`);
    }

//    useEffect(() => {
 //       dispatch(viewingActions.emptySearchCriteria());
 //   }, [dispatch]);

        // NEW useEffect to read/write URL params
    useEffect(() => {
        // Read from URL on initial load
        const urlSector = searchParams.get('sector') || '';
        const urlDepartment = searchParams.get('department') || '';
        const urlSearchVal = searchParams.get('search') || '';
        const urlPage = parseInt(searchParams.get('page') || '0', 10); // Parse page as integer

        // If Redux state is empty but URL has values, dispatch to update Redux
        // This makes sure the Redux state reflects the URL on initial load or browser back
        if (sector === '' && urlSector !== '') {
             dispatch(viewingActions.changeSearchCriteria({ sector: urlSector }));
        }
        if (department === '' && urlDepartment !== '') {
            dispatch(viewingActions.changeSearchCriteria({ department: urlDepartment }));
        }
        if (searchVal === '' && urlSearchVal !== '') {
            dispatch(viewingActions.changeSearchCriteria({ searchVal: urlSearchVal }));
        }
        // Only set page if it's different and not the default 0
        if (page === 0 && urlPage > 0) {
            dispatch(viewingActions.changeSearchCriteria({ page: urlPage }));
        }


        // Write to URL whenever Redux state changes (excluding initial empty state)
        const currentSearchParams = new URLSearchParams();
        if (searchVal) {
            currentSearchParams.set('search', searchVal);
        } else {
            currentSearchParams.delete('search');
        }
        if (sector) {
            currentSearchParams.set('sector', sector);
        } else {
            currentSearchParams.delete('sector');
        }
        if (department) {
            currentSearchParams.set('department', department);
        } else {
            currentSearchParams.delete('department');
        }
        // Only add page to URL if it's not 0 (default) to keep URLs cleaner
        if (page > 0) {
            currentSearchParams.set('page', page.toString());
        } else {
            currentSearchParams.delete('page');
        }

        setSearchParams(currentSearchParams, { replace: true }); // Use replace to avoid polluting history stack

    }, [searchVal, sector, department, page, dispatch, searchParams, setSearchParams]); // Add searchParams and setSearchParams to dependencies

    let scrollThrottler = true;
    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        if (!blockScrollSearch && scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70))  {
            scrollThrottler = false;
            fetch(encodeURI(`${backendFirebaseUri}/items?search=${searchVal}&sector=${sector}&department=${department}&page=${page}`), {
                headers: {
                    'auth-token': authToken
                }
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
            <SearchMenu />
            <div className={classes.listItemPusher}></div>
            {!searchComplete && <LoadingSpinner />}
            {searchComplete && items.length === 0 && <></>}
            <div className={classes.itemsWrapper} onScroll={handleScroll}>
                {items.map(i => <ListItem key={i._id} name={i.name} cat={i.cat} shouldBeColored={i.imageLink === "" && isAdmin} goToItemPage={goToItemPage} />)}
            </div>
        </>
    )
}; 

export default HomePage;
