import { create } from 'zustand';

export type NotificationCategory = 'appointment' | 'patient' | 'prescription' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  category: NotificationCategory;
  priority: NotificationPriority;
  link?: string;
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
}

// Generate a random ID for notifications
const generateId = () => `not-${Math.floor(Math.random() * 1000000)}`;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real app, this would fetch from an API or database
      // For this demo, we'll use mock data
      const mockNotifications: Notification[] = [
        {
          id: 'not-1',
          title: 'Patient Check-in',
          message: 'John Doe has checked in for their 10:00 AM appointment',
          createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          read: false,
          category: 'appointment',
          priority: 'medium',
          link: '/appointments/APT-123456'
        },
        {
          id: 'not-2',
          title: 'Refill Request',
          message: 'Jane Smith has requested a prescription refill',
          createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          read: false,
          category: 'prescription',
          priority: 'high',
          link: '/patients/PT-234567'
        },
        {
          id: 'not-3',
          title: 'New Test Results',
          message: 'OCT scan results are available for Robert Johnson',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false,
          category: 'patient',
          priority: 'medium',
          link: '/patients/PT-345678'
        },
        {
          id: 'not-4',
          title: 'System Update',
          message: 'The system will undergo maintenance tonight at 2 AM EST',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          read: true,
          category: 'system',
          priority: 'low'
        },
        {
          id: 'not-5',
          title: 'Appointment Reminder',
          message: 'You have 5 appointments scheduled for tomorrow',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          read: true,
          category: 'appointment',
          priority: 'medium',
          link: '/schedule'
        }
      ];
      
      set({ 
        notifications: mockNotifications, 
        unreadCount: mockNotifications.filter(n => !n.read).length,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch notifications', isLoading: false });
    }
  },
  
  markAsRead: (id: string) => {
    set(state => {
      const updatedNotifications = state.notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      );
      
      return { 
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      };
    });
  },
  
  markAllAsRead: () => {
    set(state => {
      const updatedNotifications = state.notifications.map(notification => 
        ({ ...notification, read: true })
      );
      
      return { 
        notifications: updatedNotifications,
        unreadCount: 0
      };
    });
  },
  
  deleteNotification: (id: string) => {
    set(state => {
      const updatedNotifications = state.notifications.filter(notification => 
        notification.id !== id
      );
      
      return { 
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      };
    });
  },
  
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date(),
      read: false
    };
    
    set(state => ({ 
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  }
}));