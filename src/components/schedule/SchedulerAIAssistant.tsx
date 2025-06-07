import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Clock, Calendar, User, X, Check, Loader2, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { usePatientStore } from '../../stores/patientStore';
import { formatTime } from '../../lib/utils';
import { cn } from '../../lib/utils';

// Time slots available for scheduling
const timeSlots = [
  '08:00:00', '08:30:00', '09:00:00', '09:30:00', 
  '10:00:00', '10:30:00', '11:00:00', '11:30:00',
  '12:00:00', '12:30:00', '13:00:00', '13:30:00',
  '14:00:00', '14:30:00', '15:00:00', '15:30:00',
  '16:00:00', '16:30:00', '17:00:00'
];

export interface AppointmentSlot {
  date: string;
  startTime: string;
  endTime: string;
  doctorId?: string | null;
  doctorName?: string;
  score: number; // How well this matches the request (0-100)
  patientId?: string;
  patientName?: string;
  appointmentType?: 'new-patient' | 'follow-up' | 'emergency' | 'other';
}

interface SchedulerAIAssistantProps {
  onSlotSelect: (slot: AppointmentSlot) => void;
  bookedSlots: {
    date: string;
    startTime: string;
    endTime: string;
    doctorId?: string;
  }[];
  className?: string;
}

