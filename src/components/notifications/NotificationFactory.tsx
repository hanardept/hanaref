import { Notification, NotificationType } from '../../types/notification_types';
import GenericNotification from './GenericNotification';
import NewUserWaitingForConfirmation from './NewUserWaitingForConfirmation';

const createNotification = (notification : Notification) => {
    switch (notification.type) {
        case NotificationType.NewUserWaitingForConfirmation:
            return <NewUserWaitingForConfirmation notification={notification} />
        default:
            return <GenericNotification notification={notification}/>
            //throw new Error(`Notification type not supported: ${notification.type}`);
    }
}

export default createNotification;