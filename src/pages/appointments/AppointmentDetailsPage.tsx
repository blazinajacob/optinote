import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Clock, Calendar, User, Edit, Trash2, CheckCircle, AlertCircle, FileText, MessageSquare, CheckSquare, History, Loader2, PlusCircle, Sparkles, Tag, Sparkles as FileSparkles, StickyNote, Archive, Copy, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { usePatientStore } from '../../stores/patientStore';
import { useExaminationStore } from '../../stores/examinationStore';
import { formatDate, formatTime, cn } from '../../lib/utils';
import { Appointment } from '../../types';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import AppointmentNotesKeywordExtractor from '../../components/ai/AppointmentNotesKeywordExtractor';
import AISummaryGenerator from '../../components/ai/AISummaryGenerator';

const AppointmentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { user } = useAuthStore();
  const { patients, getPatientById } = usePatientStore();
  const { examinations, getExaminationsByPatientId } = useExaminationStore();
  const { 
    getAppointmentById, 
    updateAppointment, 
    cancelAppointment,
    isLoading,
    error
  } = useScheduleStore();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [relatedExamination, setRelatedExamination] = useState<any>(null);
  const [showAISummary, setShowAISummary] = useState(false);
  
  // Form state
  const [editForm, setEditForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    type: '',
    notes: '',
    status: ''
  });

  // Reference for previous notes to track changes
  const [previousNotes, setPreviousNotes] = useState('');
  
  // Fetch appointment and patient data
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      const appointmentData = await getAppointmentById(id);
      if (appointmentData) {
        setAppointment(appointmentData);
        setEditForm({
          date: appointmentData.date,
          startTime: appointmentData.startTime,
          endTime: appointmentData.endTime,
          type: appointmentData.type,
          notes: appointmentData.notes || '',
          status: appointmentData.status
        });
        setPreviousNotes(appointmentData.notes || '');
        
        // Fetch patient details
        if (appointmentData.patientId) {
          await getPatientById(appointmentData.patientId);
          await getExaminationsByPatientId(appointmentData.patientId);
        }
      }
    };
    
    loadData();
  }, [id, getAppointmentById, getPatientById, getExaminationsByPatientId]);
  
  // Update patient state when patients array changes
  useEffect(() => {
    if (appointment && patients.length > 0) {
      const patientData = patients.find(p => p.id === appointment.patientId);
      if (patientData) {
        setPatient(patientData);
      }
    }
  }, [appointment, patients]);
  
  // Check if there's an examination on the same date as the appointment
  useEffect(() => {
    if (appointment && examinations.length > 0) {
      const examOnSameDate = examinations.find(exam => 
        dayjs(exam.date).format('YYYY-MM-DD') === appointment.date
      );
      
      if (examOnSameDate) {
        setRelatedExamination(examOnSameDate);
      }
    }
  }, [appointment, examinations]);

  // Handle keyword click from the AI extractor
  const handleKeywordClick = (keyword: string) => {
    // Functionality when a user clicks on a keyword tag
    // For example, we could add a filter or search for that keyword
    console.log(`Keyword clicked: ${keyword}`);
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    // Reset form when canceling edit
    if (isEditing && appointment) {
      setEditForm({
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        type: appointment.type,
        notes: appointment.notes || '',
        status: appointment.status
      });
    }
  };

  const handleEditNotesToggle = () => {
    setIsEditingNotes(!isEditingNotes);
    
    if (isEditingNotes) {
      // If we're canceling notes editing, revert to previous notes
      setEditForm(prev => ({
        ...prev,
        notes: appointment?.notes || ''
      }));
    } else {
      // If we're starting to edit, save the current notes to revert if needed
      setPreviousNotes(editForm.notes);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    if (!id || !appointment) return;
    
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      // Validate start time is before end time
      const startTime = editForm.startTime;
      const endTime = editForm.endTime;
      
      if (startTime >= endTime) {
        throw new Error("End time must be after start time");
      }
      
      await updateAppointment(id, {
        date: editForm.date,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        type: editForm.type as any,
        status: editForm.status as any,
        notes: editForm.notes || undefined
      });
      
      // Refresh appointment data
      const updatedAppointment = await getAppointmentById(id);
      if (updatedAppointment) {
        setAppointment(updatedAppointment);
      }
      
      setSuccessMessage("Appointment updated successfully");
      setIsEditing(false);
      setIsEditingNotes(false);
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      setErrorMessage(error.message || "Failed to update appointment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!id || !appointment) return;
    
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      await updateAppointment(id, {
        notes: editForm.notes || undefined
      });
      
      // Refresh appointment data
      const updatedAppointment = await getAppointmentById(id);
      if (updatedAppointment) {
        setAppointment(updatedAppointment);
      }
      
      setSuccessMessage("Notes updated successfully");
      setIsEditingNotes(false);
    } catch (error: any) {
      console.error("Error updating notes:", error);
      setErrorMessage(error.message || "Failed to update notes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = async () => {
    if (!id || !appointment) return;
    
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }
    
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      await cancelAppointment(id);
      
      // Refresh appointment data
      const updatedAppointment = await getAppointmentById(id);
      if (updatedAppointment) {
        setAppointment(updatedAppointment);
      }
      
      setSuccessMessage("Appointment cancelled successfully");
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      setErrorMessage(error.message || "Failed to cancel appointment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleStatusChange = async (newStatus: Appointment['status']) => {
    if (!id || !appointment) return;
    
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      await updateAppointment(id, {
        status: newStatus
      });
      
      // Refresh appointment data
      const updatedAppointment = await getAppointmentById(id);
      if (updatedAppointment) {
        setAppointment(updatedAppointment);
        setEditForm(prev => ({
          ...prev,
          status: newStatus
        }));
      }
      
      setSuccessMessage(`Appointment marked as ${newStatus.replace('-', ' ')}`);
    } catch (error: any) {
      console.error("Error updating appointment status:", error);
      setErrorMessage(error.message || "Failed to update status. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleStartExamination = () => {
    if (!patient || !appointment) return;
    
    // Update appointment status first
    handleStatusChange('in-progress');
    
    // Navigate to examination page with appointment ID
    navigate(`/patients/${patient.id}/examination?appointment=${appointment.id}`);
  };
  
  const handleViewExamination = () => {
    if (!patient || !relatedExamination) return;
    
    navigate(`/patients/${patient.id}/examination?exam=${relatedExamination.id}`);
  };

  const copyNotesToClipboard = () => {
    if (!appointment?.notes) return;
    
    navigator.clipboard.writeText(appointment.notes).then(
      () => {
        setSuccessMessage("Notes copied to clipboard");
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      () => {
        setErrorMessage("Failed to copy notes");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    );
  };
  
  if (isLoading || !appointment) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
          <p className="mt-2 text-gray-500">Loading appointment details...</p>
        </div>
      </div>
    );
  }
  
  const isPastAppointment = dayjs(appointment.date).isBefore(dayjs(), 'day');
  const isToday = dayjs(appointment.date).isSame(dayjs(), 'day');
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="mr-4 text-gray-500 hover:text-gray-700"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Appointment Details
            </h1>
            <p className="text-sm text-gray-500">
              {formatDate(appointment.date)} • {formatTime(new Date(`2000-01-01T${appointment.startTime}`))} - {formatTime(new Date(`2000-01-01T${appointment.endTime}`))}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-outline"
            onClick={() => setShowAISummary(!showAISummary)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {showAISummary ? "Hide Summary" : "AI Summary"}
          </button>
          {!isEditing && (
            <>
              <button
                type="button"
                className="btn-outline"
                onClick={handleEditToggle}
              >
                <Edit className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </button>
              {appointment.status !== 'cancelled' && (
                <button
                  type="button"
                  className="btn-outline text-error-700 hover:text-error-800 hover:bg-error-50"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Cancel Appointment</span>
                  <span className="sm:hidden">Cancel</span>
                </button>
              )}
            </>
          )}
          
          {isEditing && (
            <>
              <button
                type="button"
                className="btn-outline"
                onClick={handleEditToggle}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">...</span>
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
      
      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 bg-success-50 border border-success-200 rounded-md text-success-800 flex items-center"
        >
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{successMessage}</span>
        </motion.div>
      )}
      
      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 bg-error-50 border border-error-200 rounded-md text-error-800 flex items-center"
        >
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </motion.div>
      )}
      
      {showAISummary && (
        <div className="mb-6">
          <AISummaryGenerator 
            type="appointment"
            data={appointment}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Information */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Appointment Information
              </h2>
            </div>
            <div className="px-4 py-4 sm:px-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date\" className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        value={editForm.date}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                        Appointment Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        value={editForm.type}
                        onChange={handleInputChange}
                      >
                        <option value="new-patient">New Patient</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="emergency">Emergency</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <select
                        id="startTime"
                        name="startTime"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        value={editForm.startTime}
                        onChange={handleInputChange}
                      >
                        {['08:00:00', '08:30:00', '09:00:00', '09:30:00', 
                          '10:00:00', '10:30:00', '11:00:00', '11:30:00',
                          '12:00:00', '12:30:00', '13:00:00', '13:30:00',
                          '14:00:00', '14:30:00', '15:00:00', '15:30:00',
                          '16:00:00', '16:30:00', '17:00:00'].map(time => (
                          <option key={time} value={time}>
                            {formatTime(new Date(`2000-01-01T${time}`))}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <select
                        id="endTime"
                        name="endTime"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        value={editForm.endTime}
                        onChange={handleInputChange}
                      >
                        {['08:30:00', '09:00:00', '09:30:00', '10:00:00', 
                          '10:30:00', '11:00:00', '11:30:00', '12:00:00',
                          '12:30:00', '13:00:00', '13:30:00', '14:00:00',
                          '14:30:00', '15:00:00', '15:30:00', '16:00:00',
                          '16:30:00', '17:00:00', '17:30:00'].map(time => (
                          <option key={time} value={time}>
                            {formatTime(new Date(`2000-01-01T${time}`))}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={editForm.status}
                      onChange={handleInputChange}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="checked-in">Checked In</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={editForm.notes}
                      onChange={handleInputChange}
                      placeholder="Add notes about the appointment"
                    />
                    
                    <AppointmentNotesKeywordExtractor 
                      notes={editForm.notes}
                      onKeywordClick={handleKeywordClick}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="mt-1 flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{formatDate(appointment.date)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="mt-1 flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {formatTime(new Date(`2000-01-01T${appointment.startTime}`))} - {formatTime(new Date(`2000-01-01T${appointment.endTime}`))}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Type</div>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {appointment.type.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'scheduled' ? 'bg-accent-100 text-accent-800' :
                          appointment.status === 'checked-in' ? 'bg-primary-100 text-primary-800' :
                          appointment.status === 'in-progress' ? 'bg-warning-100 text-warning-800' :
                          appointment.status === 'completed' ? 'bg-success-100 text-success-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Doctor</div>
                    <div className="mt-1 flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {appointment.doctorId === user?.id 
                          ? `Dr. ${user.name.split(' ')[1]}`
                          : "Doctor not assigned"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <StickyNote className="mr-2 h-5 w-5 text-primary-500" />
                Appointment Notes
              </h2>
              <div className="flex space-x-2">
                {appointment.notes && !isEditingNotes && (
                  <button 
                    className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                    onClick={copyNotesToClipboard}
                    title="Copy notes"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
                {!isEditing && (
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                    onClick={handleEditNotesToggle}
                  >
                    {isEditingNotes ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="px-4 py-4 sm:px-6">
              {isEditingNotes ? (
                <div>
                  <textarea
                    name="notes"
                    rows={5}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={editForm.notes}
                    onChange={handleInputChange}
                    placeholder="Add notes about the appointment, patient condition, and next steps..."
                  />

                  <div className="flex items-start mt-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4 text-primary-500" />
                    </div>
                    <p className="ml-2 text-xs text-gray-600">
                      Add detailed notes to help with patient care. AI will automatically extract key medical terms, symptoms, and medications.
                    </p>
                  </div>

                  <AppointmentNotesKeywordExtractor 
                    notes={editForm.notes}
                    onKeywordClick={handleKeywordClick}
                  />

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="btn-outline text-sm"
                      onClick={handleEditNotesToggle}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary text-sm"
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <span className="flex items-center">
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Saving...
                        </span>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Notes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {appointment.notes ? (
                    <div className="relative">
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {appointment.notes}
                      </div>

                      <AppointmentNotesKeywordExtractor 
                        notes={appointment.notes}
                        onKeywordClick={handleKeywordClick}
                        className="mt-4"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4">
                      <StickyNote className="mx-auto h-10 w-10 text-gray-300" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add notes about this appointment to help with patient care
                      </p>
                      <button
                        type="button"
                        className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-500"
                        onClick={handleEditNotesToggle}
                      >
                        <Edit className="h-4 w-4 mr-2 inline" />
                        Add notes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Related Examination */}
          {!isEditing && relatedExamination && (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary-500" />
                  Related Examination
                </h2>
                <div className="flex gap-2">
                  <AISummaryGenerator 
                    type="examination"
                    data={relatedExamination}
                    compact={true}
                  />
                  <button
                    type="button"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    onClick={handleViewExamination}
                  >
                    View Examination
                  </button>
                </div>
              </div>
              <div className="px-4 py-4 sm:px-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Date</div>
                    <div className="text-sm text-gray-500">{formatDate(relatedExamination.date)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Status</div>
                    <div className="text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                        relatedExamination.status === 'completed' 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-warning-100 text-warning-800'
                      }`}>
                        {relatedExamination.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <div className="text-sm font-medium">Chief Complaint</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {relatedExamination.chiefComplaint}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Appointment History */}
          {!isEditing && (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <History className="h-5 w-5 mr-2 text-gray-400" />
                  Appointment History
                </h2>
              </div>
              <div className="px-4 py-4 sm:px-6">
                <div className="space-y-4">
                  <div className="relative pb-5 border-l-2 border-gray-200 pl-5">
                    <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-primary-600 bg-white"></div>
                    <div className="text-sm font-medium text-gray-900">Appointment created</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(appointment.createdAt)} at {formatTime(new Date(appointment.createdAt))}
                    </div>
                  </div>
                  
                  {appointment.status !== 'scheduled' && (
                    <div className="relative pb-5 border-l-2 border-gray-200 pl-5">
                      <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-primary-600 bg-white"></div>
                      <div className="text-sm font-medium text-gray-900">
                        Status changed to {appointment.status.replace('-', ' ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(appointment.updatedAt)} at {formatTime(new Date(appointment.updatedAt))}
                      </div>
                    </div>
                  )}
                  
                  {relatedExamination && (
                    <div className="relative pb-5 border-l-2 border-gray-200 pl-5">
                      <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-primary-600 bg-white"></div>
                      <div className="text-sm font-medium text-gray-900">
                        Examination created
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(relatedExamination.createdAt)} at {formatTime(new Date(relatedExamination.createdAt))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Patient Information */}
          {patient && (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
                <h2 className="text-lg font-medium text-gray-900">
                  Patient Information
                </h2>
                <div className="flex gap-2">
                  <AISummaryGenerator 
                    type="patient"
                    data={patient}
                    compact={true}
                  />
                  <button
                    type="button"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center mb-4">
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
                      {patient.gender}, {dayjs().diff(dayjs(patient.dateOfBirth), 'year')} years
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="text-sm text-gray-900">{patient.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="text-sm text-gray-900">{patient.email || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-ghost text-xs py-1"
                    onClick={() => navigate(`/patients/${patient.id}/examination`)}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    New Exam
                  </button>
                  
                  <button
                    type="button"
                    className="btn-ghost text-xs py-1"
                    onClick={() => {/* Would implement messaging */}}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Actions */}
          {!isEditing && appointment.status !== 'cancelled' && (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="px-4 py-4 sm:px-6">
                <div className="space-y-2">
                  {appointment.status === 'scheduled' && (
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-3 border border-primary-200 rounded-md bg-primary-50 hover:bg-primary-100 transition-colors"
                      onClick={() => handleStatusChange('checked-in')}
                    >
                      <span className="flex items-center text-primary-700">
                        <CheckSquare className="h-5 w-5 mr-2" />
                        Check In Patient
                      </span>
                      <ChevronLeft className="h-5 w-5 text-primary-400 transform rotate-180" />
                    </button>
                  )}
                  
                  {appointment.status === 'checked-in' && (
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-3 border border-primary-200 rounded-md bg-primary-50 hover:bg-primary-100 transition-colors"
                      onClick={handleStartExamination}
                    >
                      <span className="flex items-center text-primary-700">
                        <FileText className="h-5 w-5 mr-2" />
                        Start Examination
                      </span>
                      <ChevronLeft className="h-5 w-5 text-primary-400 transform rotate-180" />
                    </button>
                  )}
                  
                  {appointment.status === 'in-progress' && (
                    <>
                      {!relatedExamination && (
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-3 border border-primary-200 rounded-md bg-primary-50 hover:bg-primary-100 transition-colors mb-2"
                          onClick={() => patient && navigate(`/patients/${patient.id}/examination?appointment=${appointment.id}`)}
                        >
                          <span className="flex items-center text-primary-700">
                            <PlusCircle className="h-5 w-5 mr-2" />
                            Create Examination
                          </span>
                          <ChevronLeft className="h-5 w-5 text-primary-400 transform rotate-180" />
                        </button>
                      )}
                      
                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-3 border border-success-200 rounded-md bg-success-50 hover:bg-success-100 transition-colors"
                        onClick={() => handleStatusChange('completed')}
                      >
                        <span className="flex items-center text-success-700">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Complete Appointment
                        </span>
                        <ChevronLeft className="h-5 w-5 text-success-400 transform rotate-180" />
                      </button>
                    </>
                  )}
                  
                  {(appointment.status === 'completed' || isPastAppointment) && (
                    <>
                      {!relatedExamination && (
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-3 border border-primary-200 rounded-md bg-primary-50 hover:bg-primary-100 transition-colors mb-2"
                          onClick={() => patient && navigate(`/patients/${patient.id}/examination?appointment=${appointment.id}`)}
                        >
                          <span className="flex items-center text-primary-700">
                            <FileText className="h-5 w-5 mr-2" />
                            Add Examination Record
                          </span>
                          <ChevronLeft className="h-5 w-5 text-primary-400 transform rotate-180" />
                        </button>
                      )}
                      
                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          navigate('/schedule');
                        }}
                      >
                        <span className="flex items-center text-gray-700">
                          <Calendar className="h-5 w-5 mr-2" />
                          Schedule Follow-up
                        </span>
                        <ChevronLeft className="h-5 w-5 text-gray-400 transform rotate-180" />
                      </button>
                    </>
                  )}

                  {/* Edit Notes Quick Action */}
                  {!isEditingNotes && (
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors mt-2"
                      onClick={handleEditNotesToggle}
                    >
                      <span className="flex items-center text-gray-700">
                        <StickyNote className="h-5 w-5 mr-2" />
                        {appointment.notes ? 'Edit Notes' : 'Add Notes'}
                      </span>
                      <ChevronLeft className="h-5 w-5 text-gray-400 transform rotate-180" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Appointment Timing */}
          {!isEditing && (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Appointment Timing
                </h2>
              </div>
              <div className="px-4 py-4 sm:px-6">
                <div>
                  {isPastAppointment && (
                    <div className="mb-4 text-sm text-gray-500">
                      This appointment has already passed.
                    </div>
                  )}
                  
                  {isToday && (
                    <div className="mb-4 text-sm font-medium text-primary-600">
                      This appointment is scheduled for today.
                    </div>
                  )}
                  
                  {!isPastAppointment && !isToday && (
                    <div className="mb-4 text-sm text-gray-500">
                      This appointment is scheduled for {formatDate(appointment.date)}.
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-md p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="text-sm font-medium text-gray-900">Duration</div>
                      <div className="text-sm text-gray-500">30 minutes</div>
                    </div>
                    
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 w-1/2"></div>
                      </div>
                      <div className="flex text-xs text-gray-500 mt-1 justify-between">
                        <span>{formatTime(new Date(`2000-01-01T${appointment.startTime}`))}</span>
                        <span>{formatTime(new Date(`2000-01-01T${appointment.endTime}`))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;