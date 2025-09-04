import { Link, useNavigate } from 'react-router-dom';
import { Notification } from '../../types/notification_types';
import classes from './Notifications.module.css';
import { fetchBackend } from '../../backend-variables/address';
import { useAppSelector } from '../../hooks/redux-hooks';

const NewUserWaitingForConfirmation = ({ notification }: { notification: Notification }) => { 

    const navigate = useNavigate();
    const authToken = useAppSelector(state => state.auth.jwt);
    
    const { subject, message, data } = notification;

    console.log(`original message: ${message}`);
    console.log(`replaced message: ${message.replace('{user.email}', `<a href=mailto:${data.user.email}>{data.user.email}</a>`)}`);

    const body1 = message.substring(0, message.indexOf('{user.email}'));
    const body2 = message.substring(message.indexOf('{user.email}') + '{user.email}'.length);
    return (
        <>
            <div className={classes.notificationSubject}>{subject}</div>
            <div className={classes.notificationMessage}>
                <span>{body1}</span>
                <Link
                    to={`/users/${data.user._id}`} 
                    onClick={() => navigate(`/users/${data.user._id}`)}
                >
                    {data.user.email}
                </Link>
                <span>{body2}</span>
            </div>
            <button onClick={async () => {
                await fetchBackend(`users/${data.user._id}/confirm`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'auth-token': authToken,
                        },
                    });                
            }}>אשר</button>
        </>
    );
};

export default NewUserWaitingForConfirmation;

