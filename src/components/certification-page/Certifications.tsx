import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import LoadingSpinner from '../UI/LoadingSpinner';
import ListItem from './ListItem';
import classes from './Certifications.module.css';
import { UIEvent, useEffect, useState } from "react";
import { backendFirebaseUri } from "../../backend-variables/address";
import { certificationsActions } from "../../store/certifications-slice";
import { viewingActions } from "../../store/viewing-slice";
import { useNavigate, useSearchParams } from "react-router-dom";
import moment from "moment";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { RxQuestionMark } from "react-icons/rx";
import { FaExclamation } from "react-icons/fa6";
import { CiWarning } from "react-icons/ci";
import { Certification } from "../../types/certification_types";


const Certifications = () => {

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchComplete = useAppSelector(state => state.certifications.searchComplete);
    const certifications = useAppSelector(state => state.certifications.certifications);
    const { searchVal, page, blockScrollSearch } = useAppSelector(state => state.viewing.searching);
    const authToken = useAppSelector(state => state.auth.jwt);
    const [initialized, setInitialized] = useState(false);
    const dispatch = useAppDispatch();

    const goToCertificationPage = (id: string) => {
        console.log(`Navigating to certification page with ID: ${id}`);
        navigate(`/certifications/${id}`);
    }

    let scrollThrottler = true;

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        console.log("Scroll event triggered");

        if (!blockScrollSearch && scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70)) {
            scrollThrottler = false;
            
            fetch(encodeURI(`${backendFirebaseUri}/certifications?page=${page}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then((jsonedRes) => {
                if (jsonedRes.length > 0) {
                    dispatch(viewingActions.changeSearchCriteria({ page: page + 1 }));
                    dispatch(certificationsActions.addCertifications(jsonedRes));
                } else {
                    dispatch(viewingActions.changeBlockSearcScroll(true));
                }
            });
        } else {
            console.log(`no certifications search!`);
        }
    }

        const getCertificationStatus = (certification: Certification): { status: string, icon?: JSX.Element } => {
        if (!certification.lastCertificationDate) {
            return { 
                status: "unknown",
                icon: 
                    <span>
                        <RxQuestionMark className={classes.certificationStatusIcon}/>
                        <IoCalendarNumberOutline className={classes.certificationStatusIcon}/>
                    </span> 
            };
        }
        const today = moment().startOf('day');
        const lastCertificationExpirationDate = moment(certification.lastCertificationDate).add(certification.item?.certificationPeriodMonths ?? 0, 'months');
        console.log("Last certification expiration date:", lastCertificationExpirationDate.format('YYYY-MM-DD'));

        if (today.isAfter(lastCertificationExpirationDate)) {
            return { status: "expired", icon: <FaExclamation className={classes.certificationStatusIcon}/> };
        }
        if (lastCertificationExpirationDate.diff(today, 'months') < 3){
            return { status: "expiring", icon: <CiWarning className={classes.certificationStatusIcon}/> };
        } else {
            return { status: "valid" };
        }
    }

    useEffect(() => {

        if (!initialized) return;

        const triggerNewSearch = () => {
            fetch(encodeURI(`${backendFirebaseUri}/certifications?page=0&search=${searchVal}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then(jsonedRes => {
                dispatch(certificationsActions.setCertifications(jsonedRes)); 
                dispatch(viewingActions.changeSearchCriteria({ page: 1 }));
                dispatch(viewingActions.changeBlockSearcScroll(false));
                dispatch(certificationsActions.declareSearchComplete(true));
            })
            .catch(err => {
                console.error("Error during new search:", err);
                dispatch(certificationsActions.declareSearchComplete(true));
            });
        };

        triggerNewSearch();

    }, [dispatch, authToken, searchVal, initialized ]);


     useEffect(() => {
        const urlSearchVal = searchParams.get('search') || '';

        if (urlSearchVal) {
            dispatch(viewingActions.changeSearchCriteria({
                searchVal: urlSearchVal
            }));
        } else {
            dispatch(viewingActions.emptySearchCriteria());
        }
        setInitialized(true);
    }, [dispatch, searchParams]);    

    useEffect(() => {
        const params = new URLSearchParams();
        if (searchVal) params.set('search', searchVal);
        
        setSearchParams(params, { replace: true });
    }, [searchVal, setSearchParams]);        

    return (
            <>
                {!searchComplete && <LoadingSpinner />}
                {searchComplete && certifications.length === 0 && <p className={classes.noResults}>לא נמצאו הסמכות</p>}
                <div className={classes.itemsWrapper} onScroll={handleScroll}>
                    {certifications.map(c => {
                        const certificationStatus = getCertificationStatus(c);
                        return (
                            <span className={classes.certificationItemContainer} data-status={certificationStatus.status}>
                                <ListItem
                                    className={classes.listItem}
                                    textContentClassName={classes.itemTextContent}
                                    key={c._id}
                                    _id={c._id}
                                    certification={c}
                                    goToCertificationPage={goToCertificationPage}
                                    customElement={certificationStatus.icon}
                                />
                            </span>
                        )
                    })}
                </div>
            </>
        )
}

export default Certifications;