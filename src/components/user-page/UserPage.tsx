import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import classes from './UserPage.module.css';
import { viewingActions } from "../../store/viewing-slice";
import LoadingSpinner from "../UI/LoadingSpinner";
import { backendFirebaseUri } from "../../backend-variables/address";
import { User } from "../../types/user_types";
import { Certification } from "../../types/certification_types";
import { default as ItemListItem } from "../item-search/ListItem";
import { isoDate } from "../../utils";
import { CiWarning } from "react-icons/ci";
import { FaExclamation } from "react-icons/fa6";
import { RxQuestionMark } from "react-icons/rx";
import { IoCalendarNumberOutline } from "react-icons/io5";

import moment from "moment";

const toggleUserArchiveStatus = async (userId: string, authToken: string) => {
    // The backend route is POST /api/users/:id/toggle-archive
    const response = await fetch(`${backendFirebaseUri}/users/${userId}/toggle-archive`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': authToken,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to toggle archive status: ${errorText}`);
    }
    return response.json();
};


const UserPage = () => {
    const params = useParams();
    const authToken = useAppSelector(state => state.auth.jwt);
    const [user, setUser] = useState<User | null>(null);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const frontEndPrivilege = useAppSelector(state => state.auth.frontEndPrivilege);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isArchiving, setIsArchiving] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            setLoading(true);
            const fetchedUser = await fetch(`${backendFirebaseUri}/users/${params.userid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                }
            });

            return await fetchedUser.json();
        };

        getUser().then(i => {
            if (frontEndPrivilege !== 'admin') {
                navigate(`/itemnotfound/${params.userid}`);
                return;
            }
            setUser(i);
            setLoading(false);
            if (frontEndPrivilege === "admin") {
                dispatch(viewingActions.manageUserId(params.userid as string));
            }
        }).catch(e => {
            setLoading(false);
            navigate(`/itemnotfound/${params.userid}`);
        });

        const getCertifications = async () => {
            const fetchedCertifications = await fetch(`${backendFirebaseUri}/certifications?user=${params.userid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                }
            });

            return await fetchedCertifications.json();
        };   
        
        getCertifications().then(c => {
            if (frontEndPrivilege !== 'admin') {
                navigate(`/itemnotfound/${params.userid}`);
                return;
            }
            setCertifications(c);
        }).catch(e => {
            console.log("Error fetching user certifications:", e);
        });        

        return () => {
            setCertifications([]);
            setUser(null);
        }

    }, [params.userid, authToken, navigate, dispatch, frontEndPrivilege]);

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

        if (today.isAfter(lastCertificationExpirationDate)) {
            return { status: "expired", icon: <FaExclamation className={classes.certificationStatusIcon}/> };
        }
        if (lastCertificationExpirationDate.diff(today, 'months') < 3){
            return { status: "expiring", icon: <CiWarning className={classes.certificationStatusIcon}/> };
        } else {
            return { status: "valid" };
        }
    }

    return (
        <>
            {loading && <LoadingSpinner />}
            {!loading && user && <div className={classes.userPage}>
                <h1>{user.firstName} {user.lastName}</h1>
                <p>{`שם משתמש: ${user.username}`}</p>
                <p>{`דואר אלקטרוני: ${user.email}`}</p>
                
            </div>}
        </>
    );
};

export default UserPage;

