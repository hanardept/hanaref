import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import classes from './TechnicianPage.module.css';
import { viewingActions } from "../../store/viewing-slice";
import LoadingSpinner from "../UI/LoadingSpinner";
import { backendFirebaseUri } from "../../backend-variables/address";
import { Technician } from "../../types/technician_types";
import BigButton from "../UI/BigButton";
import { Certification } from "../../types/certification_types";
import { default as ItemListItem } from "../item-search/ListItem";

const toggleTechnicianArchiveStatus = async (technicianId: string, authToken: string) => {
    // The backend route is POST /api/technicians/:id/toggle-archive
    const response = await fetch(`${backendFirebaseUri}/technicians/${technicianId}/toggle-archive`, {
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
    const authToken = useAppSelector(state => state.auth.jwt);
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

        const getCertifications = async () => {
            const fetchedCertifications = await fetch(`${backendFirebaseUri}/certifications?technician=${params.technicianid}`, {
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
                navigate(`/itemnotfound/${params.technicianid}`);
                return;
            }
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



    return (
        <>
            {loading && <LoadingSpinner />}
            {!loading && technician && <div className={classes.technicianPage}>
                <h1>{technician.firstName} {technician.lastName}</h1>
                <p>{`ת.ז.: ${technician.id}`}</p>
                <p>{`שיוך: ${technician.association}`}</p>
                <h2>מכשירים מוסמכים</h2>
                <div className={classes.itemsWrapper}/* onScroll={handleScroll}*/>
                    {certifications.map(c => 
                        <ItemListItem
                            className={classes.listItem}
                            textContentClassName={classes.itemTextContent}
                            imageClassName={classes.itemImage}
                            cat={c.item.cat}
                            name={c.item.name}
                            imageLink={c.item.imageLink}
                            shouldBeColored={false}
                        />
                    )}
                </div>     
                <BigButton
                    text={isArchiving ? 'מעבד...' : ((technician.archived ?? false) ? 'שחזר מארכיון' : 'שלח לארכיון')}
                    action={handleArchiveToggle}
                    disabled={isArchiving}
                    overrideStyle={{ marginTop: "2rem", backgroundColor: (technician.archived ?? false) ? "#3498db" : "#e67e22" }}
                />
            </div>}
        </>
    );
};

export default TechnicianPage;

