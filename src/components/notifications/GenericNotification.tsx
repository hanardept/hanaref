import { Notification } from '../../types/notification_types';
import classes from './Notifications.module.css';

const GenericNotification = ({ notification }: { notification: Notification }) => { 

    const { subject, message } = notification;
    return (
        <>
            <div className={classes.notificationSubject}>{subject}</div>
            <div className={classes.notificationMessage}>{message}</div>
        </>
    );
};

export default GenericNotification;

