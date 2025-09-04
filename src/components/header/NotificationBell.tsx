import { useEffect, useRef, useState } from "react";
import classes from './NotificationBell.module.css'
import { IoNotifications } from "react-icons/io5";
import { fetchBackend } from "../../backend-variables/address";
import { useAppSelector } from "../../hooks/redux-hooks";
import { Notification } from '../../types/notification_types';
import createNotification from "../notifications/NotificationFactory";

const NotificationBell = () => {

    const { jwt: authToken }  = useAppSelector(state => state.auth);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const hasUnreadNotifications = notifications.some(n => !n.read);

    const getNotifications = async () => {
        const fetchedNotifications = await fetchBackend('notifications', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'auth-token': authToken
            }
        });
        setNotifications(await fetchedNotifications.json());
    }

    useEffect(() => {
        if (authToken && showNotifications) {
            getNotifications();
        }
    }, [ authToken, showNotifications ])

    const bellRef = useRef<HTMLSpanElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showNotifications) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                (dropdownRef.current && dropdownRef.current.contains(target)) ||
                (bellRef.current && bellRef.current.contains(target))
            ) {
                // Click is inside dropdown or bell, do nothing
                return;
            }
            setShowNotifications(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showNotifications]);    

    const markNotificationAsRead = async (notificationId: string) => {
        await fetchBackend(`notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'auth-token': authToken
            }
        });
        setNotifications(notifications.map(notification => notification._id === notificationId ? { ...notification, read: true} : notification)) 
    }

    const deleteNotification = async (notificationId: string) => {
        await fetchBackend(`notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'auth-token': authToken
            }
        });
        setNotifications(notifications.filter(notification => notification._id !== notificationId) );
    }
    

    return (
        <span
            ref={bellRef}
            className={classes.notificationBell}
            title={notifications.length ? "יש התראות חדשות" : "אין התראות חדשות"}
        >
            <IoNotifications color="#ffffff" size={20} onClick={() => setShowNotifications(!showNotifications)} />
            {hasUnreadNotifications && (
            <span
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 8,
                    height: 8,
                    background: "red",
                    borderRadius: "50%",
                    zIndex: 2,
                }}
            />
        )}
            {showNotifications && (
                <div ref={dropdownRef} className={classes.notificationDropdown} /*onBlur={() => setShowNotifications(false)}*/>
                    {notifications.length === 0 ? (
                        <div className={classes.notificationEmpty}>אין התראות חדשות</div>
                    ) : (
                        notifications.map((n, idx) => {
                            const notification = createNotification(n, () => getNotifications());
                            return (
                            <div 
                                key={idx} 
                                className={classes.notificationItem}
                                onClick={() => markNotificationAsRead(n._id)}
                            >
                                <button
                                    className={classes.notificationDeleteBtn}
                                    onClick={() => deleteNotification(n._id)}
                                    title="מחק התראה"
                                >
                                    ×
                                </button>                                
                                {/* <div className={classes.notificationSubject}>{n.subject}</div>
                                <div className={classes.notificationMessage}>{n.message}</div> */}
                                {notification}
                                {!n.read && (
                                <span
                                    style={{
                                        position: "absolute",
                                        right: 6,
                                        top: "52%", 
                                        width: 8,
                                        height: 8,
                                        background: "red",
                                        borderRadius: "50%",
                                    }}
                                />
                            )}                                
                            </div>
                        )
                    })
                    )}
                </div>
            )}            
        </span>
    );
};

export default NotificationBell;