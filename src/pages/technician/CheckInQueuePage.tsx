import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Filter, CheckCircle, AlertCircle, Clock, 
  Calendar, User, FileText, ArrowUpRight, RefreshCw 
} from 'lucide-react';
import { useScheduleStore } from '../../stores/scheduleStore';
import { usePatientStore } from '../../stores/patientStore';
import { useAuthStore } from '../../stores/authStore';
import { formatDate, formatTime } from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import dayjs from 'dayjs';

const CheckInQueuePage = () => {
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled'>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  
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
  
  // Handle check-in
  const handleCheckIn = async (appointmentId: string) => {
    try {
      await updateAppointment(appointmentId, { status: 'checked-in' });
      // Refresh appointments
      getAppointmentsByDate(selectedDate);
    } catch (error) {
      console.error('Error checking in patient:', error);
    }
  };
  
  // Handle starting pre-testing
  const handleStartPreTesting = (patientId: string, appointmentId: string) => {
    navigate(`/patients/${patientId}/pre-testing?appointment=${appointmentId}`);
  };
  
  // Filter appointments based on search and status
  const filteredAppointments = appointments
    .filter(appointment => {
      // Filter by status
      if (statusFilter !== 'all' && appointment.status !== statusFilter) {
        return false;
      }
      
      if (!searchTerm) return true;
      
      // Find patient for this appointment
      const patient = patients.find(p => p.id === appointment.patientId);
      if (!patient) return false;
      
      // Search by patient name or ID
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return fullName.includes(searchLower) || 
             patient.id.toLowerCase().includes(searchLower) ||
             appointment.id.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      // Sort by appointment time
      return a.startTime.localeCompare(b.startTime);
    });

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <PageHeader
        title="Check-In Queue"
        subtitle="Manage patient check-ins and pre-testing"
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
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/patients')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </button>
          </div>
        }
      />
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="sm:flex-1">
              <SearchInput 
                placeholder="Search patients by name or ID..."
                value={searchTerm}
                onChange={setSearchTerm}
                autoFocus
              />
            </div>
            <div className="flex space-x-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="checked-in">Checked In</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          {/* Date display */}
          <div className="mt-2 flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1.5" />
              Today: {formatDate(new Date())}
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
        
        {/* Appointment List */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-500">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  
                  // Skip if patient not found
                  if (!patient) return null;
                  
                  // Get time label
                  const now = dayjs();
                  const appointmentTime = dayjs(`${appointment.date}T${appointment.startTime}`);
                  const isLate = now.isAfter(appointmentTime) && appointment.status === 'scheduled';
                  const minutesLate = now.diff(appointmentTime, 'minute');
                  
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
                            <div className="text-sm text-gray-500">
                              {patient.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTime(new Date(`2000-01-01T${appointment.startTime}`))}
                        </div>
                        {isLate && (
                          <div className="text-xs text-error-600 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {minutesLate} {minutesLate === 1 ? 'minute' : 'minutes'} late
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                          {appointment.type.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'scheduled' ? 'bg-gray-100 text-gray-800' :
                          appointment.status === 'checked-in' ? 'bg-primary-100 text-primary-800' :
                          appointment.status === 'in-progress' ? 'bg-warning-100 text-warning-800' :
                          appointment.status === 'completed' ? 'bg-success-100 text-success-800' :
                          'bg-error-100 text-error-800'
                        }`}>
                          {appointment.status === 'scheduled' && <Clock className="mr-1 h-3 w-3" />}
                          {appointment.status === 'checked-in' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {appointment.status === 'in-progress' && <FileText className="mr-1 h-3 w-3" />}
                          {appointment.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {appointment.status === 'cancelled' && <AlertCircle className="mr-1 h-3 w-3" />}
                          {appointment.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          {appointment.status === 'scheduled' && (
                            <button
                              type="button"
                              className="text-primary-600 hover:text-primary-800 font-medium"
                              onClick={() => handleCheckIn(appointment.id)}
                            >
                              Check In
                            </button>
                          )}
                          
                          {appointment.status === 'checked-in' && (
                            <button
                              type="button"
                              className="text-primary-600 hover:text-primary-800 font-medium"
                              onClick={() => handleStartPreTesting(patient.id, appointment.id)}
                            >
                              Start Pre-Testing
                            </button>
                          )}
                          
                          {appointment.status === 'in-progress' && (
                            <button
                              type="button"
                              className="text-primary-600 hover:text-primary-800 font-medium"
                              onClick={() => handleStartPreTesting(patient.id, appointment.id)}
                            >
                              Continue Pre-Testing
                            </button>
                          )}
                          
                          <button
                            type="button"
                            className="text-gray-600 hover:text-gray-800 font-medium"
                            onClick={() => navigate(`/appointments/${appointment.id}`)}
                          >
                            Details <ArrowUpRight className="inline h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments in queue</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no appointments matching your filters for today
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInQueuePage;