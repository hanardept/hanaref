// src/components/item-page/ItemPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import classes from './ItemPage.module.css';
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
            setLoading(true); // Ensure loading is true at the start of fetch
            // const fetchedTechnician = await fetch(`${backendFirebaseUri}/technicians/${params.technicianid}`, {
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Accept': 'application/json',
            //         'auth-token': authToken
            //     }
            // });
            const fetchedTechnician = { json: async () => new Promise<Technician>((resolve) => resolve({ firstName: "משה", lastName: "לוי", _id: "1" })) };
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
        // We removed `frontEndPrivilege`, `dispatch`, and `navigate` because they are stable and don't need to trigger re-fetches.
    }, [params.technicianid, authToken, navigate, dispatch, frontEndPrivilege]);



    return (
        <>
            {loading && <LoadingSpinner />}
            {!loading && technician && <div className={classes.technicianPage}>
                <header>
                    <h6>{technician.firstName} {technician.lastName}</h6>
                    {/* Visual marker for archived items */}
                </header>
                {/* <h1>{item.name}</h1>
                <p>{`מק"ט: ${item.cat}`}</p>
                {item.description && <p>{item.description}</p>}
                {item.imageLink && <img crossOrigin="anonymous" src={item.imageLink} alt={item.name} />}
                {(["admin", "hanar"].includes(frontEndPrivilege) && item.qaStandardLink) && <a href={item.qaStandardLink}>לחץ להגעה לתקן בחינה</a>}
                {item.models && item.models.length > 0 && <InfoSection title="דגמים" elements={item.models} unclickable={true} />}
                {item.kitItem && item.kitItem.length > 0 && <InfoSection title="מכשיר" elements={item.kitItem} />}
                {item.belongsToKits && item.belongsToKits.length > 0 && <InfoSection title="שייך לערכות" elements={item.belongsToKits} />}
                {item.similarItems && item.similarItems.length > 0 && <InfoSection title="קשור ל..." elements={item.similarItems} />}
                {item.accessories && item.accessories.length > 0 && <InfoSection title="אביזרים" elements={item.accessories} />}
                {item.consumables && item.consumables.length > 0 && <InfoSection title="מתכלים" elements={item.consumables} />} */}

                {/* highlight-start */}
                {/* The new Archive/Restore button, only for admins */}
                {/* {frontEndPrivilege === 'admin' && (
                    <BigButton
                        text={isArchiving ? 'מעבד...' : ((item.archived ?? false) ? 'שחזר מארכיון' : 'שלח לארכיון')}
                        action={handleArchiveToggle}
                        disabled={isArchiving}
                        overrideStyle={{ marginTop: "2rem", backgroundColor: (item.archived ?? false) ? "#3498db" : "#e67e22" }}
                    />
                )} */}
                {/* highlight-end */}

            </div>}
        </>
    );
};

export default TechnicianPage;

