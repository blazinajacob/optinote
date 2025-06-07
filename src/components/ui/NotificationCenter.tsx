import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Check, 
  Trash2, 
  Calendar, 
  User, 
  Pill, 
  Info, 
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore, NotificationCategory, Notification } from '../../stores/notificationStore';
import { cn } from '../../lib/utils';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter = ({ className }: NotificationCenterProps) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications,
    markAsRead, 
    markAllAsRead,
    deleteNotification
  } = useNotificationStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all');
  
  // Refs for click-outside detection
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  // Handle click outside to close notification panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        notificationRef.current && 
        notificationButtonRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // When opening and there are unread notifications, mark them as read
      markAllAsRead();
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
    
    setIsOpen(false);
  };
  
  // Filter notifications based on selected category
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.category === filter);
  
  // Get icon for notification based on category
  const getNotificationIcon = (category: NotificationCategory) => {
    switch(category) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'patient':
        return <User className="h-4 w-4" />;
      case 'prescription':
        return <Pill className="h-4 w-4" />;
      case 'system':
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  // Get background color for notification based on priority and read status
  const getNotificationBgColor = (notification: Notification) => {
    if (notification.read) return 'bg-white hover:bg-gray-50';
    
    switch(notification.priority) {
      case 'high':
        return 'bg-error-50 hover:bg-error-100';
      case 'medium':
        return 'bg-primary-50 hover:bg-primary-100';
      case 'low':
      default:
        return 'bg-gray-50 hover:bg-gray-100';
    }
  };
  
  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        ref={notificationButtonRef}
        className="relative p-1.5 text-gray-500 bg-white rounded-full hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        onClick={toggleOpen}
      >
        <span className="sr-only">View notifications</span>
        <Bell className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            ref={notificationRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-20 mt-3 w-80 sm:w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                  >
                    <Check className="h-3 w-3 inline mr-1" />
                    Mark all as read
                  </button>
                )}
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Filter tabs */}
            <div className="flex border-b border-gray-100">
              {['all', 'appointment', 'patient', 'prescription', 'system'].map((category) => (
                <button
                  key={category}
                  className={cn(
                    "flex-1 py-2 text-xs font-medium text-center transition-colors",
                    filter === category 
                      ? "text-primary-600 border-b-2 border-primary-500" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setFilter(category as NotificationCategory | 'all')}
                >
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="py-2 max-h-96 overflow-y-auto">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "relative px-4 py-3 transition-colors cursor-pointer",
                      getNotificationBgColor(notification)
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 rounded-full p-1.5 ${
                        notification.category === 'appointment' ? 'bg-accent-100 text-accent-600' :
                        notification.category === 'patient' ? 'bg-primary-100 text-primary-600' :
                        notification.category === 'prescription' ? 'bg-success-100 text-success-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getNotificationIcon(notification.category)}
                      </div>
                      
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 pr-8">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                      
                      {/* Action buttons that appear on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {!notification.read && (
                      <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary-500"></span>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <CheckCircle className="mx-auto h-10 w-10 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filter === 'all' 
                      ? 'You have no notifications at this time.'
                      : `You have no ${filter} notifications at this time.`}
                  </p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 text-center">
                <button 
                  className="text-sm font-medium text-primary-600 hover:text-primary-800"
                  onClick={() => navigate('/notifications')}
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;