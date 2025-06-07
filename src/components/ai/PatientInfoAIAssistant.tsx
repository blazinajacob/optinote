import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, X, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { processFormInput } from '../../lib/openai';
import { Patient } from '../../types';

export interface PatientInfoAIAssistantProps {
  patient: Patient;
  onUpdatePatient: (updatedData: Partial<Patient>) => Promise<void>;
  className?: string;
}

const PatientInfoAIAssistant = ({
  patient,
  onUpdatePatient,
  className
}: PatientInfoAIAssistantProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [hasRecognitionError, setHasRecognitionError] = useState(false);
  
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Check if the browser supports speech recognition
  const isSpeechRecognitionSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  
  // Initialize speech recognition if supported
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
            
          setInput(transcript);
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
  
  // Toggle recording state
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
  
  // Helper function to determine if a value is empty
  const isEmpty = (value: any): boolean => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };
  
  // Process the input using AI
  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    setLastUpdate(null);
    
    try {
      // Convert patient to form fields for the AI processor
      const fields = [
        // Basic information
        {
          id: 'medicalHistory',
          name: 'medicalHistory',
          type: 'textarea',
          label: 'Medical History',
          value: patient.medicalHistory || ''
        },
        {
          id: 'medications',
          name: 'medications',
          type: 'array',
          label: 'Medications',
          value: patient.medications || []
        },
        {
          id: 'allergies',
          name: 'allergies',
          type: 'array',
          label: 'Allergies',
          value: patient.allergies || []
        },
        {
          id: 'insuranceProvider',
          name: 'insuranceProvider',
          type: 'text',
          label: 'Insurance Provider',
          value: patient.insuranceProvider || ''
        },
        {
          id: 'insurancePolicyNumber',
          name: 'insurancePolicyNumber',
          type: 'text',
          label: 'Insurance Policy Number',
          value: patient.insurancePolicyNumber || ''
        },
        {
          id: 'email',
          name: 'email',
          type: 'email',
          label: 'Email',
          value: patient.email || ''
        },
        {
          id: 'phone',
          name: 'phone',
          type: 'tel',
          label: 'Phone',
          value: patient.phone
        },
        {
          id: 'address',
          name: 'address',
          type: 'textarea',
          label: 'Address',
          value: patient.address || ''
        },
        // New fields
        {
          id: 'emergencyContactName',
          name: 'emergencyContactName',
          type: 'text',
          label: 'Emergency Contact Name',
          value: patient.emergencyContact?.name || ''
        },
        {
          id: 'emergencyContactRelationship',
          name: 'emergencyContactRelationship',
          type: 'text',
          label: 'Emergency Contact Relationship',
          value: patient.emergencyContact?.relationship || ''
        },
        {
          id: 'emergencyContactPhone',
          name: 'emergencyContactPhone',
          type: 'tel',
          label: 'Emergency Contact Phone',
          value: patient.emergencyContact?.phone || ''
        },
        {
          id: 'language',
          name: 'language',
          type: 'text',
          label: 'Language',
          value: patient.background?.language || ''
        },
        {
          id: 'ethnicity',
          name: 'ethnicity',
          type: 'text',
          label: 'Ethnicity',
          value: patient.background?.ethnicity || ''
        },
        {
          id: 'race',
          name: 'race',
          type: 'text',
          label: 'Race',
          value: patient.background?.race || ''
        },
        {
          id: 'occupation',
          name: 'occupation',
          type: 'text',
          label: 'Occupation',
          value: patient.occupation || ''
        },
        {
          id: 'bloodType',
          name: 'bloodType',
          type: 'text',
          label: 'Blood Type',
          value: patient.bloodType || ''
        },
        {
          id: 'height',
          name: 'height',
          type: 'number',
          label: 'Height (cm)',
          value: patient.height || ''
        },
        {
          id: 'weight',
          name: 'weight',
          type: 'number',
          label: 'Weight (kg)',
          value: patient.weight || ''
        },
        {
          id: 'surgeries',
          name: 'surgeries',
          type: 'array',
          label: 'Surgeries',
          value: patient.surgeries || []
        },
        {
          id: 'smoking',
          name: 'smoking',
          type: 'text',
          label: 'Smoking Status',
          value: patient.substanceUse?.smoking || ''
        },
        {
          id: 'alcohol',
          name: 'alcohol',
          type: 'text',
          label: 'Alcohol Use',
          value: patient.substanceUse?.alcohol || ''
        },
        {
          id: 'drugs',
          name: 'drugs',
          type: 'text',
          label: 'Drug Use',
          value: patient.substanceUse?.drugs || ''
        },
        {
          id: 'nutrition',
          name: 'nutrition',
          type: 'textarea',
          label: 'Nutrition',
          value: patient.nutrition || ''
        },
        {
          id: 'exercise',
          name: 'exercise',
          type: 'textarea',
          label: 'Exercise',
          value: patient.exercise || ''
        },
        {
          id: 'stress',
          name: 'stress',
          type: 'textarea',
          label: 'Stress',
          value: patient.stress || ''
        },
        {
          id: 'familyHistory',
          name: 'familyHistory',
          type: 'textarea',
          label: 'Family History',
          value: patient.familyHistory || ''
        }
      ];

      // Process input through OpenAI
      const contextHint = "This is for updating a patient's medical record in an ophthalmology EHR system";
      const updatedFields = await processFormInput(input, fields, contextHint);
      
      // Compare fields to see what changed
      const updatedData: Partial<Patient> = {};
      const changedFields: string[] = [];
      
      // Helper to build nested objects
      const updateNestedField = (baseObj: any, path: string[], value: any) => {
        let current = baseObj;
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          if (!current[key]) current[key] = {};
          current = current[key];
        }
        current[path[path.length - 1]] = value;
      };
      
      updatedFields.forEach((field, index) => {
        const originalField = fields[index];
        
        // Skip if new value is empty
        if (isEmpty(field.value)) return;
        
        let valueChanged = false;
        
        // Different comparison strategy based on value type
        if (Array.isArray(originalField.value) && Array.isArray(field.value)) {
          // For arrays like medications and allergies
          if (originalField.value.length !== field.value.length) {
            valueChanged = true;
          } else {
            valueChanged = JSON.stringify(originalField.value.sort()) !== JSON.stringify(field.value.sort());
          }
        } else {
          // For primitives
          const oldStr = originalField.value !== undefined && originalField.value !== null ? String(originalField.value).trim() : '';
          const newStr = field.value !== undefined && field.value !== null ? String(field.value).trim() : '';
          valueChanged = oldStr !== newStr && newStr !== '';
        }
        
        if (valueChanged) {
          // Handle special cases for nested fields
          if (field.name === 'emergencyContactName' || field.name === 'emergencyContactRelationship' || field.name === 'emergencyContactPhone') {
            if (!updatedData.emergencyContact) updatedData.emergencyContact = {};
            if (field.name === 'emergencyContactName') updatedData.emergencyContact.name = field.value;
            else if (field.name === 'emergencyContactRelationship') updatedData.emergencyContact.relationship = field.value;
            else if (field.name === 'emergencyContactPhone') updatedData.emergencyContact.phone = field.value;
          } 
          else if (field.name === 'language' || field.name === 'ethnicity' || field.name === 'race') {
            if (!updatedData.background) updatedData.background = {};
            if (field.name === 'language') updatedData.background.language = field.value;
            else if (field.name === 'ethnicity') updatedData.background.ethnicity = field.value;
            else if (field.name === 'race') updatedData.background.race = field.value;
          }
          else if (field.name === 'smoking' || field.name === 'alcohol' || field.name === 'drugs') {
            if (!updatedData.substanceUse) updatedData.substanceUse = {};
            if (field.name === 'smoking') updatedData.substanceUse.smoking = field.value;
            else if (field.name === 'alcohol') updatedData.substanceUse.alcohol = field.value;
            else if (field.name === 'drugs') updatedData.substanceUse.drugs = field.value;
          }
          else {
            // Handle regular fields
            updatedData[field.name as keyof Patient] = field.value;
          }
          
          changedFields.push(originalField.label);
        }
      });
      
      // If there are changes, update the patient
      if (Object.keys(updatedData).length > 0) {
        await onUpdatePatient(updatedData);
        
        setLastUpdate(`Updated fields: ${changedFields.join(', ')}`);
      } else {
        setLastUpdate('No fields were updated. Try being more specific with your description.');
      }
      
      // Clear input after processing
      setInput('');
    } catch (error) {
      console.error('Error processing input:', error);
      setLastUpdate('Error processing input. Please try again.');
    } finally {
      setIsProcessing(false);
      
      // Stop recording if it was active
      if (isRecording) {
        speechRecognitionRef.current?.stop();
        setIsRecording(false);
      }
    }
  };
  
  return (
    <div className={cn(
      "relative bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden",
      className
    )}>
      <div className="bg-primary-600 p-3 text-white flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Patient Record Assistant</h3>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white/80 hover:text-white"
        >
          {isExpanded ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Describe changes to the patient's record using natural language. For example:
            <br />
            <span className="italic text-gray-500">
              "Add allergy to penicillin and update insurance to Blue Cross with policy number BC123456789. He works as a teacher and has type O+ blood."
            </span>
          </p>
          
          {lastUpdate && (
            <div className="mb-4 p-3 bg-primary-50 border border-primary-100 rounded-md text-sm text-primary-800">
              <p>{lastUpdate}</p>
            </div>
          )}
          
          {hasRecognitionError && (
            <div className="mb-4 p-3 bg-error-50 border border-error-100 rounded-md text-sm text-error-800">
              <p>There was an error with speech recognition. Please try again or type your input.</p>
            </div>
          )}
          
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe patient information updates..."
              className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              disabled={isProcessing}
            />
            
            <div className="absolute bottom-2 right-2 flex space-x-2">
              {isSpeechRecognitionSupported && (
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={cn(
                    "p-2 rounded-full",
                    isRecording
                      ? "bg-error-100 text-error-600 animate-pulse"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  disabled={isProcessing}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              )}
              
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "p-2 rounded-full",
                  isProcessing
                    ? "bg-primary-100 text-primary-600"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                )}
                disabled={isProcessing || !input.trim()}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          {isRecording && (
            <div className="mt-3 flex items-center justify-center p-2 bg-error-50 border border-error-100 rounded-md">
              <div className="animate-pulse flex items-center">
                <span className="h-2 w-2 bg-error-500 rounded-full mr-1"></span>
                <span className="h-3 w-3 bg-error-500 rounded-full mr-1"></span>
                <span className="h-4 w-4 bg-error-500 rounded-full"></span>
              </div>
              <p className="ml-3 text-sm text-error-800">Recording... speak clearly</p>
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Patient works as a software engineer, has O+ blood type, is 175 cm tall and weighs 80 kg",
              "Add emergency contact: Sarah Smith (sister) 555-123-4567, speaks Spanish, Hispanic ethnicity",
              "Patient had LASIK surgery in 2020, exercises 3 times weekly, reports high stress at work",
              "Family history of glaucoma from mother's side, doesn't smoke, drinks occasionally"
            ].map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="text-sm text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700 transition-colors"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInfoAIAssistant;

// Define the webkitSpeechRecognition interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}