// src/components/item-page/ItemPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import { Item } from "../../types/item_types";
import InfoSection from "./InfoSection";
import classes from './ItemPage.module.css';
import { viewingActions } from "../../store/viewing-slice";
import LoadingSpinner from "../UI/LoadingSpinner";
import { backendFirebaseUri } from "../../backend-variables/address";
import BigButton from "../UI/BigButton"; // Importing your existing button component


// A new helper function to call our backend archive endpoint
const toggleItemArchiveStatus = async (itemCat: string, authToken: string) => {
    // The backend route is POST /api/items/:cat/toggle-archive
    const response = await fetch(`${backendFirebaseUri}/items/${itemCat}/toggle-archive`, {
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


const ItemPage = () => {
    const params = useParams();
    const authToken = useAppSelector(state => state.auth.jwt);
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const frontEndPrivilege = useAppSelector(state => state.auth.frontEndPrivilege);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isArchiving, setIsArchiving] = useState(false); // State to handle button disabling

    useEffect(() => {
        const getItem = async () => {
            setLoading(true); // Ensure loading is true at the start of fetch
            const fetchedItem = await fetch(`${backendFirebaseUri}/items/${params.itemid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                }
            });
            return await fetchedItem.json();
        };
        getItem().then(i => {
            // If the item is archived and the user is not an admin, they shouldn't see it.
            if (i.archived && frontEndPrivilege !== 'admin') {
                navigate(`/itemnotfound/${params.itemid}`);
                return;
            }
            setItem(i);
            setLoading(false);
            if (frontEndPrivilege === "admin") {
                dispatch(viewingActions.manageItem(params.itemid as string));
            }
        }).catch(e => {
            setLoading(false);
            navigate(`/itemnotfound/${params.itemid}`);
        });

        return () => {
            setItem(null);
        }
        // We removed `frontEndPrivilege`, `dispatch`, and `navigate` because they are stable and don't need to trigger re-fetches.
    }, [params.itemid, authToken, navigate, dispatch, frontEndPrivilege]);

    // Handler for the new archive/restore button
    const handleArchiveToggle = async () => {
        if (!item) return;

        const isArchived = item.archived ?? false;
        const actionText = isArchived ? "לשחזר" : "לארכב";
        if (!window.confirm(`האם אתה בטוח שברצונך ${actionText} את הפריט "${item.name}"?`)) {
            return;
        }

        setIsArchiving(true);
        try {
            const updatedItem = await toggleItemArchiveStatus(item.cat, authToken);
            setItem(updatedItem); // Update the local state with the new item status
            // Use the state of the item *before* the toggle for the confirmation message
            alert(`הפריט ${isArchived ? 'שוחזר' : 'אורכב'} בהצלחה`);
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
            {!loading && item && <div className={classes.itemPage}>
                <header>
                    <h6>{item.sector}</h6>
                    <h6>{item.department}</h6>
                    {/* Visual marker for archived items */}
                    {item.archived && <h6 className={classes.archivedMarker}> (בארכיון)</h6>}
                </header>
                <h1>{item.name}</h1>
                <p>{`מק"ט: ${item.cat}`}</p>
                {item.catType === "מכשיר" && <p>{`מק"ט ערכה: ${item.kitCats?.[0] ?? ''}`}</p>}
                {item.catType === "מכשיר" && <p>{`תוקף הסמכה בחודשים: ${item.certificationPeriodMonths ?? ''}`}</p>}
                {item.description && <p>{item.description}</p>}
                {item.imageLink && <img src={item.imageLink} alt={item.name} />}
                {(["admin", "hanar"].includes(frontEndPrivilege) && item.qaStandardLink) && <a href={item.qaStandardLink}>לחץ להגעה לתקן בחינה</a>}
                {item.models && item.models.length > 0 && <InfoSection title="דגמים" elements={item.models} unclickable={true} />}
                {item.belongsToDevices && item.belongsToDevices.length > 0 && <InfoSection title="שייך למכשיר" elements={item.belongsToDevices} />}
                {item.accessories && item.accessories.length > 0 && <InfoSection title="אביזרים" elements={item.accessories} />}
                {item.consumables && item.consumables.length > 0 && <InfoSection title="מתכלים" elements={item.consumables} />}
                {item.spareParts && item.spareParts.length > 0 && <InfoSection title="חלקי חילוף" elements={item.spareParts} />}

                {/* The new Archive/Restore button, only for admins */}
                {frontEndPrivilege === 'admin' && (
                    <BigButton
                        text={isArchiving ? 'מעבד...' : ((item.archived ?? false) ? 'שחזר מארכיון' : 'שלח לארכיון')}
                        action={handleArchiveToggle}
                        disabled={isArchiving}
                        overrideStyle={{ marginTop: "2rem", backgroundColor: (item.archived ?? false) ? "#3498db" : "#e67e22" }}
                    />
                )}

            </div>}
        </>
    );
};

export default ItemPage;

