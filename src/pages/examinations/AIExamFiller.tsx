import { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, Mic, MicOff, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Examination } from '../../types';
import { processFormInput } from '../../lib/openai';

interface AIExamFillerProps {
  value: Partial<Examination>;
  onChange: (value: Partial<Examination>) => void;
  className?: string;
}

const AIExamFiller = ({ value, onChange, className }: AIExamFillerProps) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldsFilled, setFieldsFilled] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasRecognitionError, setHasRecognitionError] = useState(false);
  
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Check if browser supports speech recognition
  const isSpeechRecognitionSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  
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
  
  // Toggle speech recognition
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
      setErrorMessage(null);
      
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
  
  // Helper function to check if a value is empty
  const isEmpty = (value: any): boolean => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') {
      if (Object.keys(value).length === 0) return true;
      return Object.values(value).every(v => isEmpty(v));
    }
    return false;
  };
  
  // Process the natural language input using GPT-4o via Supabase Edge Function
  const handleProcessInput = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    setFieldsFilled([]);
    setErrorMessage(null);
    
    try {
      // Convert examination fields to generic form fields for the AI processor
      const formFields = [
        {
          id: 'chiefComplaint',
          name: 'chiefComplaint',
          type: 'text',
          label: 'Chief Complaint',
          value: value.chiefComplaint || ''
        },
        {
          id: 'visionRightUncorrected',
          name: 'vision.rightEye.uncorrected',
          type: 'text',
          label: 'Vision Right Eye Uncorrected',
          value: value.vision?.rightEye?.uncorrected || ''
        },
        {
          id: 'visionRightCorrected',
          name: 'vision.rightEye.corrected',
          type: 'text',
          label: 'Vision Right Eye Corrected',
          value: value.vision?.rightEye?.corrected || ''
        },
        {
          id: 'visionLeftUncorrected',
          name: 'vision.leftEye.uncorrected',
          type: 'text',
          label: 'Vision Left Eye Uncorrected',
          value: value.vision?.leftEye?.uncorrected || ''
        },
        {
          id: 'visionLeftCorrected',
          name: 'vision.leftEye.corrected',
          type: 'text',
          label: 'Vision Left Eye Corrected',
          value: value.vision?.leftEye?.corrected || ''
        },
        {
          id: 'iopRight',
          name: 'intraocularPressure.rightEye',
          type: 'number',
          label: 'IOP Right Eye',
          value: value.intraocularPressure?.rightEye || ''
        },
        {
          id: 'iopLeft',
          name: 'intraocularPressure.leftEye',
          type: 'number',
          label: 'IOP Left Eye',
          value: value.intraocularPressure?.leftEye || ''
        },
        {
          id: 'anteriorSegment',
          name: 'anteriorSegment',
          type: 'textarea',
          label: 'Anterior Segment',
          value: value.anteriorSegment || ''
        },
        {
          id: 'posteriorSegment',
          name: 'posteriorSegment',
          type: 'textarea',
          label: 'Posterior Segment',
          value: value.posteriorSegment || ''
        },
        {
          id: 'diagnosis',
          name: 'diagnosis',
          type: 'text',
          label: 'Diagnosis',
          value: value.diagnosis?.join(', ') || ''
        },
        {
          id: 'plan',
          name: 'plan',
          type: 'textarea',
          label: 'Plan',
          value: value.plan || ''
        },
        {
          id: 'followUp',
          name: 'followUp',
          type: 'text',
          label: 'Follow Up',
          value: value.followUp || ''
        }
      ];

      // Process the input with OpenAI's GPT-4o
      const contextHint = "This is for an eye examination record in an ophthalmology EHR system";
      const updatedFields = await processFormInput(input, formFields, contextHint);
      
      // Track which fields were updated
      const changedFields: string[] = [];
      
      for (let i = 0; i < formFields.length; i++) {
        const oldField = formFields[i];
        const newField = updatedFields[i];
        
        // Skip comparison if new value is empty
        if (isEmpty(newField.value)) continue;
        
        // Compare values based on type
        let valueChanged = false;
        
        // Convert values to strings for comparison
        const oldValueStr = oldField.value !== undefined && oldField.value !== null ? 
                          String(oldField.value).trim() : '';
        const newValueStr = newField.value !== undefined && newField.value !== null ? 
                          String(newField.value).trim() : '';
        
        // Check if values are different
        valueChanged = oldValueStr !== newValueStr && newValueStr !== '';
        
        if (valueChanged) {
          changedFields.push(oldField.label);
        }
      }
      
      if (changedFields.length > 0) {
        setFieldsFilled(changedFields);
        
        // Convert the flat field structure back to the nested examination structure
        const updatedExamination = { ...value };
        
        updatedFields.forEach(field => {
          if (!isEmpty(field.value)) {
            // Handle nested fields
            if (field.name.includes('.')) {
              const parts = field.name.split('.');
              
              // Handle vision fields
              if (parts[0] === 'vision') {
                updatedExamination.vision = updatedExamination.vision || { rightEye: {}, leftEye: {} };
                
                if (parts[1] === 'rightEye') {
                  updatedExamination.vision.rightEye = updatedExamination.vision.rightEye || {};
                  updatedExamination.vision.rightEye[parts[2]] = field.value;
                } else if (parts[1] === 'leftEye') {
                  updatedExamination.vision.leftEye = updatedExamination.vision.leftEye || {};
                  updatedExamination.vision.leftEye[parts[2]] = field.value;
                }
              } 
              // Handle IOP fields
              else if (parts[0] === 'intraocularPressure') {
                updatedExamination.intraocularPressure = updatedExamination.intraocularPressure || {};
                updatedExamination.intraocularPressure[parts[1]] = Number(field.value);
              }
            } 
            // Handle simple fields
            else {
              if (field.name === 'diagnosis' && typeof field.value === 'string') {
                // Convert comma-separated diagnosis to array
                updatedExamination.diagnosis = field.value.split(',').map(d => d.trim()).filter(d => d);
              } else {
                updatedExamination[field.name] = field.value;
              }
            }
          }
        });
        
        onChange(updatedExamination);
        setInput(''); // Clear input after successful processing
      } else {
        setErrorMessage('No relevant information found in your description. Please try again with more specific details.');
      }
      
    } catch (error) {
      console.error('Error processing examination data:', error);
      setErrorMessage('An error occurred while processing your input. Please try again.');
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
    <div className={cn("bg-white shadow-sm rounded-lg border border-primary-100", className)}>
      <div className="p-4 border-b border-primary-100 flex items-center">
        <div className="flex-shrink-0 bg-primary-100 p-2 rounded-full">
          <Sparkles className="h-5 w-5 text-primary-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">GPT-4o Examination Assistant</h3>
          <p className="text-xs text-gray-600">
            Describe the examination findings in natural language to automatically fill the form fields.
          </p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <textarea
            ref={inputRef}
            rows={3}
            className="w-full rounded-md border border-gray-300 p-3 pr-24 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            placeholder="Describe the patient's symptoms, visual acuity, and examination findings..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        
        {errorMessage && (
          <div className="mt-3 p-3 bg-error-50 border border-error-200 rounded-md text-error-800 text-sm">
            <p>{errorMessage}</p>
          </div>
        )}
        
        {hasRecognitionError && (
          <div className="mt-3 p-3 bg-error-50 border border-error-100 rounded-md text-sm text-error-800">
            <p>There was an error with speech recognition. Please try again or type your input.</p>
          </div>
        )}
        
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
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex space-x-2">
            {isSpeechRecognitionSupported && (
              <button
                type="button"
                onClick={toggleRecording}
                className={cn(
                  "flex items-center p-2 rounded-md text-sm",
                  isRecording
                    ? "bg-error-100 text-error-600 animate-pulse"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
                disabled={isProcessing}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-1" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-1" />
                    Record Voice
                  </>
                )}
              </button>
            )}
            
            <button
              type="button"
              className="flex items-center text-xs text-primary-600 hover:text-primary-800"
              onClick={() => setInput("Patient presents with blurry vision in right eye for 2 weeks. Visual acuity is 20/40 OD, 20/20 OS. IOP is 18 OD, 16 OS.")}
            >
              Example Input
            </button>
          </div>
          
          <button
            type="button"
            onClick={handleProcessInput}
            className={cn(
              "flex items-center p-2 rounded-md text-sm font-medium",
              isProcessing
                ? "bg-primary-100 text-primary-600"
                : "bg-primary-600 text-white hover:bg-primary-700"
            )}
            disabled={isProcessing || !input.trim()}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Process with GPT-4o
              </>
            )}
          </button>
        </div>
        
        {fieldsFilled.length > 0 && (
          <div className="mt-3 p-3 bg-success-50 border border-success-200 rounded-md text-success-800 text-sm">
            <p className="font-medium">Successfully filled fields:</p>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {fieldsFilled.map((field, index) => (
                <div key={index} className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-success-500" />
                  <span className="text-xs">{field}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIExamFiller;

// Define the webkitSpeechRecognition interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}