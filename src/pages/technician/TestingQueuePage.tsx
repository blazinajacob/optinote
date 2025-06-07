import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, CheckCircle, AlertCircle, Clock, 
  Calendar, User, FileText, ArrowUpRight, RefreshCw,
  Eye, List, LayoutList, Microscope
} from 'lucide-react';
import { useScheduleStore } from '../../stores/scheduleStore';
import { usePatientStore } from '../../stores/patientStore';
import { useAuthStore } from '../../stores/authStore';
import { formatDate, formatTime } from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

interface TestType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
}

const TestingQueuePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { patients, getPatients } = usePatientStore();
  const { 
    appointments, 
    selectedDate, 
    getAppointmentsByDate, 
    setSelectedDate,
    updateAppointment,
    isLoading
  } = useScheduleStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  
  // Mock test types
  const testTypes: TestType[] = [
    {
      id: 'oct',
      name: 'OCT Scan',
      description: 'Optical Coherence Tomography',
      icon: <Eye className="h-5 w-5 text-primary-600" />,
      estimatedTime: '5-7 min'
    },
    {
      id: 'fundus',
      name: 'Fundus Photography',
      description: 'Retinal imaging',
      icon: <FileText className="h-5 w-5 text-accent-600" />,
      estimatedTime: '3-5 min'
    },
    {
      id: 'visual-field',
      name: 'Visual Field',
      description: 'Peripheral vision test',
      icon: <Eye className="h-5 w-5 text-success-600" />,
      estimatedTime: '5-10 min'
    },
    {
      id: 'topography',
      name: 'Corneal Topography',
      description: 'Corneal mapping',
      icon: <Microscope className="h-5 w-5 text-warning-600" />,
      estimatedTime: '3-5 min'
    }
  ];
  
  useEffect(() => {
    // Get today's date
    const today = dayjs().format('YYYY-MM-DD');
    setSelectedDate(today);
    
    // Get patients and appointments for today
    getPatients();
    getAppointmentsByDate(today);
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [getPatients, getAppointmentsByDate, setSelectedDate, refreshKey]);
  
  // Manual refresh function
  const handleRefresh = () => {
    getAppointmentsByDate(selectedDate);
  };
  
  // Filter appointments - only show checked-in and in-progress
  const queuedAppointments = appointments
    .filter(appointment => 
      (appointment.status === 'checked-in' || appointment.status === 'in-progress') &&
      (!searchTerm || (() => {
        const patient = patients.find(p => p.id === appointment.patientId);
        if (!patient) return false;
        
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return fullName.includes(searchLower) || 
               patient.id.toLowerCase().includes(searchLower) ||
               appointment.id.toLowerCase().includes(searchLower);
      })())
    )
    .sort((a, b) => {
      // Sort by status (checked-in first, then in-progress)
      if (a.status !== b.status) {
        return a.status === 'checked-in' ? -1 : 1;
      }
      
      // Then by appointment time
      return a.startTime.localeCompare(b.startTime);
    });
  
  // Get time in queue
  const getTimeInQueue = (appointment: any) => {
    const now = dayjs();
    const startTime = dayjs(appointment.date + 'T' + appointment.startTime);
    
    // If appointment hasn't started yet, return "Not started"
    if (now.isBefore(startTime)) {
      return 'Not started';
    }
    
    const minutes = now.diff(startTime, 'minute');
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <PageHeader
        title="Testing Queue"
        subtitle="Manage diagnostic tests and scans"
        actions={
          <div className="flex space-x-3">
            <button
              type="button"
              className="btn-outline"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Selection */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Test Selection</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {testTypes.map((test) => (
                <button
                  key={test.id}
                  className={cn(
                    "w-full text-left p-3 rounded-md border transition-colors",
                    activeTest === test.id 
                      ? "border-primary-300 bg-primary-50" 
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                  onClick={() => setActiveTest(activeTest === test.id ? null : test.id)}
                >
                  <div className="flex items-center">
                    <div className={cn(
                      "flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center",
                      activeTest === test.id ? "bg-primary-100" : "bg-gray-100"
                    )}>
                      {test.icon}
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{test.name}</h4>
                      <div className="flex items-center mt-1">
                        <p className="text-xs text-gray-500">{test.description}</p>
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Clock className="mr-1 h-3 w-3" />
                          {test.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-3 bg-gray-50 rounded-md text-sm">
              <h4 className="font-medium text-gray-900">Today's Stats</h4>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">OCT Scans</p>
                  <p className="font-medium">12 completed</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Visual Fields</p>
                  <p className="font-medium">7 completed</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fundus Photos</p>
                  <p className="font-medium">15 completed</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Topography</p>
                  <p className="font-medium">5 completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Patient Queue */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Patient Queue</h3>
              
              <div className="flex space-x-3">
                <SearchInput 
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="w-64"
                />
                
                <div className="flex border border-gray-200 rounded-md overflow-hidden">
                  <button
                    className={cn(
                      "px-3 py-1.5 flex items-center justify-center",
                      viewMode === 'grid' ? "bg-primary-50 text-primary-700" : "bg-white text-gray-500"
                    )}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                  <button
                    className={cn(
                      "px-3 py-1.5 flex items-center justify-center",
                      viewMode === 'list' ? "bg-primary-50 text-primary-700" : "bg-white text-gray-500"
                    )}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                <p className="mt-2 text-gray-500">Loading queue...</p>
              </div>
            ) : queuedAppointments.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Queue is empty</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no patients waiting for tests at this time
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {queuedAppointments.map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  if (!patient) return null;
                  
                  return (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "border rounded-lg p-4 hover:shadow-md transition-shadow",
                        appointment.status === 'checked-in' ? "border-primary-200 bg-primary-50" : "border-gray-200"
                      )}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 font-semibold">
                              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {appointment.type.replace('-', ' ')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            appointment.status === 'checked-in' ? "bg-primary-100 text-primary-800" :
                            appointment.status === 'in-progress' ? "bg-warning-100 text-warning-800" :
                            "bg-gray-100 text-gray-800"
                          )}>
                            {appointment.status.replace('-', ' ')}
                          </span>
                          <div className="mt-1 text-xs text-gray-500 flex items-center justify-end">
                            <Clock className="h-3 w-3 mr-1" />
                            {getTimeInQueue(appointment)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className={cn(
                            "text-xs py-1.5 px-2 rounded font-medium flex items-center justify-center",
                            activeTest ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-800"
                          )}
                          disabled={!activeTest}
                          onClick={() => {
                            if (activeTest && patient) {
                              navigate(`/patients/${patient.id}/pre-testing?appointment=${appointment.id}`);
                            }
                          }}
                        >
                          <Microscope className="h-3 w-3 mr-1" />
                          Start Test
                        </button>
                        <button
                          type="button"
                          className="text-xs py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-medium flex items-center justify-center"
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Patient Chart
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appointment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waiting Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {queuedAppointments.map((appointment) => {
                      const patient = patients.find(p => p.id === appointment.patientId);
                      if (!patient) return null;
                      
                      return (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-700 font-semibold">
                                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {patient.firstName} {patient.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {patient.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatTime(new Date(`2000-01-01T${appointment.startTime}`))}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {appointment.type.replace('-', ' ')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getTimeInQueue(appointment)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              appointment.status === 'checked-in' ? "bg-primary-100 text-primary-800" :
                              appointment.status === 'in-progress' ? "bg-warning-100 text-warning-800" :
                              "bg-gray-100 text-gray-800"
                            )}>
                              {appointment.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              className={cn(
                                "inline-flex items-center px-3 py-1.5 rounded text-xs font-medium mr-2",
                                activeTest ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-800"
                              )}
                              disabled={!activeTest}
                              onClick={() => {
                                if (activeTest) {
                                  navigate(`/patients/${patient.id}/pre-testing?appointment=${appointment.id}`);
                                }
                              }}
                            >
                              <Microscope className="h-3 w-3 mr-1" />
                              Start Test
                            </button>
                            <button
                              type="button"
                              className="text-primary-600 hover:text-primary-800"
                              onClick={() => navigate(`/patients/${patient.id}`)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingQueuePage;