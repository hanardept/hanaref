import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import classes from './TechnicianPage.module.css';
import { viewingActions } from "../../store/viewing-slice";
import LoadingSpinner from "../UI/LoadingSpinner";
import { backendFirebaseUri } from "../../backend-variables/address";
import { Technician } from "../../types/technician_types";


const TechnicianPage = () => {
    const params = useParams();
    const authToken = useAppSelector(state => state.auth.jwt);
    const [technician, setTechnician] = useState<Technician | null>(null);
    const [loading, setLoading] = useState(true);
    const frontEndPrivilege = useAppSelector(state => state.auth.frontEndPrivilege);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const getTechnician = async () => {
            setLoading(true);
            const fetchedTechnician = await fetch(`${backendFirebaseUri}/technicians/${params.technicianid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                }
            });

            return await fetchedTechnician.json();
        };

        getTechnician().then(i => {
            if (frontEndPrivilege !== 'admin') {
                navigate(`/itemnotfound/${params.technicianid}`);
                return;
            }
            setTechnician(i);
            setLoading(false);
            if (frontEndPrivilege === "admin") {
                dispatch(viewingActions.manageTechnicianId(params.technicianid as string));
            }
        }).catch(e => {
            setLoading(false);
            navigate(`/itemnotfound/${params.technicianid}`);
        });

        return () => {
            setTechnician(null);
        }

    }, [params.technicianid, authToken, navigate, dispatch, frontEndPrivilege]);



    return (
        <>
            {loading && <LoadingSpinner />}
            {!loading && technician && <div className={classes.technicianPage}>
                <h1>{technician.firstName} {technician.lastName}</h1>
                <p>{`ת.ז.: ${technician.id}`}</p>
                <p>{`שיוך: ${technician.association}`}</p>
            </div>}
        </>
    );
};

export default TechnicianPage;

