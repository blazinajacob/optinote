import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarPlus, Edit, Eye, FileText, History, ChevronRight, PlusCircle, Clipboard, Calendar, Clock, User, CheckCircle, XCircle, Menu, FileCheck, FileBarChart2, Stethoscope, MessageSquare, Heart, Activity, Film, UserPlus, Sparkles, BookOpen, Briefcase, Activity as ActivityIcon, Dumbbell, Utensils, Brain, Users, Droplet as DropletPlus, X, Plus, ArrowRight, Phone, Mail } from 'lucide-react';
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
import AISummaryGenerator from '../../components/ai/AISummaryGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

const PatientDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedPatient, getPatientById, updatePatient, isLoading: patientLoading } = usePatientStore();
  const { examinations, getExaminationsByPatientId, soapNotes, getSoapNotesByPatientId, isLoading: examsLoading } = useExaminationStore();
  const { appointments, getAppointmentsByPatientId, isLoading: appointmentsLoading } = useScheduleStore();
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [activeBillingTab, setActiveBillingTab] = useState<'overview' | 'insurance' | 'self-pay' | 'history'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  
  const tabs = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: Stethoscope 
    },
    { 
      id: 'medical-history', 
      name: 'Medical History', 
      icon: ActivityIcon 
    },
    { 
      id: 'background', 
      name: 'Background', 
      icon: User 
    },
    { 
      id: 'lifestyle', 
      name: 'Lifestyle & Habits', 
      icon: Heart 
    },
    { 
      id: 'exams', 
      name: 'Examinations', 
      icon: Eye 
    },
    { 
      id: 'appointments', 
      name: 'Appointments', 
      icon: Calendar 
    },
    { 
      id: 'documents', 
      name: 'Documents', 
      icon: FileText 
    },
    { 
      id: 'chart-notes', 
      name: 'Chart Notes', 
      icon: BookOpen 
    },
    { 
      id: 'timeline', 
      name: 'Timeline', 
      icon: History 
    },
    { 
      id: 'billing', 
      name: 'Billing', 
      icon: FileBarChart2 
    }
  ];
  
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
    // In a real app, this would refresh the documents list
    console.log('Document uploaded:', document);
  };
  
  // Handle document deletion
  const handleDeleteDocument = (documentId: string) => {
    // In a real app, this would delete the document
    console.log('Delete document:', documentId);
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
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
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

  // Calculate age from date of birth
  const age = dayjs().diff(dayjs(selectedPatient.dateOfBirth), 'year');

  // Format content based on the active tab
  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {showAISummary && (
              <AISummaryGenerator
                type="patient"
                data={selectedPatient}
              />
            )}
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Phone</h4>
                  <p className="text-base">{selectedPatient.phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Email</h4>
                  <p className="text-base">{selectedPatient.email || 'Not provided'}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Address</h4>
                  <p className="text-base">{selectedPatient.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
              </div>
              <div className="p-6">
                {selectedPatient.emergencyContact ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Name</h4>
                      <p className="text-base">{selectedPatient.emergencyContact.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Relationship</h4>
                      <p className="text-base">{selectedPatient.emergencyContact.relationship || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Phone</h4>
                      <p className="text-base">{selectedPatient.emergencyContact.phone}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No emergency contact information on file</p>
                )}
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Insurance Information</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Insurance Provider</h4>
                  <p className="text-base">{selectedPatient.insuranceProvider || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Policy Number</h4>
                  <p className="text-base">{selectedPatient.insurancePolicyNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
                <button
                  className="text-sm text-primary-600 hover:text-primary-700"
                  onClick={() => setActiveTab('appointments')}
                >
                  View all
                </button>
              </div>
              <div>
                {upcomingAppointments.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {upcomingAppointments.slice(0, 3).map((appointment) => (
                      <div 
                        key={appointment.id} 
                        className="p-6 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/appointments/${appointment.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-medium text-gray-900">{formatDate(appointment.date)}</p>
                            <div className="mt-1 text-sm text-gray-500 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTime(new Date(`2000-01-01T${appointment.startTime}`))} - {formatTime(new Date(`2000-01-01T${appointment.endTime}`))}
                            </div>
                            <div className="mt-1 text-sm text-gray-500 capitalize">
                              {appointment.type.replace('-', ' ')}
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            appointment.status === 'scheduled' ? 'bg-accent-100 text-accent-800' :
                            appointment.status === 'checked-in' ? 'bg-primary-100 text-primary-800' :
                            appointment.status === 'in-progress' ? 'bg-warning-100 text-warning-800' :
                            'bg-success-100 text-success-800'
                          }`}>
                            {appointment.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Schedule an appointment for this patient
                    </p>
                    <button 
                      className="mt-3 btn-outline text-sm"
                      onClick={() => navigate('/schedule')}
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'medical-history':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">Medical History</h3>
                <button className="text-primary-600 hover:text-primary-800"
                  onClick={() => setIsEditing(true)}>
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                {selectedPatient.medicalHistory ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPatient.medicalHistory}</p>
                ) : (
                  <p className="text-gray-500 italic">No medical history recorded</p>
                )}
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">Allergies</h3>
                <button className="text-primary-600 hover:text-primary-800"
                  onClick={() => setIsEditing(true)}>
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedPatient.allergies.map((allergy, index) => (
                      <li key={index} className="text-gray-700">{allergy}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No allergies recorded</p>
                )}
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">Current Medications</h3>
                <button className="text-primary-600 hover:text-primary-800"
                  onClick={() => setIsEditing(true)}>
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                {selectedPatient.medications && selectedPatient.medications.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedPatient.medications.map((medication, index) => (
                      <li key={index} className="text-gray-700">{medication}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No medications recorded</p>
                )}
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">Surgeries</h3>
                <button className="text-primary-600 hover:text-primary-800"
                  onClick={() => setIsEditing(true)}>
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                {selectedPatient.surgeries && selectedPatient.surgeries.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedPatient.surgeries.map((surgery, index) => (
                      <li key={index} className="text-gray-700">{surgery}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No surgeries recorded</p>
                )}
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">Family Medical History</h3>
                <button className="text-primary-600 hover:text-primary-800"
                  onClick={() => setIsEditing(true)}>
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                {selectedPatient.familyHistory ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPatient.familyHistory}</p>
                ) : (
                  <p className="text-gray-500 italic">No family history recorded</p>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'background':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                <button className="text-primary-600 hover:text-primary-800"
                  onClick={() => setIsEditing(true)}>
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Occupation</h4>
                  <p className="text-base">{selectedPatient.occupation || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Blood Type</h4>
                  <p className="text-base">{selectedPatient.bloodType || 'Unknown'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Age</h4>
                  <p className="text-base">{age} years</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Height</h4>
                  <p className="text-base">{selectedPatient.height ? `${selectedPatient.height} cm` : 'Not recorded'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Weight</h4>
                  <p className="text-base">{selectedPatient.weight ? `${selectedPatient.weight} kg` : 'Not recorded'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Gender</h4>
                  <p className="text-base capitalize">{selectedPatient.gender}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">Background Information</h3>
                <button className="text-primary-600 hover:text-primary-800"
                  onClick={() => setIsEditing(true)}>
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                {selectedPatient.background ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Primary Language</h4>
                      <p className="text-base">{selectedPatient.background.language || 'Not recorded'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Ethnicity</h4>
                      <p className="text-base">{selectedPatient.background.ethnicity || 'Not recorded'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Race</h4>
                      <p className="text-base">{selectedPatient.background.race || 'Not recorded'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No background information recorded</p>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'lifestyle':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">Substance Use</h3>
                <button className="text-primary-600 hover:text-primary-800"
                  onClick={() => setIsEditing(true)}>
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                {selectedPatient.substanceUse ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Smoking</h4>
                      <p className="text-base">{selectedPatient.substanceUse.smoking || 'Not recorded'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Alcohol Use</h4>
                      <p className="text-base">{selectedPatient.substanceUse.alcohol || 'Not recorded'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Recreational Drug Use</h4>
                      <p className="text-base">{selectedPatient.substanceUse.drugs || 'Not recorded'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No substance use information recorded</p>
                )}
              </div>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between">
                <h3 className="text-lg font-medium text-gray-900">Lifestyle Factors</h3>
                <button className="text-primary-600 hover:text-primary-800"
                  onClick={() => setIsEditing(true)}>
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Nutrition</h4>
                  <p className="text-base">{selectedPatient.nutrition || 'Not recorded'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Exercise</h4>
                  <p className="text-base">{selectedPatient.exercise || 'Not recorded'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Stress</h4>
                  <p className="text-base">{selectedPatient.stress || 'Not recorded'}</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'exams':
        return (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-medium text-gray-900">Examination History</h3>
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
                <div className="p-6 text-center">
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
        );
      
      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
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
                  <div className="p-6 text-center">
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
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Past Appointments</h3>
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
        );
        
      case 'documents':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PatientDocumentsList
                patientId={id!}
                documents={[]}
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
        );
        
      case 'chart-notes':
        return (
          <PatientChartNotes 
            patient={selectedPatient}
            examinations={examinations}
            soapNotes={soapNotes}
            onSendNotes={handleSendNotes}
          />
        );
        
      case 'timeline':
        return (
          <PatientTimeline patientId={id!} />
        );
        
      case 'billing':
        return (
          <div className="space-y-6">
            {/* Billing tabs */}
            <div className="bg-white shadow-sm rounded-md overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex flex-wrap gap-y-2 gap-x-6">
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
        );
      
      default:
        return <div>Tab content not found</div>;
    }
  };

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
            {!showAISummary && (
              <button
                type="button" 
                className="btn-outline"
                onClick={() => setShowAISummary(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Summary
              </button>
            )}
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

      {isEditing ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6 p-6">
          <PatientInfoEditForm
            patient={selectedPatient}
            onUpdate={handleUpdatePatient}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar with patient info and tabs */}
          <div className="w-full md:w-64 flex-shrink-0">
            {/* Patient summary card */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-4">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-xl">
                      {selectedPatient.firstName.charAt(0)}{selectedPatient.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {age} years old • {selectedPatient.gender}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{formatDate(selectedPatient.dateOfBirth)}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{selectedPatient.phone}</span>
                  </div>
                  {selectedPatient.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="truncate">{selectedPatient.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Mobile Menu Button - only visible on mobile */}
            <div className="md:hidden mb-4">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center">
                  <Menu className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">
                    {tabs.find(tab => tab.id === activeTab)?.name || 'Menu'}
                  </span>
                </div>
                <ArrowRight className={`h-5 w-5 text-gray-500 transition-transform ${mobileMenuOpen ? 'rotate-90' : ''}`} />
              </button>
              
              {/* Mobile dropdown menu */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-lg shadow-lg border border-gray-200 mt-1 overflow-hidden"
                  >
                    <div className="py-2">
                      {tabs.map(tab => (
                        <button
                          key={tab.id}
                          className={cn(
                            "w-full flex items-center px-4 py-3 text-left text-sm hover:bg-gray-50",
                            activeTab === tab.id ? "bg-primary-50 text-primary-700" : "text-gray-700"
                          )}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <tab.icon className="h-5 w-5 mr-3" />
                          {tab.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Vertical Tabs - Hidden on mobile */}
            <div className="hidden md:block bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center px-4 py-3 text-sm font-medium rounded-md w-full text-left transition-colors relative group",
                          isActive 
                            ? "bg-primary-50 text-primary-700" 
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <tab.icon className={cn(
                          "mr-3 h-5 w-5 transition-colors",
                          isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-500"
                        )} />
                        {tab.name}
                        {isActive && (
                          <motion.div 
                            className="absolute inset-y-0 left-0 w-1 bg-primary-600 rounded-r-full" 
                            layoutId="sidebar-indicator"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
              
              <div className="border-t border-gray-200 p-4">
                <div className="space-y-3">
                  <button 
                    className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
                    onClick={() => navigate(`/patients/${id}/examination`)}
                  >
                    <span className="flex items-center">
                      <Eye className="h-5 w-5 mr-3 text-primary-500" />
                      New Examination
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                  <button 
                    className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
                    onClick={() => navigate('/schedule')}
                  >
                    <span className="flex items-center">
                      <CalendarPlus className="h-5 w-5 mr-3 text-secondary-500" />
                      Schedule Appointment
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetailsPage;