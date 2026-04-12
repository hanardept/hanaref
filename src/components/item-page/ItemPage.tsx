// src/components/item-page/ItemPage.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import { Item, MaintenanceMethod, SupplierSummary } from "../../types/item_types";
import InfoSection from "./InfoSection";
import classes from './ItemPage.module.css';
import { viewingActions } from "../../store/viewing-slice";
import LoadingSpinner from "../UI/LoadingSpinner";
import { backendFirebaseUri } from "../../backend-variables/address";
import BigButton from "../UI/BigButton"; // Importing your existing button component
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { Role } from "../../types/user_types";


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

interface DiffFieldProps {
    label: string;
    fieldName: keyof Item;
    item: Item;
    isAdmin: boolean;
    decision?: 'approve' | 'reject'; // Current local decision
    onDecision: (field: string, action: 'approve' | 'reject' | null) => void;
    renderValue?: (val: any) => React.ReactNode;
}

const DiffField = ({ label, fieldName, item, isAdmin, decision, onDecision, renderValue }: DiffFieldProps) => {
    const liveValue = item[fieldName];
    const pendingValue = (item as any).pendingChanges?.[fieldName];
    const hasChange = pendingValue !== undefined && JSON.stringify(pendingValue) !== JSON.stringify(liveValue);

    const display = (val: any) => {
        if (val === undefined || val === null || val === '') return 'ריק';
        return renderValue ? renderValue(val) : String(val);
    };

    if (!hasChange) {
        return (
            <div className={classes.fieldRow}>
                {/* <span className={classes.fieldLabel}>{label}:</span> */}
                <span className={classes.fieldValue}>{display(liveValue)}</span>
            </div>
        );
    }

    return (
        <div className={`${classes.diffContainer} ${decision ? classes[decision] : ''}`}>
            {/* <label className={classes.diffLabel}>{label}:</label> */}
            <div className={classes.diffBox}>
                <div className={classes.valueOld}>{display(liveValue)}</div>
                <div className={classes.valueNew}>{display(pendingValue)}</div>
                {isAdmin && (
                    <div className={classes.diffActions}>
                        <button 
                            onClick={() => onDecision(fieldName as string, decision === 'approve' ? null : 'approve')} 
                            className={`${classes.approveBtn} ${decision === 'approve' ? classes.active : ''}`}
                        >
                            {decision === 'approve' ? 'ביטול בחירה' : 'אשר'}
                        </button>
                        <button 
                            onClick={() => onDecision(fieldName as string, decision === 'reject' ? null : 'reject')} 
                            className={`${classes.rejectBtn} ${decision === 'reject' ? classes.active : ''}`}
                        >
                            {decision === 'reject' ? 'ביטול בחירה' : 'דחה'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const ItemPage = () => {
    const params = useParams();
    const { jwt: authToken, frontEndPrivilege } = useAppSelector(state => state.auth);
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [decisions, setDecisions] = useState<Record<string, 'approve' | 'reject'>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            if (i.archived && frontEndPrivilege !== Role.Admin) {
                navigate(`/itemnotfound/${params.itemid}`);
                return;
            }
            setItem(i);
            setLoading(false);
            if (frontEndPrivilege === Role.Admin) {
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

    console.log(`belongsToDevices: ${JSON.stringify(item?.belongsToDevices?.sort((d1, d2) => new Date(d1.createdAt!).getTime() - new Date(d2.createdAt!).getTime()))}`)
    console.log(`parent supplier: ${JSON.stringify(item?.belongsToDevices?.sort((d1, d2) => new Date(d1.createdAt!).getTime() - new Date(d2.createdAt!).getTime()).find(d => d.supplier)?.supplier)}`)

    const actualSupplier = {
        supplier: undefined as SupplierSummary | undefined,
        isParent: false,
    };
    if (item?.supplier !== undefined) {
        actualSupplier.supplier = item.supplier;
    } else {
        actualSupplier.supplier = item?.belongsToDevices?.sort((d1, d2) => new Date(d1.createdAt!).getTime() - new Date(d2.createdAt!).getTime()).find(d => d.supplier)?.supplier;
        actualSupplier.isParent = true;
    }

    const handleDecisionChange = (field: string, action: 'approve' | 'reject' | null) => {
        setDecisions(prev => {
            const newDecisions = { ...prev };
            if (action === null) delete newDecisions[field];
            else newDecisions[field] = action;
            return newDecisions;
        });
    };

    const submitAllReviews = async () => {
        if (Object.keys(decisions).length === 0) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`${backendFirebaseUri}/items/${params.itemid}/review-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'auth-token': authToken },
                body: JSON.stringify({ reviews: decisions })
            });
            const updatedItem = await response.json();
            setItem(updatedItem);
            setDecisions({}); // Reset local state after success
            alert("השינויים עודכנו בהצלחה");
        } catch (err) {
            alert("הפעולה נכשלה");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAdmin = frontEndPrivilege === Role.Admin;
    const pendingChangesCount = Object.keys((item as any)?.pendingChanges || {}).length;
    const decisionsCount = Object.keys(decisions).length;
    const allDecisionsMade = pendingChangesCount > 0 && decisionsCount === pendingChangesCount;

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
                {/* <h1>{item.name}</h1> */}
                <DiffField label='שם הפריט' fieldName="name" item={item} isAdmin={isAdmin} decision={decisions['name']} onDecision={handleDecisionChange} renderValue={name => <h1>{name}</h1>} />
                <DiffField label='מק"ט' fieldName="cat" item={item} isAdmin={isAdmin} decision={decisions['cat']} onDecision={handleDecisionChange} renderValue={cat => <p>{`מק"ט: ${cat}`}</p>}/>
                {item.catType === "מכשיר" && <p>{`מק"ט ערכה: ${item.kitCats?.[0] ?? ''}`}</p>}
                {[ Role.Admin, Role.Technician].includes(frontEndPrivilege as Role) && item.catType === "מכשיר" && <p>{`תוקף הסמכה בחודשים: ${item.certificationPeriodMonths ?? ''}`}</p>}
                {item.catType === "מתכלה" && <p>{`אורך חיים בחודשים: ${item.lifeSpan ?? ''}`}</p>}
                {item.catType === "מכשיר" && <p>{`חירום: ${item.emergency ? "כן" : "לא"}`}</p>}
                {item.catType === "מכשיר" && <p>{`שיטת אחזקה: ${item.maintenanceMethod ?? ''}`}</p>}
                {item.catType === "מכשיר" && item.maintenanceMethod === MaintenanceMethod.PeriodicTestAndCalibration && <p>{`תדירות אחזקה בחודשים: ${item.maintenanceIntervalMonths ?? ''}`}</p>}
                {[ Role.Admin, Role.Technician].includes(frontEndPrivilege as Role) && <p>{`מלאי קו אדום: ${item.minimumStock ?? ''}`}</p>}
                <p>{'ספק בארץ: '}
                {actualSupplier.supplier && 
                <>
                    <Link
                        to={`/suppliers/${actualSupplier?.supplier?._id}`} 
                        onClick={() => navigate(`/suppliers/${actualSupplier?.supplier?._id}`)}>{actualSupplier?.supplier?.name}
                    </Link>
                    {actualSupplier.isParent && <span className={classes.parentSupplierBadge}>עפ"י מכשיר מקושר</span>}
                    </>
                }
                </p>
                {item.price !== null && item.price !== undefined && <p>{`מחיר: ${item.price} ש"ח`}</p>}
                {item.description && <p>{item.description}</p>}
                {item.imageLink && <img src={item.imageLink} alt={item.name} />}
                {
                    [ 
                        { link: item.userManualLink, name: "מדריך למשתמש" },
                        { link: item.hebrewManualLink, name: "הוראות הפעלה בעברית" },
                        { link: item.medicalEngineeringManualLink, name: "הוראות הנר" },
                        { link: item.qaStandardLink, name: "תקן בחינה", privilegeRequired: [ Role.Admin ] },
                        { link: item.serviceManualLink, name: "Service Manual", privilegeRequired: [ Role.Admin ] },
                        { link: item.schemasLink, name: "סכמות/שרטוטים", privilegeRequired: [ Role.Admin, Role.Technician ] },
                    ]
                        .map(({ link, name, privilegeRequired }) =>
                            (!privilegeRequired || privilegeRequired.includes(frontEndPrivilege as Role)) && link && <a href={link}>לחץ להגעה ל{name}</a>)
                }
                
                {/* {item.models && item.models.length > 0 && <InfoSection title="דגמים" elements={item.models} unclickable={true} />*/}
                {(item.models || (item as any).pendingChanges?.models) && (
                    <InfoSection 
                        title="דגמים" 
                        fieldName="models" 
                        item={item} 
                        isAdmin={isAdmin} 
                        decision={decisions['models']} 
                        onDecision={handleDecisionChange} 
                    />
                )}                
                {/* {item.belongsToDevices && item.belongsToDevices.length > 0 && <InfoSection title="שייך למכשיר" elements={item.belongsToDevices} />} */}
                {/* {item.accessories && item.accessories.length > 0 && <InfoSection title="אביזרים" elements={item.accessories} />} */}
                {(item.accessories || (item as any).pendingChanges?.accessories) && (
                    <InfoSection 
                        title="אביזרים" 
                        fieldName="accessories" 
                        item={item} 
                        isAdmin={isAdmin} 
                        decision={decisions['accessories']} 
                        onDecision={handleDecisionChange} 
                    />
                )}
                {/* {item.consumables && item.consumables.length > 0 && <InfoSection title="מתכלים" elements={item.consumables} />}
                {item.spareParts && item.spareParts.length > 0 && <InfoSection title="חלקי חילוף" elements={item.spareParts} />} */}

                {isAdmin && allDecisionsMade && (
                <div className={classes.stickySubmit}>
                    <BigButton 
                        text={isSubmitting ? "מעבד..." : "אשר את כל הפעולות שנבחרו"}
                        action={submitAllReviews}
                        disabled={isSubmitting}
                        overrideStyle={{ backgroundColor: "#2c3e50" }}
                    />
                </div>
            )}
                
                
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

export default withAuthenticationRequired(ItemPage);

