import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import LoadingSpinner from '../UI/LoadingSpinner';
import ListItem from './ListItem';
import classes from './Technicians.module.css';
import { UIEvent, useEffect, useState } from "react";
import { backendFirebaseUri } from "../../backend-variables/address";
import { techniciansActions } from "../../store/technicians-slice";
import { viewingActions } from "../../store/viewing-slice";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchMenu from "./SearchMenu";


const Technicians = () => {

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchComplete = useAppSelector(state => state.technicians.searchComplete);
    const technicians = useAppSelector(state => state.technicians.technicians);
    const { searchVal, showArchived, page, blockScrollSearch } = useAppSelector(state => state.viewing.searching);
    const authToken = useAppSelector(state => state.auth.jwt);
    const [initialized, setInitialized] = useState(false);
    const dispatch = useAppDispatch();
    //const [initialized, setInitialized] = useState(false);

    const goToTechnicianPage = (id: string) => {
        console.log(`Navigating to technician page with ID: ${id}`);
        navigate(`/technicians/${id}`);
    }

    let scrollThrottler = true;
    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        console.log("Scroll event triggered");

        if (!blockScrollSearch && scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70)) {
            scrollThrottler = false;

            const archiveStatus = showArchived ? 'all' : 'active';
            
            fetch(encodeURI(`${backendFirebaseUri}/technicians?status=${archiveStatus}&page=${page}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then((jsonedRes) => {
                if (jsonedRes.length > 0) {
                    dispatch(viewingActions.changeSearchCriteria({ page: page + 1 }));
                    dispatch(techniciansActions.addTechnicians(jsonedRes));
                } else {
                    dispatch(viewingActions.changeBlockSearcScroll(true));
                }
            });
        } else {
            console.log(`no technicians search!`);
        }
    }

    useEffect(() => {

        if (!initialized) return;

        const triggerNewSearch = () => {
            const archiveStatus = showArchived ? 'all' : 'active';
            fetch(encodeURI(`${backendFirebaseUri}/technicians?page=0&search=${searchVal}&status=${archiveStatus}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then(jsonedRes => {
                dispatch(techniciansActions.setTechnicians(jsonedRes)); 
                dispatch(viewingActions.changeSearchCriteria({ page: 1 }));
                dispatch(viewingActions.changeBlockSearcScroll(false));
                dispatch(techniciansActions.declareSearchComplete(true));
            })
            .catch(err => {
                console.error("Error during new search:", err);
                dispatch(techniciansActions.declareSearchComplete(true));
            });
        };

        triggerNewSearch();

    }, [dispatch, authToken, searchVal, showArchived, initialized ]);


     useEffect(() => {
        const urlSearchVal = searchParams.get('search') || '';
        const urlShowArchived = searchParams.get('showArchived') === 'true';

        if (urlSearchVal) {
            dispatch(viewingActions.changeSearchCriteria({
                searchVal: urlSearchVal,
                showArchived: urlShowArchived,
            }));
        } else {
            dispatch(viewingActions.emptySearchCriteria());
        }
        setInitialized(true);
    }, [dispatch, searchParams]);    

    useEffect(() => {
        const params = new URLSearchParams();
        if (searchVal) params.set('search', searchVal);
        if (showArchived) params.set('showArchived', showArchived.toString());
        
        setSearchParams(params, { replace: true });
    }, [searchVal, showArchived, setSearchParams]);    

    console.log(`technicians: ${JSON.stringify(technicians)}`);

    return (
        <>
            <SearchMenu/>
            {!searchComplete && <LoadingSpinner />}
            {searchComplete && technicians.length === 0 && <p className={classes.noResults}>לא נמצאו טכנאים</p>}
            <div className={classes.itemsWrapper} onScroll={handleScroll}>
                {technicians.map(t => <ListItem className={classes.listItem} textContentClassName={classes.itemTextContent} key={t._id} _id={t._id} id={t.id} shouldBeColored={false} firstName={t.firstName} lastName={t.lastName} association={t.association} isArchived={t.archived} goToTechnicianPage={goToTechnicianPage} />)}
            </div>
        </>
    )
}

export default Technicians;