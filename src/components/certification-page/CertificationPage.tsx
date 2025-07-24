import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import classes from './CertificationPage.module.css';
import { viewingActions } from "../../store/viewing-slice";
import LoadingSpinner from "../UI/LoadingSpinner";
import { backendFirebaseUri } from "../../backend-variables/address";
import { Certification } from "../../types/certification_types";


const CertificationPage = () => {
    const params = useParams();
    const authToken = useAppSelector(state => state.auth.jwt);
    const [certification, setCertification] = useState<Certification | null>(null);
    const [loading, setLoading] = useState(true);
    const frontEndPrivilege = useAppSelector(state => state.auth.frontEndPrivilege);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const getCertification = async () => {
            setLoading(true);
            const fetchedCertifications = await fetch(`${backendFirebaseUri}/certifications/${params.certificationid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                }
            });

            return await fetchedCertifications.json();
        };

        getCertification().then(i => {
            if (frontEndPrivilege !== 'admin') {
                navigate(`/itemnotfound/${params.certificationid}`);
                return;
            }
            setCertification(i);
            setLoading(false);
            if (frontEndPrivilege === "admin") {
                dispatch(viewingActions.manageCertificationId(params.certificationid as string));
            }
        }).catch(e => {
            setLoading(false);
            navigate(`/itemnotfound/${params.certificationid}`);
        });

        return () => {
            setCertification(null);
        }

    }, [params.certificationid, authToken, navigate, dispatch, frontEndPrivilege]);



    return (
        <>
            {loading && <LoadingSpinner />}
            {!loading && certification && <div className={classes.certificationsPage}>
                <h1>{certification.itemName}</h1>
                <h1>{certification.technicianFirstName} {certification.technicianLastName}</h1>
            </div>}
        </>
    );
};

export default CertificationPage;

