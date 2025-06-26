import { useNavigate, useSearchParams } from "react-router-dom"; // Corrected combined import
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import ListItem from "./ListItem";
import SearchMenu from "./SearchMenu";
import classes from './HomePage.module.css';
import LoadingSpinner from "../UI/LoadingSpinner";
import { UIEvent, useEffect } from "react";
import { viewingActions } from "../../store/viewing-slice";
import { itemsActions } from "../../store/item-slice";
import { backendFirebaseUri } from "../../backend-variables/address";

const HomePage = () => {
    const navigate = useNavigate();
    // THIS IS THE CRUCIAL LINE THAT MUST BE PRESENT AND CORRECTLY PLACED
    const [searchParams, setSearchParams] = useSearchParams(); 
    
    const dispatch = useAppDispatch();
    const items = useAppSelector(state => state.items.items);
    const searchComplete = useAppSelector(state => state.items.searchComplete);
    const { searchVal, sector, department, page, blockScrollSearch } = useAppSelector(state => state.viewing.searching); 
    const authToken = useAppSelector(state => state.auth.jwt);
    const isAdmin = useAppSelector(state => state.auth.frontEndPrivilege === "admin");

    const goToItemPage = (cat: string) => {
        navigate(`/items/${cat}`);
    }

    // This useEffect handles syncing the URL with your Redux state
    useEffect(() => {
        // On initial load, read from the URL and update Redux if it's empty
        // These lines now correctly access searchParams, which is defined above
        const urlSector = searchParams.get('sector') || '';
        const urlDepartment = searchParams.get('department') || '';
        const urlSearchVal = searchParams.get('search') || '';

        // Only dispatch if Redux state is actually different from URL to avoid infinite loops
        if (sector === '' && urlSector !== '') {
             dispatch(viewingActions.changeSearchCriteria({ sector: urlSector }));
        }
        if (department === '' && urlDepartment !== '') {
            dispatch(viewingActions.changeSearchCriteria({ department: urlDepartment }));
        }
        if (searchVal === '' && urlSearchVal !== '') {
            dispatch(viewingActions.changeSearchCriteria({ searchVal: urlSearchVal }));
        }
        // Note: page is handled slightly differently as it's incremented during scroll
        // The URL for page param will be updated by the write logic if page > 0

        // Always write the current Redux state back to the URL
        const currentSearchParams = new URLSearchParams();
        if (searchVal) currentSearchParams.set('search', searchVal);
        if (sector) currentSearchParams.set('sector', sector);
        if (department) currentSearchParams.set('department', department);
        if (page > 0) currentSearchParams.set('page', page.toString()); // Only add page if it's not 0 (default)
        
        // This line now correctly uses setSearchParams, which is defined above
        setSearchParams(currentSearchParams, { replace: true });

    }, [searchVal, sector, department, page, dispatch, searchParams, setSearchParams]); // Correct dependencies

    let scrollThrottler = true;
    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        if (!blockScrollSearch && scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70))  {
            scrollThrottler = false;
            // The fetch now correctly uses the state from Redux, which is synced with the URL
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
