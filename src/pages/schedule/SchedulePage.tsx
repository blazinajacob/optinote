import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, User, PlusCircle, LayoutList, CalendarDays,
  AlertCircle, Loader2, Check, Menu, X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { usePatientStore } from '../../stores/patientStore';
import { formatTime, cn } from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';
import CalendarView from '../../components/schedule/CalendarView';
import SchedulerAIAssistant, { AppointmentSlot } from '../../components/schedule/SchedulerAIAssistant';
import { motion, AnimatePresence } from 'framer-motion';

const timeSlots = [
  '08:00:00', '08:30:00', '09:00:00', '09:30:00', 
  '10:00:00', '10:30:00', '11:00:00', '11:30:00',
  '12:00:00', '12:30:00', '13:00:00', '13:30:00',
  '14:00:00', '14:30:00', '15:00:00', '15:30:00',
  '16:00:00', '16:30:00', '17:00:00'
];

const SchedulePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    appointments, 
    selectedDate, 
    getAppointmentsByDate, 
    setSelectedDate,
    isLoading,
    createAppointment 
  } = useScheduleStore();
  const { patients, getPatients } = usePatientStore();
  
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [view, setView] = useState<'day' | 'calendar'>('day');
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>(selectedDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Load data for search
  useEffect(() => {
    getPatients();
    getAppointmentsByDate(selectedDate);
  }, [getPatients, getAppointmentsByDate, selectedDate]);
  
  // Reset form when selectedDate changes
  useEffect(() => {
    setAppointmentDate(selectedDate);
  }, [selectedDate]);
  
  // Functions to navigate between days
  const previousDay = () => {
    const prevDate = dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
    setSelectedDate(prevDate);
  };
  
  const nextDay = () => {
    const nextDate = dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD');
    setSelectedDate(nextDate);
  };
  
  const today = () => {
    setSelectedDate(dayjs().format('YYYY-MM-DD'));
  };
  
  // Get appointment for a specific time slot
  const getAppointmentForTimeSlot = (timeSlot: string) => {
    return appointments.find(apt => 
      apt.startTime === timeSlot && apt.status !== 'cancelled'
    );
  };
  
  // Handle AI-recommended slot selection
  const handleSlotSelect = (slot: AppointmentSlot) => {
    setSelectedSlot(slot);
    setSelectedDate(slot.date);
    setAppointmentDate(slot.date);
    setSelectedTime(slot.startTime);
    
    // Set patient ID if available
    if (slot.patientId) {
      setSelectedPatientId(slot.patientId);
    } else if (slot.patientName) {
      // Try to find patient by name
      const patient = patients.find(p => 
        `${p.firstName} ${p.lastName}`.toLowerCase() === slot.patientName?.toLowerCase()
      );
      if (patient) {
        setSelectedPatientId(patient.id);
      }
    }
    
    // Set doctor if available
    if (slot.doctorId) {
      setSelectedDoctor(slot.doctorId);
    }
    
    // Set appointment type if available
    if (slot.appointmentType) {
      setSelectedAppointmentType(slot.appointmentType);
    }
    
    setShowAddAppointment(true);
  };
  
  // Calculate end time (30 min after start time)
  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHour = hours + (minutes + 30 >= 60 ? 1 : 0);
    const endMinute = (minutes + 30) % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;
  };
  
  // Submit appointment to database
  const handleScheduleAppointment = async () => {
    // Validate form
    if (!selectedPatientId) {
      setErrorMessage("Please select a patient");
      return;
    }
    
    if (!appointmentDate) {
      setErrorMessage("Please select a date");
      return;
    }
    
    if (!selectedTime) {
      setErrorMessage("Please select a time");
      return;
    }
    
    if (!selectedAppointmentType) {
      setErrorMessage("Please select an appointment type");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Create appointment in database
      await createAppointment({
        patientId: selectedPatientId,
        doctorId: selectedDoctor || user?.id, // Default to current user if no doctor selected
        date: appointmentDate,
        startTime: selectedTime,
        endTime: calculateEndTime(selectedTime),
        type: selectedAppointmentType as any,
        status: 'scheduled',
        notes: notes || undefined
      });
      
      // Show success message
      setSuccessMessage("Appointment scheduled successfully");
      
      // Clear form and close modal
      setTimeout(() => {
        setShowAddAppointment(false);
        setSelectedSlot(null);
        setSelectedPatientId("");
        setSelectedAppointmentType("");
        setSelectedTime("");
        setSelectedDoctor("");
        setNotes("");
        setSuccessMessage(null);
        
        // Reload appointments for the selected date
        getAppointmentsByDate(appointmentDate);
      }, 1500);
      
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      setErrorMessage("Failed to schedule appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // Automatically switch to day view when a date is selected
    setView('day');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <PageHeader
        title="Schedule"
        subtitle="Manage appointments and patient visits"
        actions={
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowAddAppointment(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Appointment</span>
            <span className="inline sm:hidden">New</span>
          </button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {/* Mobile view controls */}
          <div className="mb-4 flex flex-wrap gap-2 justify-between items-center">
            {/* Mobile menu button - visible only on small screens */}
            <div className="sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>

            {/* View selection - visible on medium screens and larger */}
            <div className="hidden sm:block">
              <div className="bg-white border border-gray-200 rounded-md p-1 flex">
                <button
                  type="button"
                  className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                    view === 'day' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setView('day')}
                >
                  <LayoutList className="h-4 w-4 mr-1.5" />
                  Day View
                </button>
                <button
                  type="button"
                  className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                    view === 'calendar' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setView('calendar')}
                >
                  <CalendarDays className="h-4 w-4 mr-1.5" />
                  Month View
                </button>
              </div>
            </div>
            
            {/* Mobile menu - visible when menu is open */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full sm:hidden bg-white border border-gray-200 rounded-lg shadow-md mt-2"
                >
                  <div className="p-2 space-y-1">
                    <button
                      className={`w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded ${
                        view === 'day' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setView('day');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LayoutList className="h-4 w-4 mr-2" />
                      Day View
                    </button>
                    <button
                      className={`w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded ${
                        view === 'calendar' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setView('calendar');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Month View
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Appointment Finder - Positioned above calendar in calendar view */}
          {view === 'calendar' && (
            <div className="mb-6">
              <SchedulerAIAssistant 
                onSlotSelect={handleSlotSelect}
                bookedSlots={appointments.map(apt => ({
                  date: apt.date,
                  startTime: apt.startTime,
                  endTime: apt.endTime,
                  doctorId: apt.doctorId
                }))}
              />
            </div>
          )}

          {view === 'calendar' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CalendarView 
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-sm rounded-lg overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="p-1 rounded-md hover:bg-gray-100"
                      onClick={previousDay}
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-500" />
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md flex items-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      {dayjs(selectedDate).format('MMM D, YYYY')}
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded-md hover:bg-gray-100"
                      onClick={nextDay}
                    >
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    </button>
                    
                    <button
                      type="button"
                      className="ml-2 px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded border border-primary-200"
                      onClick={today}
                    >
                      Today
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-accent-500 mr-1" />
                      <span className="text-xs text-gray-600">Scheduled</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-primary-500 mr-1" />
                      <span className="text-xs text-gray-600">Checked In</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-warning-500 mr-1" />
                      <span className="text-xs text-gray-600">In Progress</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-success-500 mr-1" />
                      <span className="text-xs text-gray-600">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                  <p className="mt-2 text-gray-500">Loading schedule...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {timeSlots.map((timeSlot) => {
                    const appointment = getAppointmentForTimeSlot(timeSlot);
                    const patient = appointment 
                      ? patients.find(p => p.id === appointment.patientId)
                      : null;
                    
                    return (
                      <div 
                        key={timeSlot} 
                        className={`p-4 flex ${appointment ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                        onClick={() => {
                          if (appointment) {
                            navigate(`/appointments/${appointment.id}`);
                          }
                        }}
                      >
                        <div className="w-20 flex-shrink-0 text-center sm:text-left">
                          <div className="text-sm font-medium text-gray-900">
                            {formatTime(new Date(`2000-01-01T${timeSlot}`))}
                          </div>
                        </div>
                        
                        {appointment ? (
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center pl-4 border-l border-gray-200">
                            <div className={`h-5 w-1 rounded-sm mr-4 hidden sm:block ${
                              appointment.status === 'scheduled' ? 'bg-accent-500' :
                              appointment.status === 'checked-in' ? 'bg-primary-500' :
                              appointment.status === 'in-progress' ? 'bg-warning-500' :
                              'bg-success-500'
                            }`} />
                            
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {patient?.firstName} {patient?.lastName}
                                </div>
                                <div className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                                  {appointment.type.replace('-', ' ')}
                                </div>
                                <div className={`ml-auto sm:ml-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  appointment.status === 'scheduled' ? 'bg-accent-100 text-accent-800' :
                                  appointment.status === 'checked-in' ? 'bg-primary-100 text-primary-800' :
                                  appointment.status === 'in-progress' ? 'bg-warning-100 text-warning-800' :
                                  'bg-success-100 text-success-800'
                                }`}>
                                  {appointment.status.replace('-', ' ')}
                                </div>
                              </div>
                              <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                                <div className="flex items-center">
                                  <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                  <span>
                                    {formatTime(new Date(`2000-01-01T${appointment.startTime}`))} - {formatTime(new Date(`2000-01-01T${appointment.endTime}`))}
                                  </span>
                                </div>
                                
                                <div className="flex items-center">
                                  <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                  <span>Dr. {user?.name.split(' ')[1]}</span>
                                </div>
                              </div>
                              {appointment.notes && (
                                <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                                  {appointment.notes}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-2 sm:mt-0 flex-shrink-0 flex sm:ml-4 space-x-2">
                              {appointment.status === 'scheduled' && (
                                <button 
                                  className="px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Would update appointment status to checked-in
                                  }}
                                >
                                  Check In
                                </button>
                              )}
                              
                              {appointment.status === 'checked-in' && (
                                <button 
                                  className="px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (patient) {
                                      navigate(`/patients/${patient.id}/examination?appointment=${appointment.id}`);
                                    }
                                  }}
                                >
                                  Start Exam
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 pl-4 border-l border-gray-200 flex items-center">
                            <div className="text-sm text-gray-500 italic flex-1">
                              Available
                            </div>
                            <button
                              className="text-xs text-primary-600 hover:text-primary-800"
                              onClick={() => {
                                setShowAddAppointment(true);
                                setAppointmentDate(selectedDate);
                                setSelectedTime(timeSlot);
                              }}
                            >
                              + Book
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </div>
        
        <div className="hidden lg:block">
          {view === 'day' && (
            <SchedulerAIAssistant 
              onSlotSelect={handleSlotSelect}
              bookedSlots={appointments.map(apt => ({
                date: apt.date,
                startTime: apt.startTime,
                endTime: apt.endTime,
                doctorId: apt.doctorId
              }))}
            />
          )}
        </div>

        {/* AI Assistant for mobile - shows at bottom when viewing schedule */}
        <div className="lg:hidden">
          {view === 'day' && !mobileMenuOpen && (
            <div className="fixed bottom-4 right-4 z-10">
              <button
                className="bg-primary-600 text-white p-3 rounded-full shadow-lg"
                onClick={() => navigate('/patients')}
              >
                <PlusCircle className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add appointment modal */}
      {showAddAppointment && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => {
              setShowAddAppointment(false);
              setSelectedSlot(null);
              setSelectedPatientId("");
              setSelectedAppointmentType("");
              setSelectedTime("");
              setSelectedDoctor("");
              setNotes("");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Schedule Appointment</h3>
                    <p className="mt-1 text-sm text-gray-500">Fill out the details to schedule a new appointment.</p>
                    
                    {errorMessage && (
                      <div className="mt-3 p-3 bg-error-50 text-error-800 text-sm rounded-md flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errorMessage}
                      </div>
                    )}
                    
                    {successMessage && (
                      <div className="mt-3 p-3 bg-success-50 text-success-800 text-sm rounded-md flex items-center">
                        <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                        {successMessage}
                      </div>
                    )}
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="patient" className="block text-sm font-medium text-gray-700">
                          Patient
                        </label>
                        <select
                          id="patient"
                          name="patient"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          value={selectedPatientId}
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                        >
                          <option value="">Select patient...</option>
                          {patients.map(patient => (
                            <option key={patient.id} value={patient.id}>
                              {patient.firstName} {patient.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Date
                          </label>
                          <input
                            type="date"
                            name="date"
                            id="date"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                            Time
                          </label>
                          <select
                            id="time"
                            name="time"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                          >
                            <option value="">Select time...</option>
                            {timeSlots.map(slot => {
                              const hasAppointment = appointments.some(
                                apt => apt.startTime === slot && apt.status !== 'cancelled' && apt.date === appointmentDate
                              );
                              const time = formatTime(new Date(`2000-01-01T${slot}`));
                              return (
                                <option key={slot} value={slot} disabled={hasAppointment}>
                                  {time} {hasAppointment ? '(Booked)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700">
                          Appointment Type
                        </label>
                        <select
                          id="appointmentType"
                          name="appointmentType"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          value={selectedAppointmentType}
                          onChange={(e) => setSelectedAppointmentType(e.target.value)}
                        >
                          <option value="">Select type...</option>
                          <option value="new-patient">New Patient</option>
                          <option value="follow-up">Follow-up</option>
                          <option value="emergency">Emergency</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">
                          Doctor
                        </label>
                        <select
                          id="doctor"
                          name="doctor"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          value={selectedDoctor}
                          onChange={(e) => setSelectedDoctor(e.target.value)}
                        >
                          <option value="">Select doctor...</option>
                          <option value={user?.id || ""}>Dr. {user?.name.split(' ')[1] || "Current User"}</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="Add any additional notes about the appointment"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="btn-primary sm:ml-3 w-full sm:w-auto"
                  onClick={handleScheduleAppointment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Scheduling...
                    </span>
                  ) : "Schedule"}
                </button>
                <button
                  type="button"
                  className="btn-outline mt-3 sm:mt-0 w-full sm:w-auto"
                  onClick={() => {
                    setShowAddAppointment(false);
                    setSelectedSlot(null);
                    setSelectedPatientId("");
                    setSelectedAppointmentType("");
                    setSelectedTime("");
                    setSelectedDoctor("");
                    setNotes("");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;