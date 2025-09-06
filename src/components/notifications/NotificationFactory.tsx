import { Notification, NotificationType } from '../../types/notification_types';
import GenericNotification from './GenericNotification';
import NewUserConfirmed from './NewUserConfirmed';
import NewUserDeleted from './NewUserDeleted';
import NewUserWaitingForConfirmation from './NewUserWaitingForConfirmation';

const createNotification = (notification : Notification, onAction?: (message: string) => void) => {
    switch (notification.type) {
        case NotificationType.NewUserWaitingForConfirmation:
            return <NewUserWaitingForConfirmation notification={notification} onAction={onAction}/>
        case NotificationType.NewUserDeleted:
            return <NewUserDeleted notification={notification} />
        case NotificationType.NewUserConfirmed:
            return <NewUserConfirmed notification={notification} />            
        default:
            return <GenericNotification notification={notification}/>
            //throw new Error(`Notification type not supported: ${notification.type}`);
    }
}

export default createNotification;