import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import classes from './UserPage.module.css';
import { viewingActions } from "../../store/viewing-slice";
import LoadingSpinner from "../UI/LoadingSpinner";
import { backendFirebaseUri } from "../../backend-variables/address";
import { roleNames, User } from "../../types/user_types";
import BigButton from "../UI/BigButton";

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

const confirmUser = async (userId: string, authToken: string) => {
    // The backend route is POST /api/users/:id/confirm
    const response = await fetch(`${backendFirebaseUri}/users/${userId}/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': authToken,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to confirm user: ${errorText}`);
    }
    return response.json();    
}


const UserPage = () => {
    const params = useParams();
    const authToken = useAppSelector(state => state.auth.jwt);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const frontEndPrivilege = useAppSelector(state => state.auth.frontEndPrivilege);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);

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

        return () => {
            setUser(null);
        }

    }, [params.userid, authToken, navigate, dispatch, frontEndPrivilege]);

    const handleArchiveToggle = async () => {
        if (!user) return;

        const isArchived = user.archived ?? false;
        const actionText = isArchived ? "לשחזר" : "לארכב";
        if (!window.confirm(`האם אתה בטוח שברצונך ${actionText} את המשתמש "${user.firstName} ${user.lastName}"?`)) {
            return;
        }

        setIsUpdatingUser(true);
        try {
            const updatedUser = await toggleUserArchiveStatus(user._id, authToken);
            setUser(updatedUser); // Update the local state with the new item status
            // Use the state of the item *before* the toggle for the confirmation message
            alert(`המשתמש ${isArchived ? 'שוחזר' : 'אורכב'} בהצלחה`);
        } catch (error) {
            console.error(error);
            alert('הפעולה נכשלה. נסה שוב.');
        } finally {
            setIsUpdatingUser(false);
        }
    }; 
    
    const handleConfirmUser = async () => {
        if (!user) return;

        if (!window.confirm("האם אתה בטוח שברצונך לאשר את המשתמש?")) {
            return;
        }

        setIsUpdatingUser(true);
        try {
            const updatedUser = await confirmUser(user._id, authToken);
            setUser(updatedUser); // Update the local state with the new item status
            // Use the state of the item *before* the toggle for the confirmation message
            alert('המשתמש אושר בהצלחה');
        } catch (error) {
            console.error(error);
            alert('הפעולה נכשלה. נסה שוב.');
        } finally {
            setIsUpdatingUser(false);
        }
    }; 

    return (
        <>
            {loading && <LoadingSpinner />}
            {!loading && user && <div className={classes.userPage}>
                <h1>{user.firstName} {user.lastName}</h1>
                <p>{`ת.ז.: ${user.id}`}</p>
                <p>{`שם פרטי: ${user.firstName}`}</p>
                <p>{`שם משפחה: ${user.lastName}`}</p>
                <p>{`שם משתמש: ${user.username}`}</p>
                <p>{`דואר אלקטרוני: ${user.email}`}</p>
                <p>{`תפקיד: ${roleNames[user.role]}`}</p>
                <p>{`שיוך: ${user.association ?? ''}`}</p>
                {user.status !== "active" && <BigButton
                    text="אשר משתמש"
                    action={handleConfirmUser}
                    disabled={isUpdatingUser}
                    overrideStyle={{ marginTop: "2rem", backgroundColor: "#3498db" }}
                />}
                <BigButton
                    text={isUpdatingUser ? 'מעבד...' : ((user.archived ?? false) ? 'שחזר מארכיון' : 'שלח לארכיון')}
                    action={handleArchiveToggle}
                    disabled={isUpdatingUser}
                    overrideStyle={{ marginTop: "2rem", backgroundColor: (user.archived ?? false) ? "#3498db" : "#e67e22" }}
                />
            </div>}
        </>
    );
};

export default UserPage;

