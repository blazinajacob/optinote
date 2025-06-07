// OpenAI client for AI form assistant
import { supabase } from './supabase';

// Interface for form field data
interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  value: any;
  options?: { label: string; value: any }[];
}

// Interface for appointment notes analysis
interface NotesAnalysis {
  keywords: {
    text: string;
    category: 'symptom' | 'medication' | 'procedure' | 'condition' | 'other';
  }[];
}

/**
 * Process natural language input to fill form fields using GPT-4o via Supabase Edge Function
 */
export async function processFormInput(
  input: string, 
  fields: FormField[], 
  contextHint?: string
): Promise<FormField[]> {
  try {
    // For development testing with direct OpenAI API if available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      // Simplified local processing for development
      console.log('Using local OpenAI processing');
      return simulateProcessing(input, fields);
    }

    // Call the Supabase Edge Function in production
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { input, fields, contextHint },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message);
    }

    if (data.fields) {
      // Deep clone the fields to avoid reference issues
      const updatedFields = JSON.parse(JSON.stringify(fields));
      
      // Update values from AI response
      data.fields.forEach((field: FormField, index: number) => {
        if (field.value !== undefined && field.value !== null && field.value !== '') {
          updatedFields[index].value = field.value;
        }
      });
      
      return updatedFields;
    } else {
      throw new Error('Invalid response from AI assistant');
    }
  } catch (error) {
    console.error("Error processing form input:", error);
    
    // Fallback to local processing if the Edge Function fails
    return simulateProcessing(input, fields);
  }
}

/**
 * Analyze appointment notes to extract keywords and categories
 */
export async function analyzeAppointmentNotes(
  notes: string
): Promise<NotesAnalysis> {
  try {
    // For development testing with direct OpenAI API if available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      // Simplified local processing for development
      console.log('Using local OpenAI processing for notes');
      return simulateNotesAnalysis(notes);
    }

    // Call the Supabase Edge Function in production
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { 
        type: 'notes-analysis',
        notes 
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message);
    }

    if (data.keywords) {
      return { 
        keywords: data.keywords 
      };
    } else {
      throw new Error('Invalid response from AI assistant');
    }
  } catch (error) {
    console.error("Error analyzing appointment notes:", error);
    
    // Fallback to local processing if the Edge Function fails
    return simulateNotesAnalysis(notes);
  }
}

/**
 * Generate AI summaries for different entity types
 */
