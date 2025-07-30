import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import LoadingSpinner from '../UI/LoadingSpinner';
import ListItem from './ListItem';
import classes from './Certifications.module.css';
import { UIEvent, useEffect } from "react";
import { backendFirebaseUri } from "../../backend-variables/address";
import { certificationsActions } from "../../store/certifications-slice";
import { useNavigate } from "react-router-dom";


const Certifications = () => {

    const navigate = useNavigate();
    const searchComplete = useAppSelector(state => state.certifications.searchComplete);
    const certifications = useAppSelector(state => state.certifications.certifications);
    const { searchVal } = useAppSelector(state => state.viewing.searching);
    const authToken = useAppSelector(state => state.auth.jwt);
    const dispatch = useAppDispatch();
    //const [initialized, setInitialized] = useState(false);

    const goToCertificationPage = (id: string) => {
        console.log(`Navigating to certification page with ID: ${id}`);
        navigate(`/certifications/${id}`);
    }

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        console.log("Scroll event triggered");

        let scrollThrottler = true;
        if (scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70)) {
            scrollThrottler = false;
            
            fetch(encodeURI(`${backendFirebaseUri}/certifications`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then((jsonedRes) => {
                if (jsonedRes.length > 0) {
                    dispatch(certificationsActions.addCertifications(jsonedRes));
                    dispatch(certificationsActions.declareSearchComplete(true));
                }
               dispatch(certificationsActions.declareSearchComplete(true));
            });
        } else {
            console.log(`no certifications search!`);
        }
    }

    useEffect(() => {

        const triggerNewSearch = () => {
            fetch(encodeURI(`${backendFirebaseUri}/certifications?search=${searchVal}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then(jsonedRes => {
                dispatch(certificationsActions.setCertifications(jsonedRes)); 
                dispatch(certificationsActions.declareSearchComplete(true));
            })
            .catch(err => {
                console.error("Error during new search:", err);
                dispatch(certificationsActions.declareSearchComplete(true));
            });
        };

        triggerNewSearch();

    }, [dispatch, authToken, searchVal /*initialized*/]);

    return (
            <>
                {!searchComplete && <LoadingSpinner />}
                {searchComplete && certifications.length === 0 && <p className={classes.noResults}>לא נמצאו הסמכות</p>}
                <div className={classes.itemsWrapper} onScroll={handleScroll}>
                    {certifications.map(c => 
                        <ListItem
                            className={classes.listItem}
                            textContentClassName={classes.itemTextContent}
                            key={c._id}
                            _id={c._id}
                            certification={c}
                            goToCertificationPage={goToCertificationPage}
                        />)}
                </div>
            </>
        )
}

export default Certifications;