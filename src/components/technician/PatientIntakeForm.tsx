import { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, AlertCircle, Edit, Save, 
  X, AlertTriangle, MessageSquare, Mic, MicOff, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Patient, Appointment } from '../../types';
import { cn } from '../../lib/utils';
import { formatDate } from '../../lib/utils';
import { AIFormField } from '../ai/AIFormAssistant';
import FormWithAIAssistant from '../ai/FormWithAIAssistant';

interface PatientIntakeFormProps {
  patient: Patient;
  appointment?: Appointment;
  onSave: (data: { chiefComplaint: string; notes?: string }) => Promise<void>;
  className?: string;
}

const PatientIntakeForm = ({
  patient,
  appointment,
  onSave,
  className
}: PatientIntakeFormProps) => {
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [useAIAssistant, setUseAIAssistant] = useState(false);
  
  // Voice recognition
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecognitionError, setHasRecognitionError] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Check if browser supports speech recognition
  const isSpeechRecognitionSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize form with appointment data if available
  useEffect(() => {
    if (appointment?.notes) {
      setNotes(appointment.notes);
    }
  }, [appointment]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (isSpeechRecognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;
        
        speechRecognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join(' ');
          
          if (document.activeElement?.id === 'chiefComplaint') {
            setChiefComplaint(transcript);
          } else if (document.activeElement?.id === 'additionalNotes') {
            setNotes(transcript);
          } else {
            // Default to chief complaint if no input is focused
            setChiefComplaint(transcript);
          }
        };
        
        speechRecognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          setHasRecognitionError(true);
          
          // Reset error state after 3 seconds
          setTimeout(() => {
            setHasRecognitionError(false);
          }, 3000);
        };
      }
    }
    
    return () => {
      if (isRecording && speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        setIsRecording(false);
      }
    };
  }, [isSpeechRecognitionSupported]);
  
  // Toggle recording
  const toggleRecording = () => {
    if (!isSpeechRecognitionSupported) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (isRecording) {
      speechRecognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setHasRecognitionError(false);
      
      try {
        speechRecognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording:', err);
        setHasRecognitionError(true);
        
        setTimeout(() => {
          setHasRecognitionError(false);
        }, 3000);
      }
    }
  };

  const handleSubmit = async () => {
    if (!chiefComplaint.trim()) {
      setError('Chief complaint is required');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      await onSave({
        chiefComplaint: chiefComplaint.trim(),
        notes: notes.trim() || undefined
      });
      
      setSuccess('Patient intake information saved successfully');
      
      // Reset success message after 2 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to save intake information');
    } finally {
      setIsSaving(false);
      
      // Stop recording if it was active
      if (isRecording) {
        speechRecognitionRef.current?.stop();
        setIsRecording(false);
      }
    }
  };

  // AI form fields
  const aiFormFields: AIFormField[] = [
    {
      id: 'chiefComplaint',
      name: 'chiefComplaint',
      type: 'textarea',
      label: 'Chief Complaint',
      value: chiefComplaint,
      placeholder: 'Describe the patient\'s main reason for visit',
      required: true
    },
    {
      id: 'notes',
      name: 'notes',
      type: 'textarea',
      label: 'Additional Notes',
      value: notes,
      placeholder: 'Any additional information or context'
    }
  ];

  // Handle AI form submission
  const handleAIFormSubmit = async (formData: Record<string, any>) => {
    try {
      setChiefComplaint(formData.chiefComplaint || '');
      setNotes(formData.notes || '');
      
      // Save the data
      await onSave({
        chiefComplaint: formData.chiefComplaint.trim(),
        notes: formData.notes?.trim() || undefined
      });
      
      setSuccess('Patient intake information saved successfully');
      
      // Reset success message after 2 seconds
      setTimeout(() => {
        setSuccess(null);
        setUseAIAssistant(false);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to save intake information');
    }
  };

  return (
    <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
      <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Patient Intake</h3>
          <p className="mt-1 text-sm text-gray-600">
            Record the patient's chief complaint and reason for visit
          </p>
        </div>
        
        <button
          type="button"
          className={cn(
            "text-sm font-medium flex items-center",
            useAIAssistant ? "text-primary-600" : "text-gray-600 hover:text-primary-600"
          )}
          onClick={() => setUseAIAssistant(!useAIAssistant)}
        >
          {useAIAssistant ? (
            <>
              <X className="h-4 w-4 mr-1.5" />
              Close AI Assistant
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 mr-1.5" />
              Use AI Assistant
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="m-4 p-3 bg-error-50 border border-error-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-error-400 mr-2 flex-shrink-0" />
            <span className="text-error-800 text-sm">{error}</span>
          </div>
        </div>
      )}
      
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="m-4 p-3 bg-success-50 border border-success-200 rounded-md"
        >
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-success-400 mr-2 flex-shrink-0" />
            <span className="text-success-800 text-sm">{success}</span>
          </div>
        </motion.div>
      )}
      
      {hasRecognitionError && (
        <div className="m-4 p-3 bg-error-50 border border-error-100 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-error-400 mr-2 flex-shrink-0" />
            <span className="text-error-800 text-sm">There was an error with speech recognition. Please try again or type your input.</span>
          </div>
        </div>
      )}
      
      {useAIAssistant ? (
        <div className="p-4">
          <FormWithAIAssistant
            title="Patient Intake"
            description="Record the patient's chief complaint and any additional notes"
            fields={aiFormFields}
            onSubmit={handleAIFormSubmit}
            submitLabel={isSaving ? 'Saving...' : 'Save Intake Information'}
            contextHint={`The patient is ${patient.firstName} ${patient.lastName}, ${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years old, coming in for a ${appointment?.type || 'visit'}`}
          />
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="chiefComplaint" className="block text-sm font-medium text-gray-700 flex justify-between">
              <span>Chief Complaint <span className="text-error-600">*</span></span>
              {isSpeechRecognitionSupported && (
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={cn(
                    "p-1.5 rounded",
                    isRecording
                      ? "bg-error-100 text-error-600 animate-pulse"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              )}
            </label>
            <div className="mt-1">
              <textarea
                id="chiefComplaint"
                rows={3}
                className={cn(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500",
                  isRecording && "border-error-300 ring-1 ring-error-500"
                )}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Describe the patient's main reason for visit"
                required
              />
            </div>
            
            {isRecording && document.activeElement?.id === 'chiefComplaint' && (
              <div className="mt-1 flex items-center p-2 bg-error-50 rounded-md">
                <div className="animate-pulse flex items-center mr-2">
                  <span className="h-1.5 w-1.5 bg-error-500 rounded-full mr-0.5"></span>
                  <span className="h-2 w-2 bg-error-500 rounded-full mr-0.5"></span>
                  <span className="h-2.5 w-2.5 bg-error-500 rounded-full"></span>
                </div>
                <p className="text-xs text-error-800">Recording chief complaint...</p>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 flex justify-between">
              <span>Additional Notes</span>
              {isSpeechRecognitionSupported && (
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={cn(
                    "p-1.5 rounded",
                    isRecording && document.activeElement?.id === 'additionalNotes'
                      ? "bg-error-100 text-error-600 animate-pulse"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording && document.activeElement?.id === 'additionalNotes' ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              )}
            </label>
            <div className="mt-1">
              <textarea
                id="additionalNotes"
                rows={3}
                className={cn(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500",
                  isRecording && document.activeElement?.id === 'additionalNotes' && "border-error-300 ring-1 ring-error-500"
                )}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information or context about this visit"
              />
            </div>
            
            {isRecording && document.activeElement?.id === 'additionalNotes' && (
              <div className="mt-1 flex items-center p-2 bg-error-50 rounded-md">
                <div className="animate-pulse flex items-center mr-2">
                  <span className="h-1.5 w-1.5 bg-error-500 rounded-full mr-0.5"></span>
                  <span className="h-2 w-2 bg-error-500 rounded-full mr-0.5"></span>
                  <span className="h-2.5 w-2.5 bg-error-500 rounded-full"></span>
                </div>
                <p className="text-xs text-error-800">Recording additional notes...</p>
              </div>
            )}
          </div>
          
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="rounded-md bg-warning-50 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-warning-400" />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-warning-700">
                    <span className="font-medium">Allergies:</span>{' '}
                    {patient.allergies.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-3 border-t border-gray-200 mt-4">
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isSaving || !chiefComplaint.trim()}
            >
              {isSaving ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Intake Information
                </span>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Patient Information Summary */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Patient Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Name</p>
            <p className="font-medium">{patient.firstName} {patient.lastName}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Date of Birth</p>
            <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Patient ID</p>
            <p className="font-medium">{patient.id}</p>
          </div>
        </div>
        
        {appointment && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Appointment Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Type</p>
                <p className="font-medium capitalize">{appointment.type.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Date</p>
                <p className="font-medium">{formatDate(appointment.date)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Status</p>
                <p className="font-medium capitalize">{appointment.status.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientIntakeForm;

// Define the webkitSpeechRecognition interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}