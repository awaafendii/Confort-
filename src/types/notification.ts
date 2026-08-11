export type NotificationType = 'RIDE' | 'PAYMENT' | 'PROMOTION' | 'SECURITY' | 'SYSTEM';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  senderRole: 'PASSENGER' | 'DRIVER';
  text: string;
  createdAt: string;
}
