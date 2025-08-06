import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import LoadingSpinner from '../UI/LoadingSpinner';
import ListItem from './ListItem';
import classes from './Technicians.module.css';
import { UIEvent, useEffect } from "react";
import { backendFirebaseUri } from "../../backend-variables/address";
import { techniciansActions } from "../../store/technicians-slice";
import { viewingActions } from "../../store/viewing-slice";
import { useNavigate } from "react-router-dom";
import SearchMenu from "./SearchMenu";


const Technicians = () => {

    const navigate = useNavigate();
    const searchComplete = useAppSelector(state => state.technicians.searchComplete);
    const technicians = useAppSelector(state => state.technicians.technicians);
    const { searchVal, showArchived, page, blockScrollSearch } = useAppSelector(state => state.viewing.searching);
    const authToken = useAppSelector(state => state.auth.jwt);
    const dispatch = useAppDispatch();
    //const [initialized, setInitialized] = useState(false);

    const goToTechnicianPage = (id: string) => {
        console.log(`Navigating to technician page with ID: ${id}`);
        navigate(`/technicians/${id}`);
    }

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        console.log("Scroll event triggered");

        let scrollThrottler = true;
        if (!blockScrollSearch && scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70)) {
            scrollThrottler = false;

            const archiveStatus = showArchived ? 'all' : 'active';
            
            fetch(encodeURI(`${backendFirebaseUri}/technicians?status=${archiveStatus}&page=${page}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then((jsonedRes) => {
                if (jsonedRes.length > 0) {
                    dispatch(techniciansActions.addTechnicians(jsonedRes));
                    dispatch(viewingActions.changeSearchCriteria({ page: page + 1 }));
                } else {
                    dispatch(techniciansActions.declareSearchComplete(true));
                }
            });
        } else {
            console.log(`no technicians search!`);
        }
    }

    useEffect(() => {

        const triggerNewSearch = () => {
            const archiveStatus = showArchived ? 'all' : 'active';
            fetch(encodeURI(`${backendFirebaseUri}/technicians?search=${searchVal}&status=${archiveStatus}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then(jsonedRes => {
                dispatch(techniciansActions.setTechnicians(jsonedRes)); 
                dispatch(techniciansActions.declareSearchComplete(true));
            })
            .catch(err => {
                console.error("Error during new search:", err);
                dispatch(techniciansActions.declareSearchComplete(true));
            });
        };

        triggerNewSearch();

    }, [dispatch, authToken, searchVal, showArchived /*initialized*/]);

    return (
        <>
            <SearchMenu/>
            <div className={classes.listItemPusher}></div>
            {!searchComplete && <LoadingSpinner />}
            {searchComplete && technicians.length === 0 && <p className={classes.noResults}>לא נמצאו טכנאים</p>}
            <div className={classes.itemsWrapper} onScroll={handleScroll}>
                {technicians.map(t => <ListItem className={classes.listItem} textContentClassName={classes.itemTextContent} key={t._id} _id={t._id} id={t.id} shouldBeColored={false} firstName={t.firstName} lastName={t.lastName} association={t.association} isArchived={t.archived} goToTechnicianPage={goToTechnicianPage} />)}
            </div>
        </>
    )
}

export default Technicians;