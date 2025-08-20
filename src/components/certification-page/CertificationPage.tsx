import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import classes from './CertificationPage.module.css';
import { viewingActions } from "../../store/viewing-slice";
import LoadingSpinner from "../UI/LoadingSpinner";
import { fetchBackend } from "../../backend-variables/address";
import { Certification, fromJson } from "../../types/certification_types";
import moment from "moment";
import { isoDate } from "../../utils";


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
            const fetchedCertifications = await fetchBackend(`certifications/${params.certificationid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                }
            });

            return await fetchedCertifications.json();
        };

        getCertification().then(c => {
            if (frontEndPrivilege !== 'admin') {
                navigate(`/itemnotfound/${params.certificationid}`);
                return;
            }
            setCertification(fromJson(c));
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
    
    const lastCertificationExpirationDate = certification?.lastCertificationDate ? moment(certification.lastCertificationDate).add(certification.item?.certificationPeriodMonths ?? 0, 'months').toDate() : undefined;

    return (
        <>
            {loading && <LoadingSpinner />}
            {!loading && certification && <div className={classes.certificationPage}>
                <h1>{certification.item.name}</h1>
                <h1>{certification.user.firstName} {certification.user.lastName}</h1>
                <p>{`תאריך הסמכה ראשונה: ${isoDate(certification.firstCertificationDate)}`}</p>
                <p>{`תאריך הסמכה אחרונה: ${isoDate(certification.lastCertificationDate)}`}</p>
                <p>{`תוקף הסמכה אחרונה בחודשים: ${certification.item?.certificationPeriodMonths ?? ''}`}</p>
                <p>{`תאריך תפוגת הסמכה אחרונה: ${isoDate(lastCertificationExpirationDate)}`}</p>
                <p>{`תאריך הסמכה צפויה: ${isoDate(certification.plannedCertificationDate)}`}</p>
                {certification.certificationDocumentLink && <a href={certification.certificationDocumentLink}>לחץ להגעה לתעודת הסמכה</a>}
            </div>}
        </>
    );
};

export default CertificationPage;

