import { useState } from 'react';
import { 
  Save, Download, Mail, Phone, ClipboardCheck, Loader2, 
  CheckCircle, AlertCircle, FileText, User, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Patient, Examination, SOAPNote } from '../../types';
import { cn } from '../../lib/utils';
import { formatDate } from '../../lib/utils';

interface PatientChartNotesProps {
  patient: Patient;
  examinations: Examination[];
  soapNotes: SOAPNote[];
  onSendNotes: (examinationId: string, recipientType: 'patient' | 'doctor' | 'other', recipientInfo: string) => Promise<void>;
  className?: string;
}

const PatientChartNotes = ({
  patient,
  examinations,
  soapNotes,
  onSendNotes,
  className
}: PatientChartNotesProps) => {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [recipientType, setRecipientType] = useState<'patient' | 'doctor' | 'other'>('patient');
  const [recipientInfo, setRecipientInfo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Find selected examination and its related SOAP note
  const selectedExam = selectedExamId 
    ? examinations.find(exam => exam.id === selectedExamId)
    : null;
    
  const selectedSoapNote = selectedExamId
    ? soapNotes.find(note => note.examinationId === selectedExamId)
    : null;
  
  // Prepare data when selecting an exam
  const handleExamSelect = (examId: string) => {
    setSelectedExamId(examId);
    setRecipientType('patient');
    setRecipientInfo(patient.email || '');
    setSuccessMessage(null);
    setErrorMessage(null);
  };
  
  // Handle form submission
  const handleSendNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExamId) {
      setErrorMessage('Please select an examination');
      return;
    }
    
    if (!recipientInfo.trim()) {
      setErrorMessage('Please enter recipient information');
      return;
    }
    
    setIsSending(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      await onSendNotes(selectedExamId, recipientType, recipientInfo);
      setSuccessMessage(`Chart notes successfully sent to ${recipientType === 'patient' ? 'patient' : recipientType === 'doctor' ? 'referring doctor' : 'recipient'}`);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send chart notes');
    } finally {
      setIsSending(false);
    }
  };
  
  // Get recipient info placeholder based on type
  const getRecipientPlaceholder = () => {
    switch (recipientType) {
      case 'patient':
        return "Patient's email address";
      case 'doctor':
        return "Doctor's email address";
      case 'other':
        return "Recipient's email address";
      default:
        return "Email address";
    }
  };
  
  return (
    <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
      <div className="px-4 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Chart Notes</h3>
        <p className="mt-1 text-sm text-gray-500">
          View and share patient chart notes
        </p>
      </div>
      
      <div className="p-4">
        {/* Notes Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Examination
          </label>
          <select
            value={selectedExamId || ''}
            onChange={(e) => handleExamSelect(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Select an examination...</option>
            {examinations
              .filter(exam => exam.status === 'completed')
              .map((exam) => {
                const hasSoapNote = soapNotes.some(note => note.examinationId === exam.id);
                return (
                  <option key={exam.id} value={exam.id} disabled={!hasSoapNote}>
                    {formatDate(exam.date)} - {exam.chiefComplaint.slice(0, 30)}
                    {!hasSoapNote ? ' (No SOAP note)' : ''}
                  </option>
                );
              })}
          </select>
          {examinations.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No completed examinations found for this patient.
            </p>
          )}
        </div>
        
        {selectedExam && !selectedSoapNote && (
          <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-md text-warning-800">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-warning-400 mr-2" />
              <p className="text-sm">
                No SOAP note is available for this examination. The doctor must complete a SOAP note before it can be shared.
              </p>
            </div>
          </div>
        )}
        
        {selectedSoapNote && (
          <>
            {/* SOAP Note Preview */}
            <div className="mb-6 border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary-500" />
                  SOAP Note Preview
                </h4>
                <button
                  type="button"
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  onClick={() => {
                    // In a real app, this would generate and download a PDF
                    console.log('Download SOAP note');
                  }}
                >
                  <Download className="h-4 w-4 mr-1 inline" />
                  Download PDF
                </button>
              </div>
              
              <div className="mt-3 space-y-4 border-t border-gray-200 pt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-xs">
                    <p className="text-gray-500 mb-1">Patient</p>
                    <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-gray-500 mb-1">Date</p>
                    <p className="font-medium">{formatDate(selectedExam.date)}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-1">S - Subjective</h5>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {selectedSoapNote.subjective.length > 150 
                      ? selectedSoapNote.subjective.slice(0, 150) + '...' 
                      : selectedSoapNote.subjective}
                  </p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-1">O - Objective</h5>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {selectedSoapNote.objective.length > 150 
                      ? selectedSoapNote.objective.slice(0, 150) + '...' 
                      : selectedSoapNote.objective}
                  </p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-1">A - Assessment</h5>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {selectedSoapNote.assessment.length > 150 
                      ? selectedSoapNote.assessment.slice(0, 150) + '...' 
                      : selectedSoapNote.assessment}
                  </p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-1">P - Plan</h5>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {selectedSoapNote.plan.length > 150 
                      ? selectedSoapNote.plan.slice(0, 150) + '...' 
                      : selectedSoapNote.plan}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Send Form */}
            <form onSubmit={handleSendNotes}>
              {errorMessage && (
                <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-error-400 mr-2" />
                    <span className="text-error-800 text-sm">{errorMessage}</span>
                  </div>
                </div>
              )}
              
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-success-50 border border-success-200 rounded-md"
                >
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-success-400 mr-2" />
                    <span className="text-success-800 text-sm">{successMessage}</span>
                  </div>
                </motion.div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Send To
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className={cn(
                      "border rounded-md p-2 flex items-center cursor-pointer",
                      recipientType === 'patient' ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:bg-gray-50"
                    )}>
                      <input
                        type="radio"
                        className="sr-only"
                        name="recipientType"
                        value="patient"
                        checked={recipientType === 'patient'}
                        onChange={() => {
                          setRecipientType('patient');
                          setRecipientInfo(patient.email || '');
                        }}
                      />
                      <User className={cn(
                        "h-4 w-4 mr-2",
                        recipientType === 'patient' ? "text-primary-600" : "text-gray-400"
                      )} />
                      <span className="text-sm font-medium">Patient</span>
                    </label>
                    
                    <label className={cn(
                      "border rounded-md p-2 flex items-center cursor-pointer",
                      recipientType === 'doctor' ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:bg-gray-50"
                    )}>
                      <input
                        type="radio"
                        className="sr-only"
                        name="recipientType"
                        value="doctor"
                        checked={recipientType === 'doctor'}
                        onChange={() => {
                          setRecipientType('doctor');
                          setRecipientInfo('');
                        }}
                      />
                      <User className={cn(
                        "h-4 w-4 mr-2",
                        recipientType === 'doctor' ? "text-primary-600" : "text-gray-400"
                      )} />
                      <span className="text-sm font-medium">Doctor</span>
                    </label>
                    
                    <label className={cn(
                      "border rounded-md p-2 flex items-center cursor-pointer",
                      recipientType === 'other' ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:bg-gray-50"
                    )}>
                      <input
                        type="radio"
                        className="sr-only"
                        name="recipientType"
                        value="other"
                        checked={recipientType === 'other'}
                        onChange={() => {
                          setRecipientType('other');
                          setRecipientInfo('');
                        }}
                      />
                      <Mail className={cn(
                        "h-4 w-4 mr-2",
                        recipientType === 'other' ? "text-primary-600" : "text-gray-400"
                      )} />
                      <span className="text-sm font-medium">Other</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="recipientInfo">
                    {recipientType === 'patient' ? "Patient's Email" :
                     recipientType === 'doctor' ? "Doctor's Email" :
                     "Recipient's Email"}
                  </label>
                  <input
                    type="email"
                    id="recipientInfo"
                    value={recipientInfo}
                    onChange={(e) => setRecipientInfo(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder={getRecipientPlaceholder()}
                    required
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSending || !selectedExamId || !recipientInfo.trim()}
                  >
                    {isSending ? (
                      <span className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Chart Notes
                      </span>
                    )}
                  </button>
                  
                  <p className="mt-2 text-xs text-gray-500">
                    Chart notes will be sent securely as a PDF attachment.
                  </p>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
      
      {/* Patient Contact Info */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Patient Contact</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {patient.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <span>{patient.email}</span>
            </div>
          )}
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <span>{patient.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientChartNotes;