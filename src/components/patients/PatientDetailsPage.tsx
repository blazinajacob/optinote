import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CalendarPlus, Edit, Eye, FileText, 
  History, ChevronRight, PlusCircle, Clipboard,
  Calendar, Clock, User, CheckCircle, XCircle,
  FileCheck, FileBarChart2, Stethoscope, Menu, ChevronDown, Phone
} from 'lucide-react';
import { usePatientStore } from '../../stores/patientStore';
import { useExaminationStore } from '../../stores/examinationStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { formatDate, formatTime, cn } from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';
import PatientInfoEditForm from '../../components/patients/PatientInfoEditForm';
import PatientInfoAIAssistant from '../../components/ai/PatientInfoAIAssistant';
import PatientTimeline from '../../components/patients/PatientTimeline';
import PatientDocumentsUploader from '../../components/patients/PatientDocumentsUploader';
import PatientDocumentsList from '../../components/patients/PatientDocumentsList';
import PatientChartNotes from '../../components/technician/PatientChartNotes';
import BillingHistory from '../../components/billing/BillingHistory';
import BillingOverview from '../../components/billing/BillingOverview';
import BillingProviderForm from '../../components/billing/BillingProviderForm';
import SelfPayForm from '../../components/billing/SelfPayForm';
import dayjs from 'dayjs';

const PatientDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedPatient, getPatientById, updatePatient, isLoading: patientLoading } = usePatientStore();
  const { examinations, getExaminationsByPatientId, soapNotes, getSoapNotesByPatientId, isLoading: examsLoading } = useExaminationStore();
  const { appointments, getAppointmentsByPatientId, isLoading: appointmentsLoading } = useScheduleStore();
  
  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'appointments' | 'documents' | 'billing'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [activeBillingTab, setActiveBillingTab] = useState<'overview' | 'insurance' | 'self-pay' | 'history' | 'eligibility'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      getPatientById(id);
      getExaminationsByPatientId(id);
      getAppointmentsByPatientId(id);
      getSoapNotesByPatientId(id);
    }
  }, [id, getPatientById, getExaminationsByPatientId, getAppointmentsByPatientId, getSoapNotesByPatientId]);
  
  // Handle patient update
  const handleUpdatePatient = async (data: Partial<any>) => {
    if (!id) return;
    await updatePatient(id, data);
  };
  
  // Handle document upload
  const handleDocumentUploaded = (document: any) => {
    setUploadedDocuments(prev => [document, ...prev]);
  };
  
  // Handle document deletion
  const handleDeleteDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };
  
  // Handle sending chart notes
  const handleSendNotes = async (examinationId: string, recipientType: string, recipientInfo: string) => {
    // In a real app, this would send the notes via email or another method
    console.log(`Sending notes for examination ${examinationId} to ${recipientType}: ${recipientInfo}`);
    
    // Simulate API call
    return new Promise<void>(resolve => {
      setTimeout(resolve, 1000);
    });
  };
  
  // Handle insurance provider form submission
  const handleSaveInsurance = async (data: any) => {
    // In a real app, this would save the insurance information to the database
    console.log('Saving insurance information:', data);
    
    // Simulate API call
    return new Promise<void>(resolve => {
      setTimeout(resolve, 1000);
    });
  };
  
  // Handle self-pay form submission
  const handleSaveSelfPay = async (data: any) => {
    // In a real app, this would save the self-pay information to the database
    console.log('Saving self-pay information:', data);
    
    // Simulate API call
    return new Promise<void>(resolve => {
      setTimeout(resolve, 1000);
    });
  };
  
  if (patientLoading || !selectedPatient) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading patient details...</p>
        </div>
      </div>
    );
  }
  
  // Filter for upcoming appointments
  const upcomingAppointments = appointments
    .filter(a => dayjs(a.date).isAfter(dayjs(), 'day') || 
                (dayjs(a.date).isSame(dayjs(), 'day') && 
                 a.status !== 'completed' && 
                 a.status !== 'cancelled'))
    .sort((a, b) => {
      // Sort by date then time
      const dateCompare = dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  
  // Filter for past appointments
  const pastAppointments = appointments
    .filter(a => (dayjs(a.date).isBefore(dayjs(), 'day') || 
                 (dayjs(a.date).isSame(dayjs(), 'day') && 
                  (a.status === 'completed' || a.status === 'cancelled'))))
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <PageHeader
        title={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
        subtitle={`Patient ID: ${selectedPatient.id}`}
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setIsEditing(!isEditing);
                setShowAIAssistant(false);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setShowAIAssistant(!showAIAssistant);
                setIsEditing(false);
              }}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              AI Update
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(`/patients/${id}/examination`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              New Exam
            </button>
          </div>
        }
      />
      
      {showAIAssistant && (
        <div className="mb-6">
          <PatientInfoAIAssistant 
            patient={selectedPatient}
            onUpdatePatient={handleUpdatePatient}
          />
        </div>
      )}
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        {isEditing ? (
          <div className="p-4 sm:p-6">
            <PatientInfoEditForm
              patient={selectedPatient}
              onUpdate={handleUpdatePatient}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-gray-500">Date of Birth</span>
              <span className="font-medium">{formatDate(selectedPatient.dateOfBirth)}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-gray-500">Gender</span>
              <span className="font-medium capitalize">{selectedPatient.gender}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-gray-500">Phone</span>
              <span className="font-medium">{selectedPatient.phone}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-gray-500">Email</span>
              <span className="font-medium">{selectedPatient.email || 'Not provided'}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-gray-500">Address</span>
              <span className="font-medium">{selectedPatient.address || 'Not provided'}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-gray-500">Insurance</span>
              <span className="font-medium">{selectedPatient.insuranceProvider || 'Not provided'}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile menu overlay */}
      <div className="relative sm:hidden mb-4">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <span className="font-medium text-gray-900">
            {activeTab === 'overview' ? 'Overview' : 
             activeTab === 'exams' ? 'Examinations' : 
             activeTab === 'appointments' ? 'Appointments' : 
             activeTab === 'documents' ? 'Documents' : 'Billing'}
          </span>
          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-md z-10">
            <div className="p-1">
              <button
                className={cn(
                  "w-full flex items-center px-4 py-3 text-left text-sm rounded",
                  activeTab === 'overview' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => {
                  setActiveTab('overview');
                  setMobileMenuOpen(false);
                }}
              >
                <Stethoscope className="h-4 w-4 mr-3" />
                Overview
              </button>
              
              <button
                className={cn(
                  "w-full flex items-center px-4 py-3 text-left text-sm rounded",
                  activeTab === 'exams' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => {
                  setActiveTab('exams');
                  setMobileMenuOpen(false);
                }}
              >
                <Eye className="h-4 w-4 mr-3" />
                Examinations
              </button>
              
              <button
                className={cn(
                  "w-full flex items-center px-4 py-3 text-left text-sm rounded",
                  activeTab === 'appointments' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => {
                  setActiveTab('appointments');
                  setMobileMenuOpen(false);
                }}
              >
                <Calendar className="h-4 w-4 mr-3" />
                Appointments
              </button>
              
              <button
                className={cn(
                  "w-full flex items-center px-4 py-3 text-left text-sm rounded",
                  activeTab === 'documents' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => {
                  setActiveTab('documents');
                  setMobileMenuOpen(false);
                }}
              >
                <FileText className="h-4 w-4 mr-3" />
                Documents
              </button>
              
              <button
                className={cn(
                  "w-full flex items-center px-4 py-3 text-left text-sm rounded",
                  activeTab === 'billing' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => {
                  setActiveTab('billing');
                  setMobileMenuOpen(false);
                }}
              >
                <FileBarChart2 className="h-4 w-4 mr-3" />
                Billing
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Desktop Tabs - hidden on mobile */}
      <div className="hidden sm:block border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            className={`${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            onClick={() => setActiveTab('overview')}
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            Overview
          </button>
          <button
            className={`${
              activeTab === 'exams'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            onClick={() => setActiveTab('exams')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Examinations
          </button>
          <button
            className={`${
              activeTab === 'appointments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            onClick={() => setActiveTab('appointments')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Appointments
          </button>
          <button
            className={`${
              activeTab === 'documents'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </button>
          <button
            className={`${
              activeTab === 'billing'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            onClick={() => setActiveTab('billing')}
          >
            <FileBarChart2 className="h-4 w-4 mr-2" />
            Billing
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="mt-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Medical History */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 flex justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Medical History</h3>
                  <button className="text-primary-500 hover:text-primary-700">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <p className="text-gray-700">
                    {selectedPatient.medicalHistory || 'No medical history recorded'}
                  </p>
                </div>
              </div>
              
              {/* Medications */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 flex justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Medications</h3>
                  <button className="text-primary-500 hover:text-primary-700">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  {selectedPatient.medications && selectedPatient.medications.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedPatient.medications.map((medication, index) => (
                        <li key={index} className="text-gray-700">{medication}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">No medications recorded</p>
                  )}
                </div>
              </div>
              
              {/* Allergies */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 flex justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Allergies</h3>
                  <button className="text-primary-500 hover:text-primary-700">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedPatient.allergies.map((allergy, index) => (
                        <li key={index} className="text-gray-700">{allergy}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">No allergies recorded</p>
                  )}
                </div>
              </div>
              
              {/* Chart Notes */}
              <PatientChartNotes 
                patient={selectedPatient}
                examinations={examinations}
                soapNotes={soapNotes}
                onSendNotes={handleSendNotes}
              />
              
              {/* Patient Timeline */}
              <PatientTimeline patientId={id!} />
            </div>
            
            {/* Right column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6 space-y-3">
                  <button 
                    className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => navigate(`/patients/${id}/examination`)}
                  >
                    <span className="flex items-center">
                      <Eye className="h-5 w-5 mr-3 text-primary-500" />
                      New Examination
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                  <button 
                    className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => navigate('/schedule')}
                  >
                    <span className="flex items-center">
                      <CalendarPlus className="h-5 w-5 mr-3 text-secondary-500" />
                      Schedule Appointment
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                  <button 
                    className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => navigate(`/patients/${id}/pre-testing`)}
                  >
                    <span className="flex items-center">
                      <Clipboard className="h-5 w-5 mr-3 text-accent-500" />
                      Start Pre-Testing
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Upcoming Appointments */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Appointments</h3>
                  <button
                    className="text-primary-500 hover:text-primary-700 text-sm"
                    onClick={() => setActiveTab('appointments')}
                  >
                    View all
                  </button>
                </div>
                <div className="border-t border-gray-200">
                  {appointmentsLoading ? (
                    <div className="p-4 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading appointments...</p>
                    </div>
                  ) : upcomingAppointments.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {upcomingAppointments.slice(0, 3).map((appointment) => (
                        <div 
                          key={appointment.id}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/appointments/${appointment.id}`)}
                        >
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-900">{formatDate(appointment.date)}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              appointment.status === 'scheduled' ? 'bg-accent-100 text-accent-800' : 
                              appointment.status === 'checked-in' ? 'bg-primary-100 text-primary-800' :
                              appointment.status === 'in-progress' ? 'bg-warning-100 text-warning-800' :
                              'bg-success-100 text-success-800'
                            }`}>
                              {appointment.status.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(new Date(`2000-01-01T${appointment.startTime}`))} - {formatTime(new Date(`2000-01-01T${appointment.endTime}`))}
                          </div>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {appointment.type.replace('-', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-gray-500">No upcoming appointments</p>
                      <button 
                        className="mt-2 btn-outline text-xs py-1"
                        onClick={() => navigate('/schedule')}
                      >
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Schedule Appointment
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Examinations */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Examinations</h3>
                  <button
                    className="text-primary-500 hover:text-primary-700 text-sm"
                    onClick={() => setActiveTab('exams')}
                  >
                    View all
                  </button>
                </div>
                <div className="border-t border-gray-200">
                  {examsLoading ? (
                    <div className="p-4 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading examinations...</p>
                    </div>
                  ) : examinations.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {examinations.slice(0, 3).map((exam) => (
                        <div 
                          key={exam.id}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/patients/${id}/examination?exam=${exam.id}`)}
                        >
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-900">{formatDate(exam.date)}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              exam.status === 'completed' 
                                ? 'bg-success-100 text-success-800' 
                                : 'bg-warning-100 text-warning-800'
                            }`}>
                              {exam.status === 'completed' ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 truncate">{exam.chiefComplaint}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-gray-500">No examinations yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'exams' && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Examination History</h3>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate(`/patients/${id}/examination`)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Examination
              </button>
            </div>
            <div className="border-t border-gray-200">
              {examsLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                  <p className="mt-2 text-gray-500">Loading examinations...</p>
                </div>
              ) : examinations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chief Complaint
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Diagnosis
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Doctor
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {examinations.map((exam) => (
                        <tr 
                          key={exam.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/patients/${id}/examination?exam=${exam.id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatDate(exam.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {exam.chiefComplaint}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                            {exam.diagnosis && exam.diagnosis.length > 0 
                              ? exam.diagnosis[0] 
                              : 'No diagnosis'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              exam.status === 'completed' 
                                ? 'bg-success-100 text-success-800' 
                                : 'bg-warning-100 text-warning-800'
                            }`}>
                              {exam.status === 'completed' ? 'Completed' : 'In Progress'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                            Dr. Sarah Johnson
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-primary-600 hover:text-primary-900 mr-4">
                              View
                            </button>
                            {exam.status === 'completed' && (
                              <button 
                                className="text-secondary-600 hover:text-secondary-900"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/patients/${id}/soap?exam=${exam.id}`);
                                }}
                              >
                                SOAP
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No examination history</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This patient hasn't had any examinations yet
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => navigate(`/patients/${id}/examination`)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Examination
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Appointments</h3>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate('/schedule')}
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </button>
              </div>
              <div className="border-t border-gray-200">
                {appointmentsLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                    <p className="mt-2 text-gray-500">Loading appointments...</p>
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Doctor
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {upcomingAppointments.map((appointment) => (
                          <tr 
                            key={appointment.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/appointments/${appointment.id}`)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatDate(appointment.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTime(new Date(`2000-01-01T${appointment.startTime}`))} - {formatTime(new Date(`2000-01-01T${appointment.endTime}`))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                              {appointment.type.replace('-', ' ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                appointment.status === 'scheduled' ? 'bg-accent-100 text-accent-800' :
                                appointment.status === 'checked-in' ? 'bg-primary-100 text-primary-800' :
                                appointment.status === 'in-progress' ? 'bg-warning-100 text-warning-800' :
                                'bg-success-100 text-success-800'
                              }`}>
                                {appointment.status.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                              {appointment.doctorId ? 'Dr. Smith' : 'Not assigned'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end">
                                <button 
                                  className="text-primary-600 hover:text-primary-900"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/appointments/${appointment.id}`);
                                  }}
                                >
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Schedule an appointment for this patient
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => navigate('/schedule')}
                      >
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Schedule Appointment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {pastAppointments.length > 0 && (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Past Appointments</h3>
                </div>
                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Doctor
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pastAppointments.slice(0, 10).map((appointment) => (
                          <tr 
                            key={appointment.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/appointments/${appointment.id}`)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{formatDate(appointment.date)}</div>
                              <div className="text-sm text-gray-500">{formatTime(new Date(`2000-01-01T${appointment.startTime}`))}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                              {appointment.type.replace('-', ' ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                appointment.status === 'completed' ? 'bg-success-100 text-success-800' :
                                appointment.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                'bg-warning-100 text-warning-800'
                              }`}>
                                {appointment.status.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                              {appointment.doctorId ? 'Dr. Smith' : 'Not assigned'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-primary-600 hover:text-primary-900">
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {pastAppointments.length > 10 && (
                    <div className="px-6 py-3 text-center border-t border-gray-200">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View all {pastAppointments.length} past appointments
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PatientDocumentsList
                patientId={id!}
                documents={uploadedDocuments}
                onDeleteDocument={handleDeleteDocument}
              />
            </div>
            <div>
              <PatientDocumentsUploader
                patientId={id!}
                onDocumentUploaded={handleDocumentUploaded}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Billing tabs - Mobile-optimized */}
            <div className="bg-white shadow-sm rounded-md overflow-hidden">
              <div className="px-4 py-3 sm:px-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-y-2 gap-x-4">
                  <button
                    className={`pb-2 border-b-2 font-medium text-sm ${
                      activeBillingTab === 'overview'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveBillingTab('overview')}
                  >
                    Overview
                  </button>
                  <button
                    className={`pb-2 border-b-2 font-medium text-sm ${
                      activeBillingTab === 'insurance'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveBillingTab('insurance')}
                  >
                    Insurance
                  </button>
                  <button
                    className={`pb-2 border-b-2 font-medium text-sm ${
                      activeBillingTab === 'eligibility'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveBillingTab('eligibility')}
                  >
                    Eligibility
                  </button>
                  <button
                    className={`pb-2 border-b-2 font-medium text-sm ${
                      activeBillingTab === 'self-pay'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveBillingTab('self-pay')}
                  >
                    Self-Pay
                  </button>
                  <button
                    className={`pb-2 border-b-2 font-medium text-sm ${
                      activeBillingTab === 'history'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveBillingTab('history')}
                  >
                    History
                  </button>
                </div>
              </div>
            </div>
            
            {/* Billing tab content */}
            {activeBillingTab === 'overview' && (
              <BillingOverview patientId={id!} />
            )}
            
            {activeBillingTab === 'insurance' && (
              <BillingProviderForm
                patientId={id!}
                onSave={handleSaveInsurance}
                onCancel={() => setActiveBillingTab('overview')}
              />
            )}
            
            {activeBillingTab === 'eligibility' && (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Insurance Eligibility</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Check and verify patient's insurance eligibility and benefits
                  </p>
                </div>
                
                <div className="p-4">
                  <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-primary-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-primary-800">Eligibility Status</h3>
                        <p className="mt-1 text-sm text-primary-700">
                          This patient's insurance has been verified and is currently active. Last verified on June 1, 2024.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-900">Blue Cross Blue Shield</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Policy #BC987654321 • Group #GRP12345</p>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Coverage Period</p>
                            <p className="text-sm font-medium">01/01/2024 - 12/31/2024</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Network Status</p>
                            <p className="text-sm font-medium flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1 text-success-500" />
                              In-Network
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Plan Type</p>
                            <p className="text-sm font-medium">PPO</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Verification Date</p>
                            <p className="text-sm font-medium">06/01/2024</p>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Deductible Information</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Individual Deductible</p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-sm font-medium">$1,500.00</p>
                                <p className="text-xs text-gray-500">$500.00 met</p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Family Deductible</p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-sm font-medium">$3,000.00</p>
                                <p className="text-xs text-gray-500">$1,200.00 met</p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Vision Benefits</h5>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Cost</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Eye Exam</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    <CheckCircle className="h-4 w-4 text-success-500" />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">$20 copay</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Once every 12 months</td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Frames</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    <CheckCircle className="h-4 w-4 text-success-500" />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">20% coinsurance</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Once every 24 months</td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Lenses</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    <CheckCircle className="h-4 w-4 text-success-500" />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">$25 copay</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Once every 12 months</td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Contact Lenses</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    <CheckCircle className="h-4 w-4 text-success-500" />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">20% coinsurance</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">In lieu of glasses</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Medical Benefits</h5>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Cost</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Medical Eye Exam</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    <CheckCircle className="h-4 w-4 text-success-500" />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">$20 copay</td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Diagnostic Testing</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    <CheckCircle className="h-4 w-4 text-success-500" />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">20% coinsurance</td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Treatment of Eye Disease</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    <CheckCircle className="h-4 w-4 text-success-500" />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">20% coinsurance</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-900">VSP Vision Care</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Policy #VSP123456789 • Group #VSPGRP789</p>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Coverage Period</p>
                            <p className="text-sm font-medium">01/01/2024 - 12/31/2024</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Network Status</p>
                            <p className="text-sm font-medium flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1 text-success-500" />
                              In-Network
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Plan Type</p>
                            <p className="text-sm font-medium">Vision</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Verification Date</p>
                            <p className="text-sm font-medium">05/15/2024</p>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Vision Benefits</h5>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Cost</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Eye Exam</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    <CheckCircle className="h-4 w-4 text-success-500" />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">$10 copay</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Once every 12 months</td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Frames</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    <CheckCircle className="h-4 w-4 text-success-500" />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">$150 allowance</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Once every 24 months</td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Lenses</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    <CheckCircle className="h-4 w-4 text-success-500" />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">$25 copay</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Once every 12 months</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeBillingTab === 'self-pay' && (
              <SelfPayForm
                patientId={id!}
                onSave={handleSaveSelfPay}
                onCancel={() => setActiveBillingTab('overview')}
              />
            )}
            
            {activeBillingTab === 'history' && (
              <BillingHistory patientId={id!} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetailsPage;