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
    const { searchVal, sector, department, page, blockScrollSearch } = useAppSelector(state => state.viewing.searching); 
    const authToken = useAppSelector(state => state.auth.jwt);
    const isAdmin = useAppSelector(state => state.auth.frontEndPrivilege === "admin");
    const [initialized, setInitialized] = useState(false);

    const goToItemPage = (cat: string) => {
        navigate(`/items/${cat}`);
    }

    useEffect(() => {
        const urlSector = searchParams.get('sector') || '';
        const urlDepartment = searchParams.get('department') || '';
        const urlSearchVal = searchParams.get('search') || '';

        if (urlSector || urlDepartment || urlSearchVal) {
            dispatch(viewingActions.changeSearchCriteria({
                sector: urlSector,
                department: urlDepartment,
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
        
        // Fetch new data
        fetch(encodeURI(`${backendFirebaseUri}/items?search=${searchVal}&sector=${sector}&department=${department}&page=0`), {
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
    }, [searchVal, sector, department, authToken, dispatch]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchVal) params.set('search', searchVal);
        if (sector) params.set('sector', sector);
        if (department) params.set('department', department);
        
        setSearchParams(params, { replace: true });
    }, [searchVal, sector, department, setSearchParams]);

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