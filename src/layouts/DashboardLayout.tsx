import { useState, useEffect, ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Users, Calendar, Settings, 
  LogOut, Menu, X, ChevronDown, Bell, Search,
  LayoutDashboard, ClipboardList, FileEdit, Users2
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { usePatientStore } from '../stores/patientStore';
import { useScheduleStore } from '../stores/scheduleStore';
import { useNotificationStore } from '../stores/notificationStore';
import NotificationCenter from '../components/ui/NotificationCenter';
import { cn } from '../lib/utils';

interface GlobalSearchResult {
  id: string;
  type: 'patient' | 'appointment' | 'examination';
  title: string;
  subtitle: string;
  icon: typeof Users;
  url: string;
}

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const { patients, getPatients } = usePatientStore();
  const { appointments, getAppointmentsByDate } = useScheduleStore();
  const { fetchNotifications } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users2 },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];
  
  // Load data for search
  useEffect(() => {
    getPatients();
    getAppointmentsByDate(new Date().toISOString().split('T')[0]);
    fetchNotifications();
  }, [getPatients, getAppointmentsByDate, fetchNotifications]);
  
  // Handle scrolling effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setSearchQuery('');
    setShowSearchResults(false);
  }, [location.pathname]);
  
  // Global search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    setShowSearchResults(true);
    
    const query = searchQuery.toLowerCase();
    const results: GlobalSearchResult[] = [];
    
    // Search patients
    const matchedPatients = patients.filter(
      patient => 
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query) ||
        patient.phone.includes(query) ||
        (patient.email && patient.email.toLowerCase().includes(query))
    ).slice(0, 5);
    
    results.push(
      ...matchedPatients.map(patient => ({
        id: patient.id,
        type: 'patient' as const,
        title: `${patient.firstName} ${patient.lastName}`,
        subtitle: `Patient ID: ${patient.id}`,
        icon: Users,
        url: `/patients/${patient.id}`
      }))
    );
    
    // Search appointments (today's appointments only for simplicity)
    const matchedAppointments = appointments.filter(
      appointment => {
        const matchedPatient = patients.find(p => p.id === appointment.patientId);
        if (!matchedPatient) return false;
        
        return `${matchedPatient.firstName} ${matchedPatient.lastName}`.toLowerCase().includes(query) ||
               appointment.id.toLowerCase().includes(query) ||
               (appointment.notes && appointment.notes.toLowerCase().includes(query));
      }
    ).slice(0, 3);
    
    results.push(
      ...matchedAppointments.map(appointment => {
        const patient = patients.find(p => p.id === appointment.patientId);
        return {
          id: appointment.id,
          type: 'appointment' as const,
          title: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
          subtitle: `Appointment on ${appointment.date} at ${appointment.startTime.substring(0, 5)}`,
          icon: Calendar,
          url: `/appointments/${appointment.id}`
        };
      })
    );
    
    setSearchResults(results);
    
  }, [searchQuery, patients, appointments]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };
  
  // Handle clicking outside search results to close them
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#global-search') && !target.closest('#search-results')) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  // Sidebar link component
  const NavLink = ({ item }: { item: { name: string, href: string, icon: any } }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    
    return (
      <button
        className={cn(
          "w-full flex items-center py-2.5 px-3 mb-1 text-sm font-medium rounded-md transition-colors relative group",
          isActive
            ? "text-primary-800 bg-primary-50"
            : "text-gray-700 hover:text-primary-800 hover:bg-gray-100"
        )}
        onClick={() => navigate(item.href)}
      >
        <Icon className={cn(
          "w-5 h-5 mr-3",
          isActive ? "text-primary-700" : "text-gray-500 group-hover:text-primary-700"
        )} />
        {item.name}
        {isActive && (
          <motion.div 
            className="absolute inset-y-0 left-0 w-1 bg-primary-700 rounded-r-full" 
            layoutId="sidebar-indicator"
          />
        )}
      </button>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-gray-800/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          >
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img src="/Optinote-Logo-Black.png" alt="Optinote" className="h-8 w-auto" />
                </div>
                <button 
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="flex flex-col space-y-1">
                {navigation.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </nav>
            </div>
            
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  {user?.avatar ? (
                    <img
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shadow-sm">
                      <span className="text-primary-800 font-semibold text-lg">
                        {user?.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
              
              <button
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3 text-gray-500" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <img src="/Optinote-Logo-Black.png" alt="Optinote" className="h-8 w-auto" />
          </div>
          <div className="flex-1 px-3">
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.avatar ? (
                  <img
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                    src={user.avatar}
                    alt={user.name}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shadow-sm">
                    <span className="text-primary-800 font-semibold">
                      {user?.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              className="mt-3 flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3 text-gray-500" />
              Sign out
            </button>
          </div>
        </div>
      </div>
      
      <div className="md:pl-64">
        {/* Top navigation */}
        <div className={cn(
          "sticky top-0 z-10 bg-white transition-shadow duration-200",
          scrolled ? "shadow-md" : "shadow-sm"
        )}>
          <div className="flex h-16 items-center px-4">
            <button
              type="button"
              className="md:hidden text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-700"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
            
            <div className="flex justify-between flex-1 px-2 md:px-4">
              <div className="flex flex-1 md:ml-0 relative">
                <div className="w-full max-w-lg" id="global-search">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative text-gray-400 focus-within:text-gray-600">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <input
                      id="search"
                      className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-1 focus:ring-primary-700 focus:border-primary-700 sm:text-sm transition-colors"
                      placeholder="Search patients, appointments..."
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={handleSearchFocus}
                    />
                    
                    {/* Search results dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div 
                        id="search-results"
                        className="absolute z-10 mt-1 w-full max-h-96 overflow-y-auto bg-white shadow-lg rounded-md border border-gray-200 py-1"
                      >
                        <div className="px-3 py-2 border-b border-gray-100">
                          <h3 className="text-xs font-semibold text-gray-500">
                            SEARCH RESULTS
                          </h3>
                        </div>
                        {searchResults.map((result) => {
                          const Icon = result.icon;
                          return (
                            <button
                              key={`${result.type}-${result.id}`}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50"
                              onClick={() => {
                                navigate(result.url);
                                setSearchQuery('');
                                setShowSearchResults(false);
                              }}
                            >
                              <div className="flex items-start">
                                <div className={`mt-0.5 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center
                                  ${result.type === 'patient' ? 'bg-primary-100 text-primary-700' : 
                                    result.type === 'appointment' ? 'bg-accent-100 text-accent-600' : 
                                    'bg-secondary-100 text-secondary-600'}`}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {result.title}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {result.subtitle}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                        
                        {searchQuery.length >= 3 && (
                          <div className="px-3 py-2 border-t border-gray-100">
                            <button
                              className="w-full text-left text-xs text-primary-700 hover:text-primary-800"
                              onClick={() => {
                                navigate(`/patients?q=${encodeURIComponent(searchQuery)}`);
                                setSearchQuery('');
                                setShowSearchResults(false);
                              }}
                            >
                              View all search results
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {showSearchResults && searchQuery.trim() && searchResults.length === 0 && (
                      <div 
                        id="search-results"
                        className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-6 text-center"
                      >
                        <p className="text-sm text-gray-500">No results found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try searching for a patient name, ID, or appointment
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="ml-4 flex items-center md:ml-6">
                {/* Notifications dropdown */}
                <NotificationCenter />
                
                {/* Profile dropdown */}
                <div className="relative ml-4">
                  <div>
                    <button
                      type="button"
                      className="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    >
                      <span className="sr-only">Open user menu</span>
                      {user?.avatar ? (
                        <img
                          className="h-9 w-9 rounded-full object-cover border border-gray-200"
                          src={user.avatar}
                          alt=""
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-800 font-semibold">
                            {user?.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 z-10 mt-3 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      >
                        <div className="py-1">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                          </div>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate('/profile');
                              setIsProfileMenuOpen(false);
                            }}
                          >
                            Your Profile
                          </a>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate('/settings');
                              setIsProfileMenuOpen(false);
                            }}
                          >
                            Settings
                          </a>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={handleLogout}
                          >
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;