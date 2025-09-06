import { Link, useNavigate } from 'react-router-dom';
import { Notification } from '../../types/notification_types';
import classes from './Notifications.module.css';
import { fetchBackend } from '../../backend-variables/address';
import { useAppSelector } from '../../hooks/redux-hooks';

const NewUserWaitingForConfirmation = ({ notification, onAction }: { notification: Notification, onAction?: (message: string) => void }) => { 

    const navigate = useNavigate();
    const authToken = useAppSelector(state => state.auth.jwt);
    
    const { subject, message, data } = notification;

    const body1 = message.substring(0, message.indexOf('{userDisplayName}'));
    const body2 = message.substring(message.indexOf('{userDisplayName}') + '{userDisplayName}'.length);
    return (
        <>
            <div className={classes.notificationSubject}>{subject}</div>
            <div className={classes.notificationMessage}>
                <span>{body1}</span>
                <Link
                    to={`/users/${data.user._id}`} 
                    onClick={() => navigate(`/users/${data.user._id}`)}
                >
                    {data.user.displayName}
                </Link>
                <span>{body2}</span>
            </div>
            <span style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '10px' }}>
            <button onClick={async () => {
                await fetchBackend(`users/${data.user._id}/confirm`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'auth-token': authToken,
                        },
                    });
                onAction?.("המשתמש אושר");
            }}>אשר</button>
            <button onClick={async () => {
                await fetchBackend(`users/${data.user._id}/reject`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': authToken,
                    },
                });  
                onAction?.("המשתמש נדחה");             
            }}>דחה</button>
            </span>
        </>
    );
};

export default NewUserWaitingForConfirmation;

