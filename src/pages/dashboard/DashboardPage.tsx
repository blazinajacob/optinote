import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Calendar, ClipboardList, FileCheck, 
  AlertCircle, Clock, FileText, PlusCircle,
  CheckCircle, BellRing, BarChart3, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { usePatientStore } from '../../stores/patientStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { formatTime, formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { patients, getPatients } = usePatientStore();
  const { appointments, getAppointmentsByDate, selectedDate } = useScheduleStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    getPatients();
    getAppointmentsByDate(selectedDate);
  }, [getPatients, getAppointmentsByDate, selectedDate]);
  
  // Filter today's appointments and sort by time
  const todaysAppointments = appointments
    .filter(apt => apt.status !== 'cancelled')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  const stats = [
    { 
      name: 'Patients', 
      icon: Users, 
      value: patients.length, 
      color: 'bg-primary-500',
      onClick: () => navigate('/patients')
    },
    { 
      name: 'Today\'s Appointments', 
      icon: Calendar, 
      value: todaysAppointments.length, 
      color: 'bg-secondary-500',
      onClick: () => navigate('/schedule')
    },
    { 
      name: 'Pending Exams', 
      icon: ClipboardList, 
      value: 3, 
      color: 'bg-accent-500',
      onClick: () => navigate('/patients')
    },
    { 
      name: 'Completed Today', 
      icon: FileCheck, 
      value: 2, 
      color: 'bg-success-500',
      onClick: () => {}
    },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.role === 'doctor' ? 'Doctor Dashboard' : 'Technician Dashboard'}
          </h2>
          <p className="mt-1 text-gray-600">
            Welcome back, {user?.name}
          </p>
        </div>
        <div className="flex gap-3">
          {user?.role === 'technician' && (
            <motion.button 
              type="button" 
              className="btn-primary"
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/check-in')}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Check In Patient
            </motion.button>
          )}
          <motion.button 
            type="button" 
            className="btn-primary"
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/schedule')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {user?.role === 'doctor' ? 'View Schedule' : 'Schedule Appointment'}
          </motion.button>
        </div>
      </div>
      
      <motion.div 
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => (
          <motion.div 
            key={stat.name}
            className="bg-white overflow-hidden shadow-md rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-gray-100"
            onClick={stat.onClick}
            variants={item}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Today's Appointments */}
        <motion.div 
          className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-100 lg:col-span-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary-500" />
                Today's Appointments
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {selectedDate}
              </p>
            </div>
            <button
              className="btn-ghost text-sm"
              onClick={() => navigate('/schedule')}
            >
              View All
            </button>
          </div>
          
          <div>
            {todaysAppointments.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {todaysAppointments.map((appointment, index) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  return (
                    <motion.div 
                      key={appointment.id} 
                      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full mr-3 ${
                            appointment.status === 'scheduled' ? 'bg-accent-500' :
                            appointment.status === 'checked-in' ? 'bg-primary-500' :
                            appointment.status === 'in-progress' ? 'bg-warning-500' :
                            'bg-success-500'
                          }`} />
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {patient?.firstName} {patient?.lastName}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className="badge-primary">
                            {appointment.type.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-col sm:flex-row sm:justify-between gap-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {formatTime(new Date(`2000-01-01T${appointment.startTime}`))}-{formatTime(new Date(`2000-01-01T${appointment.endTime}`))}
                        </div>
                        <div className="flex items-center justify-between">
                          {appointment.notes && (
                            <div className="flex items-center text-sm text-gray-500 sm:mt-0">
                              <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <p className="truncate max-w-xs">{appointment.notes}</p>
                            </div>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <Calendar className="mx-auto h-10 w-10 text-gray-300" />
                <h3 className="mt-3 text-sm font-medium text-gray-900">No appointments today</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your schedule is clear for the day
                </p>
                <div className="mt-4">
                  <button 
                    type="button"
                    className="btn-outline"
                    onClick={() => navigate('/schedule')}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Quick Stats and Recent Patients */}
        <motion.div 
          className="space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Alerts & Notifications */}
          <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center">
                <BellRing className="h-5 w-5 text-primary-500 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Alerts & Tasks
                </h3>
              </div>
              <button 
                className="text-primary-600 text-sm font-medium"
                onClick={() => navigate('/notifications')}
              >
                View All
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/patients')}>
                <div className="flex items-start">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-warning-100 text-warning-600">
                    <AlertCircle className="h-5 w-5" />
                  </span>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">Prescription Refill</p>
                    <p className="mt-1 text-sm text-gray-500">Jane Smith requested Latanoprost refill</p>
                    <div className="mt-2 flex">
                      <button className="text-xs font-medium text-primary-600 hover:text-primary-700 mr-4">
                        Review
                      </button>
                      <button className="text-xs font-medium text-success-600 hover:text-success-700">
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/settings')}>
                <div className="flex items-start">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                    <BarChart3 className="h-5 w-5" />
                  </span>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">MIPS Reporting</p>
                    <p className="mt-1 text-sm text-gray-500">Quarterly deadline: June 30th</p>
                    <div className="mt-2 flex">
                      <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
                        View Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/schedule')}>
                <div className="flex items-start">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100 text-success-600">
                    <CheckCircle className="h-5 w-5" />
                  </span>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">OCT Training</p>
                    <p className="mt-1 text-sm text-gray-500">Tomorrow at 9:00 AM</p>
                    <div className="mt-2 flex">
                      <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
                        Add to Calendar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Patients */}
          <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary-500" />
                Recent Patients
              </h3>
              <button 
                className="text-primary-600 text-sm font-medium"
                onClick={() => navigate('/patients')}
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {patients.slice(0, 3).map(patient => (
                <div 
                  key={patient.id} 
                  className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-semibold">
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-gray-500">{formatDate(patient.dateOfBirth)}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
              {patients.length === 0 && (
                <div className="px-6 py-4 text-center">
                  <p className="text-sm text-gray-500">No patients found</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;