import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, X, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { processFormInput } from '../../lib/openai';

export interface AIFormField {
  id: string;
  name: string;
  type: string;
  label: string;
  value: any;
  options?: { label: string; value: any }[];
  placeholder?: string;
  required?: boolean;
}

export interface AIFormAssistantProps {
  fields: AIFormField[];
  onFieldsUpdate: (updatedFields: AIFormField[]) => void;
  contextHint?: string;
  position?: 'bottom' | 'inline';
  className?: string;
}

const AIFormAssistant = ({ 
  fields, 
  onFieldsUpdate, 
  contextHint, 
  position = 'bottom',
  className 
}: AIFormAssistantProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAIUpdate, setLastAIUpdate] = useState<string | null>(null);
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
  
  // Start or stop recording
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
      
      // Start microphone permission request
      try {
        speechRecognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording:', err);
        setHasRecognitionError(true);
        
        // Reset error state after 3 seconds
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
    if (typeof value === 'object') {
      // For nested objects like vision.rightEye
      if (Object.keys(value).length === 0) return true;
      return Object.values(value).every(v => isEmpty(v));
    }
    return false;
  };
  
  // Process the input using AI
  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Process input through OpenAI
      const updatedFields = await processFormInput(input, fields, contextHint);
      
      // Compare fields to see what changed - with improved comparison logic
      let changedFields: string[] = [];
      
      for (let i = 0; i < fields.length; i++) {
        const oldField = fields[i];
        const newField = updatedFields[i];
        
        // Skip if new value is empty
        if (isEmpty(newField.value)) continue;
        
        let valueChanged = false;
        
        // Different comparison strategy based on value type
        if (Array.isArray(oldField.value) && Array.isArray(newField.value)) {
          // For arrays
          if (oldField.value.length !== newField.value.length) {
            valueChanged = true;
          } else {
            valueChanged = JSON.stringify(oldField.value) !== JSON.stringify(newField.value);
          }
        } else if (
          typeof oldField.value === 'object' && oldField.value !== null && 
          typeof newField.value === 'object' && newField.value !== null
        ) {
          // For objects
          valueChanged = JSON.stringify(oldField.value) !== JSON.stringify(newField.value);
        } else {
          // For primitives
          const oldStr = oldField.value !== undefined && oldField.value !== null ? String(oldField.value).trim() : '';
          const newStr = newField.value !== undefined && newField.value !== null ? String(newField.value).trim() : '';
          valueChanged = oldStr !== newStr && newStr !== '';
        }
        
        if (valueChanged) {
          changedFields.push(oldField.label);
        }
      }
      
      // Update the fields
      onFieldsUpdate(updatedFields);
      
      if (changedFields.length > 0) {
        setLastAIUpdate(`Updated fields: ${changedFields.join(', ')}`);
      } else {
        setLastAIUpdate('No fields were updated. Try being more specific with your description.');
      }
      
      // Clear input after processing
      setInput('');
    } catch (error) {
      console.error('Error processing input:', error);
      setLastAIUpdate('Error processing input. Please try again.');
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
      "relative",
      position === 'bottom' ? "fixed bottom-4 right-4 z-10" : "my-4",
      className
    )}>
      <AnimatePresence>
        {!isExpanded ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-3 rounded-full shadow-lg"
            onClick={() => setIsExpanded(true)}
          >
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">AI Assistant</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={cn(
              "bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden",
              position === 'bottom' ? "w-full sm:w-96" : "w-full"
            )}
          >
            <div className="bg-primary-600 p-3 text-white flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                <h3 className="font-medium">GPT-4o Form Assistant</h3>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Describe what you want to fill in using natural language. For example:
                <br />
                <span className="italic text-gray-500">
                  "My name is John Smith, I'm 45 years old, born on 5/15/1978, and I'm experiencing blurry vision in my right eye."
                </span>
              </p>
              
              {lastAIUpdate && (
                <div className="mb-4 p-3 bg-primary-50 border border-primary-100 rounded-md text-sm text-primary-800">
                  <p>{lastAIUpdate}</p>
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
                  placeholder="Type or use voice input to describe what to fill in..."
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
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (contextHint) {
                      setInput(prev => prev + (prev ? ' ' : '') + contextHint);
                      inputRef.current?.focus();
                    }
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                  disabled={!contextHint}
                >
                  <MessageSquare className="h-3 w-3 inline mr-1" />
                  {contextHint ? `Use hint: "${contextHint}"` : 'No context hints available'}
                </button>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIFormAssistant;

// Define the webkitSpeechRecognition interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}