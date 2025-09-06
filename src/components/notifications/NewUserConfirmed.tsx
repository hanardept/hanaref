import { Link, useNavigate } from 'react-router-dom';
import { Notification } from '../../types/notification_types';
import classes from './Notifications.module.css';

const NewUserConfirmed = ({ notification }: { notification: Notification }) => { 
    
    const { subject, message, data } = notification;

    const navigate = useNavigate();

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
        </>
    );
};

export default NewUserConfirmed;

