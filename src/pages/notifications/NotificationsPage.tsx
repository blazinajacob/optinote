import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Trash2, CheckCircle, Filter, X,
  Calendar, User, Pill, Info, Clock, Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore, Notification, NotificationCategory } from '../../stores/notificationStore';
import { cn } from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    isLoading
  } = useNotificationStore();
  
  const [selectedFilter, setSelectedFilter] = useState<NotificationCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter !== 'all' && notification.category !== selectedFilter) {
      return false;
    }
    
    if (selectedPriority !== 'all' && notification.priority !== selectedPriority) {
      return false;
    }
    
    return true;
  });
  
  // Get notification icon based on category
  const getNotificationIcon = (category: NotificationCategory) => {
    switch(category) {
      case 'appointment':
        return <Calendar className="h-5 w-5" />;
      case 'patient':
        return <User className="h-5 w-5" />;
      case 'prescription':
        return <Pill className="h-5 w-5" />;
      case 'system':
        return <Info className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  // Get notification background color
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
  
  // Get the count of notifications by category
  const getCategoryCount = (category: NotificationCategory | 'all') => {
    if (category === 'all') return notifications.length;
    return notifications.filter(n => n.category === category).length;
  };
  
  // Get the count of notifications by priority
  const getPriorityCount = (priority: 'high' | 'medium' | 'low' | 'all') => {
    if (priority === 'all') return notifications.length;
    return notifications.filter(n => n.priority === priority).length;
  };
  
  const handleClearFilters = () => {
    setSelectedFilter('all');
    setSelectedPriority('all');
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <PageHeader
        title="Notifications"
        subtitle="View and manage your notifications"
        actions={
          <div className="flex space-x-2">
            <button
              type="button"
              className="btn-outline"
              onClick={() => markAllAsRead()}
              disabled={!notifications.some(n => !n.read)}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All as Read
            </button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Filters */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-gray-500" />
                Filters
              </h3>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                <div className="space-y-2">
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                      selectedFilter === 'all' 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedFilter('all')}
                  >
                    <span>All</span>
                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                      {getCategoryCount('all')}
                    </span>
                  </button>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                      selectedFilter === 'appointment' 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedFilter('appointment')}
                  >
                    <span>Appointments</span>
                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                      {getCategoryCount('appointment')}
                    </span>
                  </button>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                      selectedFilter === 'patient' 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedFilter('patient')}
                  >
                    <span>Patients</span>
                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                      {getCategoryCount('patient')}
                    </span>
                  </button>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                      selectedFilter === 'prescription' 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedFilter('prescription')}
                  >
                    <span>Prescriptions</span>
                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                      {getCategoryCount('prescription')}
                    </span>
                  </button>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                      selectedFilter === 'system' 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedFilter('system')}
                  >
                    <span>System</span>
                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                      {getCategoryCount('system')}
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                <div className="space-y-2">
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                      selectedPriority === 'all' 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedPriority('all')}
                  >
                    <span>All</span>
                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                      {getPriorityCount('all')}
                    </span>
                  </button>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                      selectedPriority === 'high' 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedPriority('high')}
                  >
                    <span>High</span>
                    <span className="bg-error-100 text-error-600 px-1.5 py-0.5 rounded-full text-xs">
                      {getPriorityCount('high')}
                    </span>
                  </button>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                      selectedPriority === 'medium' 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedPriority('medium')}
                  >
                    <span>Medium</span>
                    <span className="bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full text-xs">
                      {getPriorityCount('medium')}
                    </span>
                  </button>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md",
                      selectedPriority === 'low' 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedPriority('low')}
                  >
                    <span>Low</span>
                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                      {getPriorityCount('low')}
                    </span>
                  </button>
                </div>
              </div>
              
              {(selectedFilter !== 'all' || selectedPriority !== 'all') && (
                <button
                  className="text-sm text-primary-600 hover:text-primary-800"
                  onClick={handleClearFilters}
                >
                  <X className="h-3 w-3 inline mr-1" />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                <p className="mt-2 text-gray-500">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "relative p-4 transition-colors",
                      getNotificationBgColor(notification),
                      notification.link ? "cursor-pointer" : ""
                    )}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      
                      if (notification.link) {
                        navigate(notification.link);
                      }
                    }}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 rounded-full p-2 ${
                        notification.category === 'appointment' ? 'bg-accent-100 text-accent-600' :
                        notification.category === 'patient' ? 'bg-primary-100 text-primary-600' :
                        notification.category === 'prescription' ? 'bg-success-100 text-success-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getNotificationIcon(notification.category)}
                      </div>
                      
                      <div className="ml-3 flex-1 pr-10">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        {!notification.read && (
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {!notification.read && (
                      <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary-500"></span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedFilter !== 'all' || selectedPriority !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You have no notifications at this time'}
                </p>
                {(selectedFilter !== 'all' || selectedPriority !== 'all') && (
                  <button
                    className="mt-4 btn-outline text-sm"
                    onClick={handleClearFilters}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;