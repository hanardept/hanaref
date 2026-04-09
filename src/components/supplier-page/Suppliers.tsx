import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import LoadingSpinner from '../UI/LoadingSpinner';
import ListItem from './ListItem';
import classes from './Suppliers.module.css';
import { UIEvent, useEffect, useState } from "react";
import { backendFirebaseUri } from "../../backend-variables/address";
import { suppliersActions } from "../../store/supplier-slice";
import { viewingActions } from "../../store/viewing-slice";
import { useNavigate, useSearchParams } from "react-router-dom";

const Suppliers = () => {

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchComplete = useAppSelector(state => state.suppliers.searchComplete);
    const suppliers = useAppSelector(state => state.suppliers.suppliers);
    const { searchVal, page, blockScrollSearch, searchBy } = useAppSelector(state => state.viewing.searching);
    const authToken = useAppSelector(state => state.auth.jwt);
    const [initialized, setInitialized] = useState(false);
    const dispatch = useAppDispatch();

    const goToSupplierPage = (id: string) => {
        console.log(`Navigating to supplier page with ID: ${id}`);
        navigate(`/suppliers/${id}`);
    }

    let scrollThrottler = true;

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {

        if (!blockScrollSearch && scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70)) {
            scrollThrottler = false;
            
            // FIX: Added search, page, and searchBy parameters for perfect pagination
            fetch(encodeURI(`${backendFirebaseUri}/suppliers?search=${searchVal}&page=${page}&searchBy=${searchBy}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then((jsonedRes) => {
                if (jsonedRes.length > 0) {
                    dispatch(viewingActions.changeSearchCriteria({ page: page + 1 }));
                    dispatch(suppliersActions.addSuppliers(jsonedRes));
                } else {
                    dispatch(viewingActions.changeBlockSearcScroll(true));
                }
            })
            .catch(err => {
                console.error("Error during scroll fetch:", err);
            });
        }
    }

    useEffect(() => {

        if (!initialized) return;

        const triggerNewSearch = () => {
            // FIX: Added searchBy parameter to the initial search
            fetch(encodeURI(`${backendFirebaseUri}/suppliers?page=0&search=${searchVal}&searchBy=${searchBy}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then(jsonedRes => {
                dispatch(suppliersActions.setSuppliers(jsonedRes)); 
                dispatch(viewingActions.changeSearchCriteria({ page: 1 }));
                dispatch(viewingActions.changeBlockSearcScroll(false));
                dispatch(suppliersActions.declareSearchComplete(true));
            })
            .catch(err => {
                console.error("Error during new search:", err);
                dispatch(suppliersActions.declareSearchComplete(true));
            });
        };

        triggerNewSearch();

    // FIX: Added searchBy to the dependency array so changing the dropdown instantly triggers a search
    }, [dispatch, authToken, searchVal, searchBy, initialized]); 

     useEffect(() => {
        const urlSearchVal = searchParams.get('search') || '';
        const urlSearchBy = searchParams.get('searchBy') || '';

        if (urlSearchVal) {
            dispatch(viewingActions.changeSearchCriteria({
                searchVal: urlSearchVal,
                searchBy: urlSearchBy,
            }));
        } else {
            dispatch(viewingActions.emptySearchCriteria());
        }
        setInitialized(true);
    }, [dispatch, searchParams]);    

    useEffect(() => {
        const params = new URLSearchParams();
        if (searchVal) params.set('search', searchVal);
        if (searchBy) params.set('searchBy', searchBy);
        
        setSearchParams(params, { replace: true });
    }, [searchVal, searchBy, setSearchParams]);       

    return (
            <>
                {!searchComplete && <LoadingSpinner />}
                {searchComplete && suppliers.length === 0 && <p className={classes.noResults}>לא נמצאו ספקים</p>}
                <div className={classes.itemsWrapper} onScroll={handleScroll}>
                    {suppliers.map(c => {
                        return (
                            <span className={classes.supplierItemContainer} key={c._id}>
                                <ListItem
                                    className={classes.listItem}
                                    textContentClassName={classes.itemTextContent}
                                    _id={c._id}
                                    supplier={c}
                                    goToSupplierPage={goToSupplierPage}
                                />
                            </span>
                        )
                    })}
                </div>
            </>
        )
}

export default Suppliers;