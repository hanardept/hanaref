import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import ListItem from "./ListItem";
import SearchMenu from "./SearchMenu";
import classes from './HomePage.module.css';
import LoadingSpinner from "../UI/LoadingSpinner";
import { UIEvent, useEffect, useRef } from "react"; // Added useRef
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

    // Use a ref to prevent the initial fetch from running twice in development
    const isInitialMount = useRef(true);

    const goToItemPage = (cat: string) => {
        navigate(`/items/${cat}`);
    }

    // Effect 1: Sync URL with Redux state.
    useEffect(() => {
        // On initial load, read from the URL and update Redux
        const urlSector = searchParams.get('sector') || '';
        const urlDepartment = searchParams.get('department') || '';
        const urlSearchVal = searchParams.get('search') || '';

        // This ensures the Redux state matches the URL when you navigate back
        if (urlSector !== sector || urlDepartment !== department || urlSearchVal !== searchVal) {
            dispatch(viewingActions.changeSearchCriteria({
                sector: urlSector,
                department: urlDepartment,
                searchVal: urlSearchVal,
                page: 0 // Always reset to page 0 when filters change
            }));
        }

        // Always write the current Redux state back to the URL
        const currentSearchParams = new URLSearchParams();
        if (searchVal) currentSearchParams.set('search', searchVal);
        if (sector) currentSearchParams.set('sector', sector);
        if (department) currentSearchParams.set('department', department);
        
        // Use replace: true to avoid polluting the browser history with every filter change
        setSearchParams(currentSearchParams, { replace: true });

    }, [searchVal, sector, department, dispatch, searchParams, setSearchParams]);

    // Effect 2: Fetch data when filters change.
    useEffect(() => {
        // Prevent double fetch in React 18 strict mode
        if (process.env.NODE_ENV === 'development' && isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // We have filters, so fetch the first page of results
        dispatch(itemsActions.clearItems()); // Clear old items before fetching new ones

        fetch(encodeURI(`${backendFirebaseUri}/items?search=${searchVal}&sector=${sector}&department=${department}&page=0`), {
            headers: { 'auth-token': authToken }
        })
        .then(res => res.json())
        .then(jsonedRes => {
            dispatch(itemsActions.addItems(jsonedRes));
            // Prepare for infinite scroll
            dispatch(viewingActions.changeSearchCriteria({ page: 1 })); 
            // If the initial fetch returned less than a full page, block further scroll fetches
            dispatch(viewingActions.changeBlockSearcScroll(jsonedRes.length < 20));
        })
        .catch(error => console.error("Initial item fetch failed:", error));

    }, [searchVal, sector, department, authToken, dispatch]); // This effect runs only when filters change

    let scrollThrottler = true;
    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        // This logic now only handles fetching subsequent pages
        if (!blockScrollSearch && scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70))  {
            scrollThrottler = false;
            fetch(encodeURI(`${backendFirebaseUri}/items?search=${searchVal}&sector=${sector}&department=${department}&page=${page}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then(jsonedRes => {
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
