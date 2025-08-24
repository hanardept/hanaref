import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import classes from './TechnicianPage.module.css';
import { viewingActions } from "../../store/viewing-slice";
import LoadingSpinner from "../UI/LoadingSpinner";
import { fetchBackend } from "../../backend-variables/address";
import { Technician } from "../../types/technician_types";
import BigButton from "../UI/BigButton";
import { Certification } from "../../types/certification_types";
import { default as ItemListItem } from "../item-search/ListItem";
import { isoDate } from "../../utils";
import { CiWarning } from "react-icons/ci";
import { FaExclamation } from "react-icons/fa6";
import { RxQuestionMark } from "react-icons/rx";
import { IoCalendarNumberOutline } from "react-icons/io5";

import moment from "moment";
import { Role } from "../../types/user_types";
import AdminOnly from "../authorization/AdminOnly";

const toggleTechnicianArchiveStatus = async (technicianId: string, authToken: string) => {
    // The backend route is POST /api/technicians/:id/toggle-archive
    const response = await fetchBackend(`technicians/${technicianId}/toggle-archive`, {
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


const TechnicianPage = () => {
    const params = useParams();
    const { jwt: authToken, userId } = useAppSelector(state => state.auth);
    const [technician, setTechnician] = useState<Technician | null>(null);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const frontEndPrivilege = useAppSelector(state => state.auth.frontEndPrivilege);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isArchiving, setIsArchiving] = useState(false);

    useEffect(() => {
        const getTechnician = async () => {
            setLoading(true);
            const fetchedTechnician = await fetchBackend(`technicians/${params.technicianid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                }
            });

            return await fetchedTechnician.json();
        };

        getTechnician().then(i => {
            // if (frontEndPrivilege !== 'admin') {
            //     navigate(`/itemnotfound/${params.technicianid}`);
            //     return;
            // }
            setTechnician(i);
            setLoading(false);
            if (frontEndPrivilege === "admin") {
                dispatch(viewingActions.manageTechnicianId(params.technicianid as string));
            }
        }).catch(e => {
            setLoading(false);
            navigate(`/itemnotfound/${params.technicianid}`);
        });

        const getCertifications = async () => {
            const fetchedCertifications = await fetchBackend(`certifications?technician=${params.technicianid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                }
            });

            return await fetchedCertifications.json();
        };   
        
        getCertifications().then(c => {
            // if (frontEndPrivilege !== 'admin') {
            //     navigate(`/itemnotfound/${params.technicianid}`);
            //     return;
            // }
            setCertifications(c);
        }).catch(e => {
            console.log("Error fetching technician certifications:", e);
        });        

        return () => {
            setCertifications([]);
            setTechnician(null);
        }

    }, [params.technicianid, authToken, navigate, dispatch, frontEndPrivilege]);

    const handleArchiveToggle = async () => {
        if (!technician) return;

        const isArchived = technician.archived ?? false;
        const actionText = isArchived ? "לשחזר" : "לארכב";
        if (!window.confirm(`האם אתה בטוח שברצונך ${actionText} את הטכנאי "${technician.firstName} ${technician.lastName}"?`)) {
            return;
        }

        setIsArchiving(true);
        try {
            const updatedTechnician = await toggleTechnicianArchiveStatus(technician._id, authToken);
            setTechnician(updatedTechnician); // Update the local state with the new item status
            // Use the state of the item *before* the toggle for the confirmation message
            alert(`הטכנאי ${isArchived ? 'שוחזר' : 'אורכב'} בהצלחה`);
        } catch (error) {
            console.error(error);
            alert('הפעולה נכשלה. נסה שוב.');
        } finally {
            setIsArchiving(false);
        }
    };

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
            {!loading && technician && <div className={classes.technicianPage}>
                <h1>{technician.firstName} {technician.lastName}</h1>
                <p>{`ת.ז.: ${technician.id}`}</p>
                <p>{`שיוך: ${technician.association}`}</p>
                {((frontEndPrivilege === Role.Admin) || (userId === technician._id)) &&
                <>
                <h2>מכשירים מוסמכים</h2>
                <div className={classes.itemsWrapper}/* onScroll={handleScroll}*/>
                    {certifications.map(c => {
                        const certificationStatus = getCertificationStatus(c);
                        return <span className={classes.certificationItemContainer} data-status={certificationStatus.status}>
                            <ItemListItem
                                className={classes.listItem}
                                textContentClassName={classes.itemTextContent}
                                imageClassName={classes.itemImage}
                                cat={c.item.cat}
                                name={c.item.name}
                                imageLink={c.item.imageLink}
                                shouldBeColored={false}
                                customElement={certificationStatus.icon}
                                goToItemPage={() => navigate(`/certifications/${c._id}`)}
                            />
                            <h6>{`תאריך הסמכה הבא: ${isoDate(c.plannedCertificationDate)}`}</h6>
                        </span>
                    }
                    )}
                </div>  
                </>}   
                <AdminOnly hide={true}>
                <BigButton
                    text={isArchiving ? 'מעבד...' : ((technician.archived ?? false) ? 'שחזר מארכיון' : 'שלח לארכיון')}
                    action={handleArchiveToggle}
                    disabled={isArchiving}
                    overrideStyle={{ marginTop: "2rem", backgroundColor: (technician.archived ?? false) ? "#3498db" : "#e67e22" }}
                />
                </AdminOnly>
            </div>}
        </>
    );
};

export default TechnicianPage;

