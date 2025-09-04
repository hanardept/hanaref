export enum NotificationType {
    NewUserWaitingForConfirmation = 'new_user_waiting_for_confirmation',
    NewUserDeleted = 'new_user_deleted',
}



export type Notification = {
    _id: string;
    type: NotificationType;
    data: any;
    subject: string;
    message: string;
    read: boolean;
    createdAt: string;
};