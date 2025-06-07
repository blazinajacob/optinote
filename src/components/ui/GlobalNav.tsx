import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users2, CalendarDays, Settings, 
  FileText, ListChecks, Clock, Eye, Microscope, 
  BookOpen, Clipboard, Stethoscope, MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: ('doctor' | 'technician' | 'admin')[];
}

const GlobalNav = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const navigation: NavItem[] = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Patients', 
      href: '/patients', 
      icon: Users2 
    },
    { 
      name: 'Schedule', 
      href: '/schedule', 
      icon: CalendarDays 
    },
    { 
      name: 'Check-In', 
      href: '/check-in', 
      icon: Clipboard,
      roles: ['technician', 'doctor'] 
    },
    { 
      name: 'Pre-Testing', 
      href: '/pre-testing', 
      icon: Eye,
      roles: ['technician', 'doctor'] 
    },
    { 
      name: 'Testing Queue', 
      href: '/testing-queue', 
      icon: Clock,
      roles: ['technician', 'doctor'] 
    },
    { 
      name: 'Examinations', 
      href: '/examinations', 
      icon: Stethoscope,
      roles: ['doctor'] 
    },
    { 
      name: 'SOAP Notes', 
      href: '/soap-notes', 
      icon: FileText,
      roles: ['doctor'] 
    },
    { 
      name: 'Chart Notes', 
      href: '/chart-notes', 
      icon: BookOpen 
    },
    { 
      name: 'Test Results', 
      href: '/test-results', 
      icon: Microscope 
    },
    { 
      name: 'To-Do List', 
      href: '/todo', 
      icon: ListChecks 
    },
    { 
      name: 'Messages', 
      href: '/messages', 
      icon: MessageSquare 
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings 
    }
  ];
  
  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role as any);
  });
  
  if (!mounted) return null;
  
  return (
    <nav className="flex-1 space-y-1">
      {filteredNavigation.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        
        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={cn(
              "w-full flex items-center py-2.5 px-3 mb-1 text-sm font-medium rounded-md transition-colors relative group",
              isActive
                ? "text-primary-700 bg-primary-50"
                : "text-gray-700 hover:text-primary-700 hover:bg-gray-100"
            )}
          >
            <Icon className={cn(
              "w-5 h-5 mr-3",
              isActive ? "text-primary-600" : "text-gray-500 group-hover:text-primary-600"
            )} />
            {item.name}
            {isActive && (
              <motion.div 
                className="absolute inset-y-0 left-0 w-1 bg-primary-600 rounded-r-full" 
                layoutId="sidebar-indicator"
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default GlobalNav;