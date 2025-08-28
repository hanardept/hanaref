import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import LoadingSpinner from '../UI/LoadingSpinner';
import ListItem from './ListItem';
import classes from './Suppliers.module.css';
import { UIEvent, useEffect } from "react";
import { backendFirebaseUri } from "../../backend-variables/address";
import { suppliersActions } from "../../store/supplier-slice";
import { viewingActions } from "../../store/viewing-slice";
import { useNavigate } from "react-router-dom";


const Suppliers = () => {

    const navigate = useNavigate();
    const searchComplete = useAppSelector(state => state.suppliers.searchComplete);
    const suppliers = useAppSelector(state => state.suppliers.suppliers);
    const { searchVal, page, blockScrollSearch } = useAppSelector(state => state.viewing.searching);
    const authToken = useAppSelector(state => state.auth.jwt);
    const dispatch = useAppDispatch();
    //const [initialized, setInitialized] = useState(false);

    const goToSupplierPage = (id: string) => {
        console.log(`Navigating to supplier page with ID: ${id}`);
        navigate(`/suppliers/${id}`);
    }

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        console.log("Scroll event triggered");

        let scrollThrottler = true;
        if (!blockScrollSearch && scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70)) {
            scrollThrottler = false;
            
            fetch(encodeURI(`${backendFirebaseUri}/suppliers?page=${page}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then((jsonedRes) => {
                if (jsonedRes.length > 0) {
                    dispatch(suppliersActions.addSuppliers(jsonedRes));
                    dispatch(viewingActions.changeSearchCriteria({ page: page + 1 }));
                    //dispatch(suppliersActions.declareSearchComplete(true));
                } else {
                    dispatch(viewingActions.changeBlockSearcScroll(true));
                }
            });
        } else {
            console.log(`no suppliers search!`);
        }
    }

    useEffect(() => {

        const triggerNewSearch = () => {
            fetch(encodeURI(`${backendFirebaseUri}/suppliers?search=${searchVal}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then(jsonedRes => {
                dispatch(suppliersActions.setSuppliers(jsonedRes)); 
                dispatch(suppliersActions.declareSearchComplete(true));
            })
            .catch(err => {
                console.error("Error during new search:", err);
                dispatch(suppliersActions.declareSearchComplete(true));
            });
        };

        triggerNewSearch();

    }, [dispatch, authToken, searchVal /*initialized*/]);

    return (
            <>
                {!searchComplete && <LoadingSpinner />}
                {searchComplete && suppliers.length === 0 && <p className={classes.noResults}>לא נמצאו ספקים</p>}
                <div className={classes.itemsWrapper} onScroll={handleScroll}>
                    {suppliers.map(c => {
                        return (
                            <span className={classes.supplierItemContainer}>
                                <ListItem
                                    className={classes.listItem}
                                    textContentClassName={classes.itemTextContent}
                                    key={c._id}
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