const SchedulerAIAssistant = ({
  onSlotSelect,
  bookedSlots,
  className
}: SchedulerAIAssistantProps) => {
  const { patients } = usePatientStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecognitionError, setHasRecognitionError] = useState(false);
  const [results, setResults] = useState<{
    perfect: AppointmentSlot[];
    close: AppointmentSlot[];
    searchCriteria?: {
      dateRange?: string;
      timeRange?: string;
      doctorPreference?: string;
      patientName?: string;
      appointmentType?: string;
    };
  } | null>(null);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Check if the browser supports speech recognition
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
  
  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate API call to process natural language
      // In production this would call a real NLP service or GPT-4
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Parse the input to extract scheduling preferences
      const parsedInput = parseSchedulingRequest(input, bookedSlots);
      setResults(parsedInput);
    } catch (error) {
      console.error('Error processing scheduling request:', error);
    } finally {
      setIsProcessing(false);
      
      // Stop recording if it was active
      if (isRecording) {
        speechRecognitionRef.current?.stop();
        setIsRecording(false);
      }
    }
  };

  const clearResults = () => {
    setResults(null);
    setInput('');
  };

  const handleSlotSelect = (slot: AppointmentSlot) => {
    onSlotSelect(slot);
    setIsExpanded(false);
    clearResults();
  };
  
  // Simple natural language parsing for scheduling requests
  // This would be replaced with a more sophisticated system in production
  const parseSchedulingRequest = (text: string, bookedSlots: any[]): {
    perfect: AppointmentSlot[];
    close: AppointmentSlot[];
    searchCriteria: {
      dateRange?: string;
      timeRange?: string;
      doctorPreference?: string;
      patientName?: string;
      appointmentType?: string;
    };
  } => {
    const textLower = text.toLowerCase();
    
    // Extract date preferences
    let targetDate: dayjs.Dayjs | null = null;
    
    // Check for specific date mentions
    const specificDateMatch = textLower.match(/(?:on|for)\s+(\w+day,?\s+\w+\s+\d{1,2}(?:st|nd|rd|th)?)/i) || 
                             textLower.match(/(?:on|for)\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?)/i) ||
                             textLower.match(/(\d{1,2}(?:\/|-)\d{1,2}(?:\/|-)\d{2,4})/);
    
    if (specificDateMatch) {
      const dateStr = specificDateMatch[1];
      targetDate = dayjs(dateStr, ['MMMM D', 'M/D/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY']);
    } 
    // Check for relative date mentions
    else if (textLower.includes('today')) {
      targetDate = dayjs();
    } 
    else if (textLower.includes('tomorrow')) {
      targetDate = dayjs().add(1, 'day');
    } 
    else if (textLower.match(/next\s+(\w+day)/i)) {
      const dayMatch = textLower.match(/next\s+(\w+day)/i);
      const dayOfWeek = dayMatch ? dayMatch[1].toLowerCase() : '';
      
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);
      
      if (targetDayIndex !== -1) {
        const currentDayIndex = dayjs().day();
        const daysUntilTarget = (targetDayIndex - currentDayIndex + 7) % 7;
        targetDate = dayjs().add(daysUntilTarget === 0 ? 7 : daysUntilTarget, 'day');
      }
    }
    else if (textLower.match(/this\s+(\w+day)/i)) {
      const dayMatch = textLower.match(/this\s+(\w+day)/i);
      const dayOfWeek = dayMatch ? dayMatch[1].toLowerCase() : '';
      
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);
      
      if (targetDayIndex !== -1) {
        const currentDayIndex = dayjs().day();
        const daysUntilTarget = (targetDayIndex - currentDayIndex + 7) % 7;
        targetDate = dayjs().add(daysUntilTarget, 'day');
      }
    }
    
    // Default to tomorrow if no date is specified
    if (!targetDate) {
      targetDate = dayjs().add(1, 'day');
    }
    
    // Format date for consistency
    const formattedDate = targetDate.format('YYYY-MM-DD');
    
    // Extract time preferences
    let preferredTime: string | null = null;
    let preferredTimeEnd: string | null = null;
    
    // Check for specific time mentions
    const timeMatch = textLower.match(/(?:at|around)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i) ||
                     textLower.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
    
    // Check for time ranges
    const timeRangeMatch = textLower.match(/between\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s+and\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
    
    // Check for time of day preferences
    const morningMatch = textLower.includes('morning');
    const afternoonMatch = textLower.includes('afternoon');
    const eveningMatch = textLower.includes('evening');
    
    if (timeRangeMatch) {
      const startTime = timeRangeMatch[1];
      const endTime = timeRangeMatch[2];
      
      // Convert to 24-hour format for comparison
      const startHour = convertTo24Hour(startTime);
      const endHour = convertTo24Hour(endTime);
      
      preferredTime = startHour;
      preferredTimeEnd = endHour;
    }
    else if (timeMatch) {
      preferredTime = convertTo24Hour(timeMatch[1]);
      
      // End time is 1 hour after start time
      const hourMinute = preferredTime.split(':').map(Number);
      if (hourMinute.length === 2) {
        let endHour = hourMinute[0];
        let endMinute = hourMinute[1];
        
        endHour += 1;
        if (endHour >= 24) endHour = 23;
        
        preferredTimeEnd = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
      }
    }
    else if (morningMatch) {
      preferredTime = '08:00';
      preferredTimeEnd = '12:00';
    }
    else if (afternoonMatch) {
      preferredTime = '12:00';
      preferredTimeEnd = '17:00';
    }
    else if (eveningMatch) {
      preferredTime = '16:00';
      preferredTimeEnd = '19:00';
    }
    
    // Extract doctor preferences
    let preferredDoctor: string | null = null;
    
    const doctorMatch = textLower.match(/(?:with|see)\s+(?:dr\.?|doctor)\s+(\w+)/i) ||
                       textLower.match(/(?:dr\.?|doctor)\s+(\w+)/i);
    
    if (doctorMatch) {
      preferredDoctor = doctorMatch[1];
    }
    
    // Extract patient information
    let patientName: string | null = null;
    let patientId: string | null = null;
    
    // Look for patterns like "for John Smith", "patient Jane Doe", "appointment for Mike Jones"
    const patientMatch = text.match(/(?:for|patient)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i) ||
                         text.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)(?:'s appointment|\s+needs|\s+would like)/i);
    
    if (patientMatch) {
      patientName = patientMatch[1];
      
      // Try to find a matching patient in the database
      const matchedPatient = patients.find(p => {
        const fullName = `${p.firstName} ${p.lastName}`;
        return fullName.toLowerCase() === patientName?.toLowerCase();
      });
      
      if (matchedPatient) {
        patientId = matchedPatient.id;
      }
    }
    
    // Extract appointment type
    let appointmentType: 'new-patient' | 'follow-up' | 'emergency' | 'other' | null = null;
    
    if (textLower.includes('new patient') || textLower.includes('first visit') || textLower.includes('initial')) {
      appointmentType = 'new-patient';
    } else if (textLower.includes('follow-up') || textLower.includes('follow up') || textLower.includes('checkup')) {
      appointmentType = 'follow-up';
    } else if (textLower.includes('emergency') || textLower.includes('urgent')) {
      appointmentType = 'emergency';
    } else if (textLower.includes('consultation')) {
      appointmentType = 'other';
    }
    
    // Generate available slots
    const availableSlots: AppointmentSlot[] = [];
    
    // Current date to check
    let dateToCheck = formattedDate;
    
    // Mocked doctor data - changed to use null instead of "doc-1" and "doc-2"
    const doctors = [
      { id: null, name: 'Johnson' },
      { id: null, name: 'Smith' }
    ];

    // Check 7 days starting from the target date
    for (let i = 0; i < 7; i++) {
      const currentDate = dayjs(dateToCheck).add(i, 'day').format('YYYY-MM-DD');
      
      // Skip weekends
      const dayOfWeek = dayjs(currentDate).day();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      for (const doctor of doctors) {
        // Skip if there's a doctor preference that doesn't match
        if (preferredDoctor && !doctor.name.toLowerCase().includes(preferredDoctor.toLowerCase())) {
          continue;
        }
        
        for (const slot of timeSlots) {
          // Convert slot time to 24-hour format for comparison
          const slotHour = Number(slot.split(':')[0]);
          const slotMinute = Number(slot.split(':')[1]);
          const slotTime = `${String(slotHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`;
          
          // Skip if slot is outside preferred time range
          if (preferredTime && slotTime < preferredTime) continue;
          if (preferredTimeEnd && slotTime > preferredTimeEnd) continue;
          
          // Calculate end time (30 min appointment)
          const endHour = slotHour + (slotMinute + 30 >= 60 ? 1 : 0);
          const endMinute = (slotMinute + 30) % 60;
          const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;
          
          // Check if slot is already booked
          const isBooked = bookedSlots.some(
            bookedSlot => 
              bookedSlot.date === currentDate && 
              bookedSlot.startTime === slot &&
              (!preferredDoctor || !bookedSlot.doctorId || bookedSlot.doctorId === doctor.id)
          );
          
          if (!isBooked) {
            // Calculate score based on match quality
            let score = 100;
            
            // Reduce score for later dates
            score -= i * 10;
            
            // Reduce score for time difference from preferred
            if (preferredTime) {
              const preferredHourMinute = preferredTime.split(':').map(Number);
              const preferredTotalMinutes = preferredHourMinute[0] * 60 + (preferredHourMinute[1] || 0);
              
              const slotTotalMinutes = slotHour * 60 + slotMinute;
              
              const timeDifference = Math.abs(slotTotalMinutes - preferredTotalMinutes);
              score -= Math.min(50, timeDifference / 5); // Max 50 point penalty for time difference
            }
            
            availableSlots.push({
              date: currentDate,
              startTime: slot,
              endTime,
              doctorId: doctor.id,
              doctorName: `Dr. ${doctor.name}`,
              score,
              patientId,
              patientName,
              appointmentType
            });
          }
        }
      }
    }
    
    // Sort by score (descending)
    availableSlots.sort((a, b) => b.score - a.score);
    
    // Separate perfect matches (score > 90) from close matches
    const perfectMatches = availableSlots.filter(slot => slot.score > 90);
    const closeMatches = availableSlots.filter(slot => slot.score <= 90).slice(0, 5);
    
    return {
      perfect: perfectMatches.slice(0, 3),
      close: closeMatches,
      searchCriteria: {
        dateRange: targetDate ? `Starting ${targetDate.format('MMM D, YYYY')}` : undefined,
        timeRange: preferredTime ? 
          (preferredTimeEnd ? `Between ${formatTimeForDisplay(preferredTime)} and ${formatTimeForDisplay(preferredTimeEnd)}` : 
                            `Around ${formatTimeForDisplay(preferredTime)}`) : 
          undefined,
        doctorPreference: preferredDoctor ? `Dr. ${preferredDoctor}` : undefined,
        patientName: patientName || undefined,
        appointmentType: appointmentType ? 
          appointmentType.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 
          undefined
      }
    };
  };
  
  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (timeStr: string): string => {
    const timeLower = timeStr.toLowerCase();
    let [hours, minutesPart] = timeLower.split(':');
    
    // Handle cases without minutes (e.g., "9am")
    if (!minutesPart) {
      const match = hours.match(/(\d+)\s*(am|pm)/);
      if (match) {
        hours = match[1];
        minutesPart = '00' + match[2];
      }
    }
    
    let hour = parseInt(hours, 10);
    
    // Extract minutes and am/pm
    let minutes = '00';
    let period = 'am';
    
    if (minutesPart) {
      const minutesMatch = minutesPart.match(/(\d+)(?:\s*(am|pm))?/);
      
      if (minutesMatch) {
        minutes = minutesMatch[1] || '00';
        if (minutesMatch[2]) period = minutesMatch[2];
      }
      
      if (minutesPart.includes('pm')) period = 'pm';
    }
    
    // Convert to 24-hour format
    if (period === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period === 'am' && hour === 12) {
      hour = 0;
    }
    
    return `${String(hour).padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };
  
  // Format time for display (e.g., "14:30" → "2:30 PM")
  const formatTimeForDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
  };
  
  return (
    <div className={cn("relative w-full", className)}>
      <AnimatePresence>
        {!isExpanded ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg"
            onClick={() => setIsExpanded(true)}
          >
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">AI Appointment Finder</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-full"
          >
            <div className="bg-primary-600 p-3 text-white flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                <h3 className="font-medium">AI Appointment Finder</h3>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              {!results ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Describe when you'd like to schedule an appointment using natural language. For example:
                    <br />
                    <span className="italic text-gray-500">
                      "I need an appointment for John Smith next Tuesday afternoon with Dr. Johnson for a follow-up."
                    </span>
                  </p>
                  
                  {hasRecognitionError && (
                    <div className="mb-4 p-3 bg-error-50 border border-error-100 rounded-md text-sm text-error-800">
                      <p>There was an error with speech recognition. Please try again or type your input.</p>
                    </div>
                  )}
                  
                  {isRecording && (
                    <div className="mb-4 flex items-center justify-center p-2 bg-error-50 border border-error-100 rounded-md">
                      <div className="animate-pulse flex items-center">
                        <span className="h-2 w-2 bg-error-500 rounded-full mr-1"></span>
                        <span className="h-3 w-3 bg-error-500 rounded-full mr-1"></span>
                        <span className="h-4 w-4 bg-error-500 rounded-full"></span>
                      </div>
                      <p className="ml-3 text-sm text-error-800">Recording... speak clearly</p>
                    </div>
                  )}
                  
                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Describe when you'd like to schedule..."
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
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {["New patient Jane Doe tomorrow", "Follow-up for John Smith next Friday", "Emergency appointment with Dr. Johnson today"].map((suggestion, index) => (
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
                </>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Appointment Results</h4>
                    <button 
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                      onClick={clearResults}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear results
                    </button>
                  </div>
                  
                  {results.searchCriteria && (
                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">Search criteria:</p>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        {results.searchCriteria.patientName && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 text-primary-500 mr-1" />
                            <span>Patient: {results.searchCriteria.patientName}</span>
                          </div>
                        )}
                        
                        {results.searchCriteria.appointmentType && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-primary-500 mr-1" />
                            <span>Type: {results.searchCriteria.appointmentType}</span>
                          </div>
                        )}
                        
                        {results.searchCriteria.dateRange && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-primary-500 mr-1" />
                            <span>{results.searchCriteria.dateRange}</span>
                          </div>
                        )}
                        
                        {results.searchCriteria.timeRange && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 text-primary-500 mr-1" />
                            <span>{results.searchCriteria.timeRange}</span>
                          </div>
                        )}
                        
                        {results.searchCriteria.doctorPreference && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 text-primary-500 mr-1" />
                            <span>{results.searchCriteria.doctorPreference}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {results.perfect.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-success-700 mb-2 flex items-center">
                        <Check className="h-4 w-4 mr-1" />
                        Perfect Matches
                      </h5>
                      <div className="space-y-2">
                        {results.perfect.map((slot, index) => (
                          <button
                            key={index}
                            className="w-full text-left p-3 border border-success-200 rounded-md hover:bg-success-50 transition-colors flex justify-between items-center"
                            onClick={() => handleSlotSelect(slot)}
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {dayjs(slot.date).format('ddd, MMM D, YYYY')}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(new Date(`2000-01-01T${slot.startTime}`))} - 
                                {formatTime(new Date(`2000-01-01T${slot.endTime}`))}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {slot.doctorName}
                              </div>
                            </div>
                            <div className="text-success-600">
                              <Check className="h-5 w-5" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {results.close.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Closest Alternatives
                      </h5>
                      <div className="space-y-2">
                        {results.close.map((slot, index) => (
                          <button
                            key={index}
                            className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            onClick={() => handleSlotSelect(slot)}
                          >
                            <div className="font-medium text-gray-900">
                              {dayjs(slot.date).format('ddd, MMM D, YYYY')}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(new Date(`2000-01-01T${slot.startTime}`))} - 
                              {formatTime(new Date(`2000-01-01T${slot.endTime}`))}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {slot.doctorName}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {results.perfect.length === 0 && results.close.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-gray-500">
                        No available slots match your criteria. Please try different dates or times.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchedulerAIAssistant;

// Define the webkitSpeechRecognition interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}