export async function generateSummary(
  type: 'patient' | 'examination' | 'appointment' | 'soap',
  data: any
): Promise<string> {
  try {
    // For development testing with direct OpenAI API if available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      // Simplified local processing for development
      console.log('Using local OpenAI processing for summary generation');
      return simulateSummaryGeneration(type, data);
    }

    // Call the Supabase Edge Function in production
    const { data: responseData, error } = await supabase.functions.invoke('ai-assistant', {
      body: { 
        type: 'generate-summary',
        entityType: type,
        entityData: data
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message);
    }

    if (responseData.summary) {
      return responseData.summary;
    } else {
      throw new Error('Invalid response from AI assistant');
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    
    // Fallback to local processing if the Edge Function fails
    return simulateSummaryGeneration(type, data);
  }
}

/**
 * Local simulation for notes analysis
 */
function simulateNotesAnalysis(notes: string): NotesAnalysis {
  // Simple keyword extraction logic for demonstration
  const keywords: NotesAnalysis['keywords'] = [];
  
  // Common eye-related symptoms
  const symptoms = [
    'blurry vision', 'blurred vision', 'headache', 'migraine', 'pain', 'redness',
    'dry eyes', 'tearing', 'itching', 'burning', 'discharge', 'photophobia',
    'light sensitivity', 'floaters', 'flashes', 'double vision', 'diplopia',
    'vision loss', 'blind spot'
  ];
  
  // Common eye medications
  const medications = [
    'latanoprost', 'timolol', 'brimonidine', 'dorzolamide', 'bimatoprost',
    'travoprost', 'prednisolone', 'ketorolac', 'artificial tears'
  ];
  
  // Common eye procedures
  const procedures = [
    'cataract surgery', 'lasik', 'prk', 'vitrectomy', 'laser', 'trabeculectomy',
    'iridotomy', 'yag', 'intravitreal injection', 'injection'
  ];
  
  // Common eye conditions
  const conditions = [
    'cataract', 'glaucoma', 'macular degeneration', 'amd', 'diabetic retinopathy', 
    'dry eye', 'conjunctivitis', 'pink eye', 'astigmatism', 'myopia'
  ];
  
  const notesLower = notes.toLowerCase();
  
  // Check for symptoms
  symptoms.forEach(symptom => {
    if (notesLower.includes(symptom)) {
      keywords.push({
        text: symptom,
        category: 'symptom'
      });
    }
  });
  
  // Check for medications
  medications.forEach(medication => {
    if (notesLower.includes(medication)) {
      keywords.push({
        text: medication,
        category: 'medication'
      });
    }
  });
  
  // Check for procedures
  procedures.forEach(procedure => {
    if (notesLower.includes(procedure)) {
      keywords.push({
        text: procedure,
        category: 'procedure'
      });
    }
  });
  
  // Check for conditions
  conditions.forEach(condition => {
    if (notesLower.includes(condition)) {
      keywords.push({
        text: condition,
        category: 'condition'
      });
    }
  });
  
  // Add some additional keywords
  if (notesLower.includes('follow') && (notesLower.includes('up') || notesLower.includes('week') || notesLower.includes('month'))) {
    keywords.push({
      text: 'follow-up',
      category: 'procedure'
    });
  }
  
  if (notesLower.includes('referral') || notesLower.includes('referred')) {
    keywords.push({
      text: 'referral',
      category: 'procedure'
    });
  }
  
  if (notesLower.includes('insurance')) {
    keywords.push({
      text: 'insurance',
      category: 'other'
    });
  }
  
  if (notesLower.includes('urgent') || notesLower.includes('emergency')) {
    keywords.push({
      text: 'urgent',
      category: 'other'
    });
  }
  
  return { keywords };
}

/**
 * Simulate AI summary generation for different entity types
 */
function simulateSummaryGeneration(
  type: 'patient' | 'examination' | 'appointment' | 'soap',
  data: any
): string {
  // Wait a short time to simulate API call
  return new Promise(resolve => {
    setTimeout(() => {
      switch (type) {
        case 'patient':
          resolve(generatePatientSummary(data));
          break;
        case 'examination':
          resolve(generateExaminationSummary(data));
          break;
        case 'appointment':
          resolve(generateAppointmentSummary(data));
          break;
        case 'soap':
          resolve(generateSOAPSummary(data));
          break;
        default:
          resolve('Unable to generate summary for this entity type.');
      }
    }, 1500);
  });
}

/**
 * Generate a summary for patient data
 */
function generatePatientSummary(patient: any): string {
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  
  let summary = `${patient.firstName} ${patient.lastName} is a ${age}-year-old ${patient.gender} `;
  
  // Add occupation
  if (patient.occupation) {
    summary += `who works as a ${patient.occupation}. `;
  } else {
    summary += `. `;
  }
  
  // Add background information
  if (patient.background) {
    const backgroundInfo = [];
    if (patient.background.language) {
      backgroundInfo.push(`Their primary language is ${patient.background.language}`);
    }
    if (patient.background.ethnicity || patient.background.race) {
      const ethnicityRace = [
        patient.background.ethnicity, 
        patient.background.race
      ].filter(Boolean).join(', ');
      
      if (ethnicityRace) {
        backgroundInfo.push(`their ethnicity/race is ${ethnicityRace}`);
      }
    }
    
    if (backgroundInfo.length > 0) {
      summary += backgroundInfo.join(' and ') + '. ';
    }
  }
  
  // Add physical characteristics
  if (patient.height || patient.weight || patient.bloodType) {
    const physicalInfo = [];
    
    if (patient.height && patient.weight) {
      physicalInfo.push(`${patient.height} cm tall and weighs ${patient.weight} kg`);
    } else if (patient.height) {
      physicalInfo.push(`${patient.height} cm tall`);
    } else if (patient.weight) {
      physicalInfo.push(`weighs ${patient.weight} kg`);
    }
    
    if (patient.bloodType) {
      physicalInfo.push(`blood type ${patient.bloodType}`);
    }
    
    if (physicalInfo.length > 0) {
      summary += `The patient is ${physicalInfo.join(', ')}. `;
    }
  }
  
  if (patient.medicalHistory) {
    summary += `Medical history includes ${patient.medicalHistory}. `;
  }
  
  if (patient.surgeries && patient.surgeries.length > 0) {
    summary += `Past surgical history includes ${patient.surgeries.join(', ')}. `;
  }
  
  if (patient.allergies && patient.allergies.length > 0) {
    summary += `The patient has known allergies to ${patient.allergies.join(', ')}. `;
  } else {
    summary += `No known allergies have been recorded. `;
  }
  
  if (patient.medications && patient.medications.length > 0) {
    summary += `Currently taking ${patient.medications.join(', ')}. `;
  } else {
    summary += `No current medications are listed. `;
  }
  
  // Add lifestyle information
  const lifestyleInfo = [];
  
  if (patient.substanceUse) {
    if (patient.substanceUse.smoking) {
      lifestyleInfo.push(`smoking status: ${patient.substanceUse.smoking}`);
    }
    if (patient.substanceUse.alcohol) {
      lifestyleInfo.push(`alcohol use: ${patient.substanceUse.alcohol}`);
    }
    if (patient.substanceUse.drugs) {
      lifestyleInfo.push(`recreational drug use: ${patient.substanceUse.drugs}`);
    }
  }
  
  if (patient.exercise) {
    lifestyleInfo.push(`exercise: ${patient.exercise}`);
  }
  
  if (patient.nutrition) {
    lifestyleInfo.push(`nutrition: ${patient.nutrition}`);
  }
  
  if (patient.stress) {
    lifestyleInfo.push(`stress level: ${patient.stress}`);
  }
  
  if (lifestyleInfo.length > 0) {
    summary += `Lifestyle factors include ${lifestyleInfo.join('; ')}. `;
  }
  
  // Add family history
  if (patient.familyHistory) {
    summary += `Family medical history: ${patient.familyHistory}. `;
  }
  
  if (patient.insuranceProvider) {
    summary += `Insurance is provided by ${patient.insuranceProvider} `;
    if (patient.insurancePolicyNumber) {
      summary += `(Policy #${patient.insurancePolicyNumber}). `;
    } else {
      summary += `. `;
    }
  }
  
  // Add emergency contact
  if (patient.emergencyContact && patient.emergencyContact.name) {
    summary += `\nEmergency contact: ${patient.emergencyContact.name}`;
    if (patient.emergencyContact.relationship) {
      summary += ` (${patient.emergencyContact.relationship})`;
    }
    if (patient.emergencyContact.phone) {
      summary += `, Phone: ${patient.emergencyContact.phone}`;
    }
    summary += `. `;
  }
  
  summary += `\nContact Information:
- Phone: ${patient.phone}
${patient.email ? `- Email: ${patient.email}` : '- No email provided'}
${patient.address ? `- Address: ${patient.address}` : '- No address provided'}
`;

  return summary;
}

/**
 * Generate a summary for examination data
 */
function generateExaminationSummary(examination: any): string {
  let summary = `Examination Summary (${examination.date ? new Date(examination.date).toLocaleDateString() : 'No date'})\n\n`;
  summary += `Chief Complaint: ${examination.chiefComplaint || 'Not recorded'}\n\n`;
  
  // Add vision information
  summary += `Visual Acuity:\n`;
  if (examination.vision) {
    const rightEye = examination.vision.rightEye || {};
    const leftEye = examination.vision.leftEye || {};
    
    summary += `- Right Eye (OD): ${rightEye.uncorrected || 'N/A'} SC, ${rightEye.corrected || 'N/A'} CC\n`;
    summary += `- Left Eye (OS): ${leftEye.uncorrected || 'N/A'} SC, ${leftEye.corrected || 'N/A'} CC\n`;
  } else {
    summary += `- Not recorded\n`;
  }
  
  // Add IOP information
  summary += `\nIntraocular Pressure:\n`;
  if (examination.intraocularPressure) {
    summary += `- Right Eye: ${examination.intraocularPressure.rightEye || 'N/A'} mmHg\n`;
    summary += `- Left Eye: ${examination.intraocularPressure.leftEye || 'N/A'} mmHg\n`;
  } else {
    summary += `- Not recorded\n`;
  }
  
  // Add anterior and posterior segment
  summary += `\nAnterior Segment: ${examination.anteriorSegment || 'Not recorded'}\n`;
  summary += `Posterior Segment: ${examination.posteriorSegment || 'Not recorded'}\n`;
  
  // Add diagnosis and plan
  summary += `\nDiagnosis: ${examination.diagnosis && examination.diagnosis.length > 0 ? examination.diagnosis.join(', ') : 'No diagnosis recorded'}\n`;
  summary += `Plan: ${examination.plan || 'No plan recorded'}\n`;
  
  // Add follow-up
  summary += `Follow-up: ${examination.followUp || 'No follow-up recorded'}\n`;
  
  return summary;
}

/**
 * Generate a summary for appointment data
 */
function generateAppointmentSummary(appointment: any): string {
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  let summary = `Appointment Summary\n\n`;
  summary += `Date: ${appointment.date ? new Date(appointment.date).toLocaleDateString() : 'No date'}\n`;
  summary += `Time: ${formatTime(appointment.startTime)} to ${formatTime(appointment.endTime)}\n`;
  summary += `Type: ${appointment.type ? appointment.type.replace('-', ' ') : 'Not specified'}\n`;
  summary += `Status: ${appointment.status ? appointment.status.replace('-', ' ') : 'Not specified'}\n\n`;
  
  if (appointment.notes) {
    summary += `Notes: ${appointment.notes}\n\n`;
  }
  
  // Add any key action items or recommendations
  summary += `Key Points:\n`;
  
  if (appointment.status === 'scheduled') {
    summary += `- Patient is scheduled to arrive at ${formatTime(appointment.startTime)}.\n`;
    summary += `- Appointment type is ${appointment.type.replace('-', ' ')}.\n`;
  } else if (appointment.status === 'checked-in') {
    summary += `- Patient has checked in and is waiting to be seen.\n`;
    summary += `- Pre-testing may be required before the examination.\n`;
  } else if (appointment.status === 'in-progress') {
    summary += `- Patient is currently being examined.\n`;
    summary += `- Documentation should be completed promptly after the examination.\n`;
  } else if (appointment.status === 'completed') {
    summary += `- Appointment has been completed.\n`;
    summary += `- Follow-up should be scheduled if recommended in the examination.\n`;
  } else if (appointment.status === 'cancelled') {
    summary += `- This appointment was cancelled.\n`;
    summary += `- Patient should be contacted to reschedule if necessary.\n`;
  }
  
  return summary;
}

/**
 * Generate a summary for SOAP note data
 */
function generateSOAPSummary(soapNote: any): string {
  let summary = `SOAP Note Summary\n\n`;
  
  // Extract key information from the Subjective section
  summary += `Patient Reported: `;
  if (soapNote.subjective) {
    const subjective = soapNote.subjective.toLowerCase();
    const chiefComplaints = [];
    
    // Check for common reported symptoms
    if (subjective.includes('blur')) chiefComplaints.push('blurry vision');
    if (subjective.includes('pain')) chiefComplaints.push('eye pain');
    if (subjective.includes('red')) chiefComplaints.push('redness');
    if (subjective.includes('itchy') || subjective.includes('itch')) chiefComplaints.push('itchiness');
    if (subjective.includes('burn')) chiefComplaints.push('burning sensation');
    if (subjective.includes('discharge')) chiefComplaints.push('discharge');
    if (subjective.includes('dry')) chiefComplaints.push('dry eyes');
    if (subjective.includes('float')) chiefComplaints.push('floaters');
    if (subjective.includes('flash')) chiefComplaints.push('flashes of light');
    if (subjective.includes('double')) chiefComplaints.push('double vision');
    
    if (chiefComplaints.length > 0) {
      summary += chiefComplaints.join(', ');
    } else {
      // Just take the first sentence if we couldn't extract specific complaints
      const firstSentence = soapNote.subjective.split('.')[0];
      summary += firstSentence;
    }
  } else {
    summary += 'No subjective information recorded';
  }
  summary += `.\n\n`;
  
  // Extract key findings from Objective section
  summary += `Key Findings:\n`;
  if (soapNote.objective) {
    const objective = soapNote.objective;
    
    // Extract visual acuity
    const vaMatch = objective.match(/VA\s+OD\s+(\d+\/\d+)[^.]*VA\s+OS\s+(\d+\/\d+)/i) ||
                    objective.match(/VA\s+OD\s+(\d+\/\d+).*?OS\s+(\d+\/\d+)/i);
    if (vaMatch) {
      summary += `- Visual Acuity: ${vaMatch[1]} OD, ${vaMatch[2]} OS\n`;
    }
    
    // Extract IOP
    const iopMatch = objective.match(/IOP[^0-9]*(\d+)[^0-9]*OD[^0-9]*(\d+)[^0-9]*OS/i) ||
                     objective.match(/IOP[^0-9]*(\d+)[^0-9]*(\d+)/i);
    if (iopMatch) {
      summary += `- IOP: ${iopMatch[1]} mmHg OD, ${iopMatch[2]} mmHg OS\n`;
    }
  } else {
    summary += `- No objective findings recorded\n`;
  }
  
  // Add assessment
  summary += `\nAssessment:\n`;
  if (soapNote.icd10Codes && soapNote.icd10Codes.length > 0) {
    soapNote.icd10Codes.forEach((code: any) => {
      summary += `- ${code.code}: ${code.description}\n`;
    });
  } else if (soapNote.assessment) {
    const assessmentLines = soapNote.assessment.split('\n').filter(Boolean);
    assessmentLines.slice(0, 3).forEach((line: string) => {
      summary += `- ${line}\n`;
    });
  } else {
    summary += `- No assessment recorded\n`;
  }
  
  // Add plan
  summary += `\nPlan:\n`;
  if (soapNote.plan) {
    const planLines = soapNote.plan.split('\n').filter(Boolean);
    planLines.slice(0, 3).forEach((line: string) => {
      summary += `- ${line}\n`;
    });
    
    if (soapNote.returnToClinic) {
      summary += `- Return to clinic in ${soapNote.returnToClinic}\n`;
    }
  } else {
    summary += `- No plan recorded\n`;
  }
  
  // Add MIPS compliance
  if (soapNote.mipsCompliant) {
    summary += `\nThis note is MIPS compliant.`;
    if (soapNote.mipsCategories && soapNote.mipsCategories.length > 0) {
      summary += ` Categories: ${soapNote.mipsCategories.join(', ')}`;
    }
  }
  
  return summary;
}

/**
 * Local fallback processing in case the Edge Function fails
 * or for development without an Edge Function
 */
function simulateProcessing(input: string, fields: FormField[]): FormField[] {
  console.log('Using local simulation for input:', input);
  
  // Create a deep copy of the fields to avoid direct mutation
  const updatedFields = JSON.parse(JSON.stringify(fields));
  
  // Simple rules-based processing
  const inputLower = input.toLowerCase();
  
  // Process fields based on input text
  updatedFields.forEach((field: FormField) => {
    const fieldNameLower = field.name.toLowerCase();
    const fieldLabelLower = field.label.toLowerCase();
    
    // Handle nested fields (e.g., vision.rightEye.uncorrected)
    const fieldParts = field.name.split('.');
    const isNestedField = fieldParts.length > 1;
    
    // Extract field base names for matching
    const baseFieldName = isNestedField ? fieldParts[fieldParts.length - 1].toLowerCase() : fieldNameLower;
    const parentField = isNestedField ? fieldParts[0].toLowerCase() : '';
    const eyeField = isNestedField && fieldParts.length > 1 ? fieldParts[1].toLowerCase() : '';
    
    // Name fields
    if (fieldNameLower.includes('name') || fieldLabelLower.includes('name')) {
      if ((fieldNameLower.includes('first') || fieldLabelLower.includes('first')) && 
          (inputLower.includes('name') || inputLower.match(/\b[A-Za-z]+\b/))) {
        const nameMatch = input.match(/first\s+name\s+(?:is\s+)?([A-Za-z]+)/i) ||
                         input.match(/name\s+(?:is\s+)?([A-Za-z]+)/i) ||
                         input.match(/\b([A-Za-z]+)\b/);
        if (nameMatch && nameMatch[1]) field.value = nameMatch[1];
      }
      
      if ((fieldNameLower.includes('last') || fieldLabelLower.includes('last')) && 
          (inputLower.includes('last') || inputLower.match(/\s[A-Za-z]+\b/))) {
        const nameMatch = input.match(/last\s+name\s+(?:is\s+)?([A-Za-z]+)/i) ||
                         input.match(/\s([A-Za-z]+)(?:\s|$)/);
        if (nameMatch && nameMatch[1] && !field.value) field.value = nameMatch[1];
      }
    }
    
    // Email matching
    if (fieldNameLower.includes('email') || fieldLabelLower.includes('email')) {
      const match = input.match(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/);
      if (match && match[1]) field.value = match[1];
    }
    
    // Phone matching
    if (fieldNameLower.includes('phone') || fieldLabelLower.includes('phone')) {
      const match = input.match(/\b(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b/) ||
                   input.match(/phone\s+(?:number\s+)?(?:is\s+)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i) ||
                   input.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (match && match[1]) field.value = match[1];
    }
    
    // Date fields
    if (fieldNameLower.includes('date') || fieldLabelLower.includes('date') || field.type === 'date') {
      const match = input.match(/\b(\d{1,2}\/\d{1,2}\/\d{4})\b/) || 
                   input.match(/\b(\d{4}-\d{1,2}-\d{1,2})\b/) ||
                   input.match(/born\s+(?:on\s+)?(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
                   input.match(/birth(?:day|date)?\s+(?:is\s+)?(\d{1,2}\/\d{1,2}\/\d{4})/i);
      if (match && match[1]) {
        // Convert to YYYY-MM-DD if needed
        if (match[1].includes('/')) {
          const parts = match[1].split('/');
          if (parts.length === 3) {
            field.value = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
        } else {
          field.value = match[1];
        }
      }
    }
    
    // Age matching
    if (fieldNameLower.includes('age') || fieldLabelLower.includes('age')) {
      const match = input.match(/\b(\d+)\s+years?\s+old\b/) || 
                   input.match(/age\s+(?:is\s+)?(\d+)/i);
      if (match && match[1]) field.value = parseInt(match[1]);
    }
    
    // Gender field
    if (fieldNameLower.includes('gender') || fieldLabelLower.includes('gender')) {
      if (inputLower.includes('male') && !inputLower.includes('female')) field.value = 'male';
      if (inputLower.includes('female')) field.value = 'female';
      if (inputLower.includes('other')) field.value = 'other';
    }
    
    // Address field
    if (fieldNameLower.includes('address') || fieldLabelLower.includes('address')) {
      const match = input.match(/\b\d+\s+[A-Za-z0-9\s,\.]+(?:Avenue|Ave|Street|St|Road|Rd|Drive|Dr|Lane|Ln|Place|Pl|Court|Ct|Boulevard|Blvd)\b/i) ||
                   input.match(/address\s+(?:is\s+)?([^\.]+)/i);
      if (match) field.value = match[0] || match[1];
    }
    
    // Blood type field
    if (fieldNameLower.includes('blood') || fieldLabelLower.includes('blood type')) {
      const bloodTypeMatch = input.match(/blood\s+type\s+(?:is\s+)?([ABO][+-])/i) ||
                            input.match(/\b([ABO][+-])\s+blood\s+type\b/i) ||
                            input.match(/\b(type\s+[ABO][+-])\b/i);
      if (bloodTypeMatch && bloodTypeMatch[1]) {
        field.value = bloodTypeMatch[1].toUpperCase();
      }
    }
    
    // Height field
    if (fieldNameLower.includes('height') || fieldLabelLower.includes('height')) {
      const heightMatch = input.match(/height\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*(?:cm|centimeters?)/i) ||
                          input.match(/(\d+(?:\.\d+)?)\s*(?:cm|centimeters?)/i);
      if (heightMatch && heightMatch[1]) {
        field.value = parseFloat(heightMatch[1]);
      } else {
        // Try to convert from feet/inches to cm
        const feetInchesMatch = input.match(/(\d+)(?:'|ft|feet)(?:\s+(\d+)(?:"|in|inches?)?)?/i);
        if (feetInchesMatch) {
          const feet = parseInt(feetInchesMatch[1], 10);
          const inches = feetInchesMatch[2] ? parseInt(feetInchesMatch[2], 10) : 0;
          const totalInches = feet * 12 + inches;
          const cm = Math.round(totalInches * 2.54);
          field.value = cm;
        }
      }
    }
    
    // Weight field
    if (fieldNameLower.includes('weight') || fieldLabelLower.includes('weight')) {
      const weightMatch = input.match(/weight\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)/i) ||
                          input.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)/i);
      if (weightMatch && weightMatch[1]) {
        field.value = parseFloat(weightMatch[1]);
      } else {
        // Try to convert from pounds to kg
        const poundsMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds)/i);
        if (poundsMatch) {
          const pounds = parseFloat(poundsMatch[1]);
          const kg = Math.round(pounds * 0.45359237 * 10) / 10; // Round to 1 decimal place
          field.value = kg;
        }
      }
    }
    
    // Emergency contact fields
    if (fieldNameLower.includes('emergencycontactname') || fieldLabelLower.includes('emergency contact name')) {
      const match = input.match(/emergency\s+contact(?:'s)?\s+name\s+(?:is\s+)?([A-Za-z\s]+)/i) ||
                   input.match(/emergency\s+contact(?:\s+is)?\s+([A-Za-z\s]+)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    if (fieldNameLower.includes('emergencycontactrelationship') || fieldLabelLower.includes('emergency contact relationship')) {
      const match = input.match(/emergency\s+contact\s+relationship\s+(?:is\s+)?([A-Za-z\s]+)/i) ||
                   input.match(/emergency\s+contact\s+is(?:\s+(?:my|a|the))?\s+([A-Za-z]+)/i) ||
                   input.match(/\(([A-Za-z]+)\)/i);
      if (match && match[1]) field.value = match[1].trim().toLowerCase();
    }
    
    // Background fields
    if (fieldNameLower.includes('language') || fieldLabelLower.includes('language')) {
      const match = input.match(/language\s+(?:is\s+)?([A-Za-z]+)/i) ||
                   input.match(/speaks\s+([A-Za-z]+)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    if (fieldNameLower.includes('ethnicity') || fieldLabelLower.includes('ethnicity')) {
      const match = input.match(/ethnicity\s+(?:is\s+)?([A-Za-z\s]+)/i) ||
                   input.match(/(?:is\s+)([A-Za-z]+)\s+ethnicity/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    if (fieldNameLower.includes('race') || fieldLabelLower.includes('race')) {
      const match = input.match(/race\s+(?:is\s+)?([A-Za-z\s]+)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    // Occupation field
    if (fieldNameLower.includes('occupation') || fieldLabelLower.includes('occupation')) {
      const match = input.match(/occupation\s+(?:is\s+)?([A-Za-z\s]+)/i) ||
                   input.match(/(?:is|as)\s+a(?:n)?\s+([A-Za-z\s]+)/i) ||
                   input.match(/works\s+as\s+a(?:n)?\s+([A-Za-z\s]+)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    // Substance use fields
    if (fieldNameLower.includes('smoking') || fieldLabelLower.includes('smoking')) {
      if (inputLower.includes('never smoke') || inputLower.includes('non-smoker') || inputLower.includes('nonsmoker')) {
        field.value = 'Never smoker';
      } else if (inputLower.includes('former smoke') || inputLower.includes('quit smoking')) {
        field.value = 'Former smoker';
      } else if (inputLower.includes('current smoke') || inputLower.includes('does smoke')) {
        field.value = 'Current smoker';
      }
    }
    
    if (fieldNameLower.includes('alcohol') || fieldLabelLower.includes('alcohol')) {
      if (inputLower.includes('no alcohol') || inputLower.includes('doesn\'t drink') || inputLower.includes('does not drink')) {
        field.value = 'None';
      } else if (inputLower.includes('occasional') || inputLower.includes('socially')) {
        field.value = 'Occasional';
      } else if (inputLower.includes('moderate')) {
        field.value = 'Moderate';
      } else if (inputLower.includes('heavy') || inputLower.includes('daily')) {
        field.value = 'Heavy';
      }
    }
    
    // Chief complaint field
    if (fieldNameLower.includes('complaint') || fieldLabelLower.includes('complaint')) {
      const match = input.match(/with\s+(.+?)(?:for|since|\.|\n|$)/i) ||
                   input.match(/complaint\s+(?:is\s+)?(.+?)(?:\.|\n|$)/i) ||
                   input.match(/presents\s+with\s+(.+?)(?:\.|\n|$)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    // Allergies
    if (fieldNameLower.includes('allerg') || fieldLabelLower.includes('allerg')) {
      const match = input.match(/allerg(?:y|ies)\s+(?:to\s+)?(.+?)(?:\.|\n|$)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    // Medications
    if (fieldNameLower.includes('medication') || fieldLabelLower.includes('medication')) {
      const match = input.match(/medication(?:s)?\s+(?:include\s+)?(.+?)(?:\.|\n|$)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    // Surgeries
    if (fieldNameLower.includes('surgeries') || fieldLabelLower.includes('surgeries')) {
      const match = input.match(/surg(?:ery|eries)\s+(?:include|history)?\s+(.+?)(?:\.|\n|$)/i) ||
                   input.match(/had\s+(?:a\s+)?([A-Za-z\s]+)\s+surgery/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    // Exercise
    if (fieldNameLower.includes('exercise') || fieldLabelLower.includes('exercise')) {
      const match = input.match(/exercise(?:s)?\s+(.+?)(?:\.|\n|$)/i) || 
                   input.match(/(?:works out|physical activity)\s+(.+?)(?:\.|\n|$)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    // Nutrition
    if (fieldNameLower.includes('nutrition') || fieldLabelLower.includes('nutrition')) {
      const match = input.match(/(?:nutrition|diet)\s+(.+?)(?:\.|\n|$)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    // Stress
    if (fieldNameLower.includes('stress') || fieldLabelLower.includes('stress')) {
      const match = input.match(/stress\s+(.+?)(?:\.|\n|$)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    // Family History
    if (fieldNameLower.includes('familyhistory') || fieldLabelLower.includes('family history')) {
      const match = input.match(/family\s+(?:medical\s+)?history\s+(?:of\s+)?(.+?)(?:\.|\n|$)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    // Insurance
    if (fieldNameLower.includes('insurance') || fieldLabelLower.includes('insurance')) {
      const match = input.match(/insurance\s+(?:is\s+)?(.+?)(?:\.|\n|$)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    // Medical history
    if (fieldNameLower === 'medicalhistory' || fieldLabelLower === 'medical history') {
      const match = input.match(/history\s+(?:of\s+)?(.+?)(?:\.|\n|$)/i) || 
                   input.match(/(?:has|with)\s+(.+?)(?:\.|\n|$)/i);
      if (match && match[1]) field.value = match[1].trim();
    }
    
    // Vision fields (specialized for eye examinations)
    if (parentField === 'vision') {
      const rightEyePatterns = [
        /vision(?:\s+right(?:\s+eye)?|\s+OD)?\s+(?:is\s+)?(?:uncorrected\s+)?(\d+\/\d+)/i,
        /(?:uncorrected\s+)?(?:right|OD)(?:\s+eye)?\s+vision\s+(?:is\s+)?(\d+\/\d+)/i,
        /VA\s+OD\s+(?:is\s+)?(\d+\/\d+)\s+SC/i,
        /right\s+eye\s+(?:is\s+)?(\d+\/\d+)/i
      ];
      
      const leftEyePatterns = [
        /vision(?:\s+left(?:\s+eye)?|\s+OS)?\s+(?:is\s+)?(?:uncorrected\s+)?(\d+\/\d+)/i,
        /(?:uncorrected\s+)?(?:left|OS)(?:\s+eye)?\s+vision\s+(?:is\s+)?(\d+\/\d+)/i, 
        /VA\s+OS\s+(?:is\s+)?(\d+\/\d+)\s+SC/i,
        /left\s+eye\s+(?:is\s+)?(\d+\/\d+)/i
      ];
      
      const rightCorrectedPatterns = [
        /(?:corrected\s+)?(?:right|OD)(?:\s+eye)?\s+(?:vision\s+)?(?:is\s+)?(?:corrected\s+to\s+)?(\d+\/\d+)\s+(?:cc|with correction)/i,
        /VA\s+OD\s+(?:is\s+)?\d+\/\d+\s+SC,\s+(\d+\/\d+)\s+cc/i
      ];
      
      const leftCorrectedPatterns = [
        /(?:corrected\s+)?(?:left|OS)(?:\s+eye)?\s+(?:vision\s+)?(?:is\s+)?(?:corrected\s+to\s+)?(\d+\/\d+)\s+(?:cc|with correction)/i,
        /VA\s+OS\s+(?:is\s+)?\d+\/\d+\s+SC,\s+(\d+\/\d+)\s+cc/i
      ];
      
      if (eyeField === 'righteye') {
        if (baseFieldName === 'uncorrected') {
          for (const pattern of rightEyePatterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
              field.value = match[1];
              break;
            }
          }
        } else if (baseFieldName === 'corrected') {
          for (const pattern of rightCorrectedPatterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
              field.value = match[1];
              break;
            }
          }
        }
      } else if (eyeField === 'lefteye') {
        if (baseFieldName === 'uncorrected') {
          for (const pattern of leftEyePatterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
              field.value = match[1];
              break;
            }
          }
        } else if (baseFieldName === 'corrected') {
          for (const pattern of leftCorrectedPatterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
              field.value = match[1];
              break;
            }
          }
        }
      }
    }
    
    // Intraocular pressure (IOP) fields
    if (parentField === 'intraocularpressure') {
      if (eyeField === 'righteye') {
        const patterns = [
          /IOP\s+(?:OD|right(?:\s+eye)?)\s+(?:is\s+)?(\d+)\s*(?:mmHg)?/i,
          /IOP\s+(?:is\s+)?(\d+)\s*(?:mmHg)?\s+(?:OD|right(?:\s+eye)?)/i,
          /IOP(?:[^\d]+)?(\d+)(?:[^\d]+)(?:\d+)(?:[^\d]+)(?:OD|right)/i,
          /pressure(?:[^\d]+)?(\d+)(?:[^\d]+)(?:OD|right)/i
        ];
        
        for (const pattern of patterns) {
          const match = input.match(pattern);
          if (match && match[1]) {
            field.value = parseInt(match[1]);
            break;
          }
        }
      } else if (eyeField === 'lefteye') {
        const patterns = [
          /IOP\s+(?:OS|left(?:\s+eye)?)\s+(?:is\s+)?(\d+)\s*(?:mmHg)?/i,
          /IOP\s+(?:is\s+)?(\d+)\s*(?:mmHg)?\s+(?:OS|left(?:\s+eye)?)/i,
          /IOP(?:[^\d]+)?(?:\d+)(?:[^\d]+)(\d+)(?:[^\d]+)(?:OS|left)/i,
          /pressure(?:[^\d]+)?(?:\d+)(?:[^\d]+)(\d+)(?:[^\d]+)(?:OS|left)/i
        ];
        
        for (const pattern of patterns) {
          const match = input.match(pattern);
          if (match && match[1]) {
            field.value = parseInt(match[1]);
            break;
          }
        }
      }
    }
    
    // Diagnosis field
    if (fieldNameLower === 'diagnosis' || fieldLabelLower === 'diagnosis') {
      const commonDiagnoses = [
        { term: 'myopia', code: 'H52.1' },
        { term: 'hyperopia', code: 'H52.0' },
        { term: 'astigmatism', code: 'H52.2' },
        { term: 'presbyopia', code: 'H52.4' },
        { term: 'cataract', code: 'H25' },
        { term: 'glaucoma', code: 'H40' },
        { term: 'macular degeneration', code: 'H35.3' },
        { term: 'dry eye', code: 'H04.12' },
        { term: 'conjunctivitis', code: 'H10' },
        { term: 'keratitis', code: 'H16' }
      ];
      
      const diagnoses = [];
      for (const diagnosis of commonDiagnoses) {
        if (inputLower.includes(diagnosis.term)) {
          diagnoses.push(`${diagnosis.code} - ${diagnosis.term.charAt(0).toUpperCase() + diagnosis.term.slice(1)}`);
        }
      }
      
      if (diagnoses.length > 0) {
        field.value = diagnoses.join(', ');
      }
    }
    
    // Anterior segment
    if (fieldNameLower === 'anteriorsegment' || fieldLabelLower.includes('anterior segment')) {
      const patterns = [
        /anterior\s+segment(?:[^\.]+)(?:shows|reveals|with)\s+([^\.]+)/i,
        /anterior\s+segment[:\s]+([^\.]+)/i,
        /slit\s+lamp(?:[^\.]+)(?:shows|reveals|with)\s+([^\.]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
          field.value = match[1].trim();
          break;
        }
      }
    }
    
    // Posterior segment
    if (fieldNameLower === 'posteriorsegment' || fieldLabelLower.includes('posterior segment')) {
      const patterns = [
        /posterior\s+segment(?:[^\.]+)(?:shows|reveals|with)\s+([^\.]+)/i,
        /posterior\s+segment[:\s]+([^\.]+)/i,
        /fundoscopic\s+exam(?:[^\.]+)(?:shows|reveals|with)\s+([^\.]+)/i,
        /fundus\s+exam(?:[^\.]+)(?:shows|reveals|with)\s+([^\.]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
          field.value = match[1].trim();
          break;
        }
      }
    }
    
    // Plan field
    if (fieldNameLower === 'plan' || fieldLabelLower.includes('plan')) {
      const patterns = [
        /plan(?:[^\.]+)(?:is|includes)\s+([^\.]+)/i,
        /plan[:\s]+([^\.]+)/i,
        /recommend(?:ations|ed)?[:\s]+([^\.]+)/i,
        /(?:prescribe|prescribed)[:\s]+([^\.]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
          field.value = match[1].trim();
          break;
        }
      }
    }
    
    // Follow-up field
    if (fieldNameLower === 'followup' || fieldLabelLower.includes('follow up')) {
      const patterns = [
        /follow(?:-|\s)?up(?:[^\.]+)(?:in|after)\s+([^\.]+)/i,
        /return(?:[^\.]+)(?:in|after)\s+([^\.]+)/i,
        /(?:come back|see again)(?:[^\.]+)(?:in|after)\s+([^\.]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
          field.value = match[1].trim();
          break;
        }
      }
    }
  });
  
  return updatedFields;
}