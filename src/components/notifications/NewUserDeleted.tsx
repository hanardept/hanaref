import { Notification } from '../../types/notification_types';
import classes from './Notifications.module.css';

const NewUserDeleted = ({ notification }: { notification: Notification }) => { 
    
    const { subject, message, data } = notification;

    const formattedMessage = message.replace('{userDisplayName}', data.user.displayName);
    return (
        <>
            <div className={classes.notificationSubject}>{subject}</div>
            <div className={classes.notificationMessage}>{formattedMessage}</div>
        </>
    );
};

export default NewUserDeleted;

