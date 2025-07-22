import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import LoadingSpinner from '../UI/LoadingSpinner';
import ListItem from './ListItem';
import classes from './Technicians.module.css';
import { UIEvent, useEffect, useState } from "react";
import { backendFirebaseUri } from "../../backend-variables/address";
import { techniciansActions } from "../../store/technicians-slice";
import { useNavigate } from "react-router-dom";


const Technicians = () => {

    const navigate = useNavigate();
    const searchComplete = useAppSelector(state => state.technicians.searchComplete);
    const technicians = useAppSelector(state => state.technicians.technicians);
    const authToken = useAppSelector(state => state.auth.jwt);
    const dispatch = useAppDispatch();
    const [initialized, setInitialized] = useState(false);

    const goToTechnicianPage = (id: string) => {
        console.log(`Navigating to technician page with ID: ${id}`);
        navigate(`/technicians/${id}`);
    }

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        console.log("Scroll event triggered");

        let scrollThrottler = true;
        if (scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70)) {
            scrollThrottler = false;
            // 2. Ensure the infinite scroll also respects the archive status
            
            // fetch(encodeURI(`${backendFirebaseUri}/technicians`), {
            //     headers: { 'auth-token': authToken }
            // })
            // new Promise<{ json: Promise<Array<{ firstName: string, lastName: string, _id: string }>>((resolve) => {
            //     resolve({ json: () => new Promise((resolve => resolve([{ firstName: "John", lastName: "Doe", _id: "1" }, { firstName: "Jane", lastName: "Smith", _id: "2" }]))) })
            // })
            new Promise<Array<{firstName: string; lastName: string; _id: string }>>((resolve) => {
                resolve([{ firstName: "משה", lastName: "לוי", _id: "1" }, { firstName: "חיים", lastName: "כהן", _id: "2" }])
            })
            .then((jsonedRes) => {
                if (jsonedRes.length > 0) {
                    //dispatch(viewingActions.changeSearchCriteria({ page: page + 1 }));
                    dispatch(techniciansActions.addTechnicians(jsonedRes));
                    dispatch(techniciansActions.declareSearchComplete(true));
                } /*else {
                    dispatch(viewingActions.changeBlockSearcScroll(true));
                }*/
               dispatch(techniciansActions.declareSearchComplete(true));
            });
        } else {
            console.log(`no technicians search!`);
        }
    }

    useEffect(() => {

        // This function will be called to start a new search
        const triggerNewSearch = () => {
            // fetch(encodeURI(`${backendFirebaseUri}/items?search=${searchVal}&sector=${sector}&department=${department}&page=0&status=${archiveStatus}`), {
            //     headers: { 'auth-token': authToken }
            // })
            // .then(res => res.json())
            console.log(`searching technicians...`);

            new Promise<Array<{firstName: string; lastName: string; _id: string }>>((resolve) => {
                resolve([{ firstName: "משה", lastName: "לוי", _id: "1" }, { firstName: "חיים", lastName: "כהן", _id: "2" }])
            })
            .then(jsonedRes => {
                // Replace the current list with the new results
                dispatch(techniciansActions.setTechnicians(jsonedRes)); 
                // Reset pagination and scroll lock for the new search
                // dispatch(viewingActions.changeSearchCriteria({ page: 2 }));
                // dispatch(viewingActions.changeBlockSearcScroll(false));
                dispatch(techniciansActions.declareSearchComplete(true));
            })
            .catch(err => {
                console.error("Error during new search:", err);
                dispatch(techniciansActions.declareSearchComplete(true));
            });
        };

        triggerNewSearch();

    }, [dispatch, authToken, initialized]);

    return (
            <>
                <div className={classes.listItemPusher}></div>
                {!searchComplete && <LoadingSpinner />}
                {searchComplete && technicians.length === 0 && <p className={classes.noResults}>לא נמצאו טכנאים</p>}
                <div className={classes.itemsWrapper} onScroll={handleScroll}>
                    {/* 4. Pass the `isArchived` prop down to the ListItem component */}
                    {technicians.map(i => <ListItem key={i._id} id={i._id} firstName={i.firstName} lastName={i.lastName} goToTechnicianPage={goToTechnicianPage} />)}
                </div>
            </>
        )
}

export default Technicians;