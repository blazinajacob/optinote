import { create } from 'zustand';
import { Examination, SOAPNote, ExamImage, ICD10Code } from '../types';
import { supabase } from '../lib/supabase';

interface ExaminationState {
  examinations: Examination[];
  selectedExamination: Examination | null;
  soapNotes: SOAPNote[];
  selectedSoapNote: SOAPNote | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getExaminationsByPatientId: (patientId: string) => Promise<void>;
  getExaminationById: (id: string) => Promise<void>;
  createExamination: (examination: Omit<Examination, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Examination>;
  updateExamination: (id: string, examinationData: Partial<Examination>) => Promise<void>;
  getSoapNoteByExaminationId: (examinationId: string) => Promise<void>;
  getSoapNotesByPatientId: (patientId: string) => Promise<void>; // Added missing function declaration
  createSoapNote: (soapNote: Omit<SOAPNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SOAPNote>;
  updateSoapNote: (id: string, soapNoteData: Partial<SOAPNote>) => Promise<void>;
}

export const useExaminationStore = create<ExaminationState>((set, get) => ({
  examinations: [],
  selectedExamination: null,
  soapNotes: [],
  selectedSoapNote: null,
  isLoading: false,
  error: null,
  
  getExaminationsByPatientId: async (patientId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Fetch examinations for this patient
      const { data, error } = await supabase
        .from('examinations')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const examinations: Examination[] = data.map(e => ({
        id: e.id,
        patientId: e.patient_id,
        doctorId: e.doctor_id,
        date: e.date,
        chiefComplaint: e.chief_complaint,
        vision: e.vision as any,
        intraocularPressure: e.intraocular_pressure as any,
        refraction: e.refraction as any,
        pupils: e.pupils as any,
        anteriorSegment: e.anterior_segment || undefined,
        posteriorSegment: e.posterior_segment || undefined,
        diagnosis: e.diagnosis || undefined,
        plan: e.plan || undefined,
        followUp: e.follow_up || undefined,
        status: e.status as 'in-progress' | 'completed',
        images: [],
        createdAt: e.created_at,
        updatedAt: e.updated_at
      }));
      
      // Fetch images for each examination
      for (const exam of examinations) {
        const { data: imageData, error: imageError } = await supabase
          .from('exam_images')
          .select('*')
          .eq('examination_id', exam.id);
        
        if (!imageError && imageData) {
          exam.images = imageData.map(img => ({
            id: img.id,
            examinationId: img.examination_id,
            type: img.type as 'fundus' | 'oct' | 'topography' | 'other',
            url: img.url,
            notes: img.notes || undefined,
            createdAt: img.created_at
          }));
        }
      }
      
      set({ examinations, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch examinations', isLoading: false });
    }
  },
  
  getExaminationById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('examinations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const examination: Examination = {
        id: data.id,
        patientId: data.patient_id,
        doctorId: data.doctor_id,
        date: data.date,
        chiefComplaint: data.chief_complaint,
        vision: data.vision as any,
        intraocularPressure: data.intraocular_pressure as any,
        refraction: data.refraction as any,
        pupils: data.pupils as any,
        anteriorSegment: data.anterior_segment || undefined,
        posteriorSegment: data.posterior_segment || undefined,
        diagnosis: data.diagnosis || undefined,
        plan: data.plan || undefined,
        followUp: data.follow_up || undefined,
        status: data.status as 'in-progress' | 'completed',
        images: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Fetch images for this examination
      const { data: imageData, error: imageError } = await supabase
        .from('exam_images')
        .select('*')
        .eq('examination_id', id);
      
      if (!imageError && imageData) {
        examination.images = imageData.map(img => ({
          id: img.id,
          examinationId: img.examination_id,
          type: img.type as 'fundus' | 'oct' | 'topography' | 'other',
          url: img.url,
          notes: img.notes || undefined,
          createdAt: img.created_at
        }));
      }
      
      set({ selectedExamination: examination, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch examination details', isLoading: false });
    }
  },
  
  createExamination: async (examinationData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Transform from application model to database structure
      const dbExamination = {
        patient_id: examinationData.patientId,
        doctor_id: examinationData.doctorId,
        date: examinationData.date,
        chief_complaint: examinationData.chiefComplaint,
        vision: examinationData.vision,
        intraocular_pressure: examinationData.intraocularPressure || null,
        refraction: examinationData.refraction || null,
        pupils: examinationData.pupils || null,
        anterior_segment: examinationData.anteriorSegment || null,
        posterior_segment: examinationData.posteriorSegment || null,
        diagnosis: examinationData.diagnosis || null,
        plan: examinationData.plan || null,
        follow_up: examinationData.followUp || null,
        status: examinationData.status
      };
      
      const { data, error } = await supabase
        .from('examinations')
        .insert(dbExamination)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const newExamination: Examination = {
        id: data.id,
        patientId: data.patient_id,
        doctorId: data.doctor_id,
        date: data.date,
        chiefComplaint: data.chief_complaint,
        vision: data.vision as any,
        intraocularPressure: data.intraocular_pressure as any,
        refraction: data.refraction as any,
        pupils: data.pupils as any,
        anteriorSegment: data.anterior_segment || undefined,
        posteriorSegment: data.posterior_segment || undefined,
        diagnosis: data.diagnosis || undefined,
        plan: data.plan || undefined,
        followUp: data.follow_up || undefined,
        status: data.status as 'in-progress' | 'completed',
        images: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      set(state => ({ 
        examinations: [...state.examinations, newExamination],
        selectedExamination: newExamination,
        isLoading: false 
      }));
      
      return newExamination;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create examination', isLoading: false });
      throw error;
    }
  },
  
  updateExamination: async (id: string, examinationData: Partial<Examination>) => {
    set({ isLoading: true, error: null });
    
    try {
      // Transform from application model to database structure
      const dbExamination: any = {};
      
      if (examinationData.patientId !== undefined) dbExamination.patient_id = examinationData.patientId;
      if (examinationData.doctorId !== undefined) dbExamination.doctor_id = examinationData.doctorId;
      if (examinationData.date !== undefined) dbExamination.date = examinationData.date;
      if (examinationData.chiefComplaint !== undefined) dbExamination.chief_complaint = examinationData.chiefComplaint;
      if (examinationData.vision !== undefined) dbExamination.vision = examinationData.vision;
      if (examinationData.intraocularPressure !== undefined) dbExamination.intraocular_pressure = examinationData.intraocularPressure;
      if (examinationData.refraction !== undefined) dbExamination.refraction = examinationData.refraction;
      if (examinationData.pupils !== undefined) dbExamination.pupils = examinationData.pupils;
      if (examinationData.anteriorSegment !== undefined) dbExamination.anterior_segment = examinationData.anteriorSegment;
      if (examinationData.posteriorSegment !== undefined) dbExamination.posterior_segment = examinationData.posteriorSegment;
      if (examinationData.diagnosis !== undefined) dbExamination.diagnosis = examinationData.diagnosis;
      if (examinationData.plan !== undefined) dbExamination.plan = examinationData.plan;
      if (examinationData.followUp !== undefined) dbExamination.follow_up = examinationData.followUp;
      if (examinationData.status !== undefined) dbExamination.status = examinationData.status;
      
      // Add updated_at timestamp
      dbExamination.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('examinations')
        .update(dbExamination)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const updatedExamination: Examination = {
        id: data.id,
        patientId: data.patient_id,
        doctorId: data.doctor_id,
        date: data.date,
        chiefComplaint: data.chief_complaint,
        vision: data.vision as any,
        intraocularPressure: data.intraocular_pressure as any,
        refraction: data.refraction as any,
        pupils: data.pupils as any,
        anteriorSegment: data.anterior_segment || undefined,
        posteriorSegment: data.posterior_segment || undefined,
        diagnosis: data.diagnosis || undefined,
        plan: data.plan || undefined,
        followUp: data.follow_up || undefined,
        status: data.status as 'in-progress' | 'completed',
        images: get().selectedExamination?.images || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Update the examination in the state
      set(state => {
        const updatedExaminations = state.examinations.map(e => 
          e.id === id ? updatedExamination : e
        );
        
        return {
          examinations: updatedExaminations,
          selectedExamination: updatedExamination,
          isLoading: false
        };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update examination', isLoading: false });
    }
  },
  
  // Added missing function to get SOAP notes by patient ID
  getSoapNotesByPatientId: async (patientId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('soap_notes')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const soapNotes: SOAPNote[] = data.map(note => ({
        id: note.id,
        examinationId: note.examination_id,
        patientId: note.patient_id,
        doctorId: note.doctor_id,
        subjective: note.subjective,
        objective: note.objective,
        assessment: note.assessment,
        plan: note.plan,
        icd10Codes: note.icd10_codes as ICD10Code[],
        mipsCompliant: note.mips_compliant,
        mipsCategories: note.mips_categories || undefined,
        returnToClinic: note.return_to_clinic || undefined,
        createdAt: note.created_at,
        updatedAt: note.updated_at
      }));
      
      set({ soapNotes, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch SOAP notes for patient', isLoading: false });
    }
  },
  
  getSoapNoteByExaminationId: async (examinationId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('soap_notes')
        .select('*')
        .eq('examination_id', examinationId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No SOAP note found for this examination
          set({ selectedSoapNote: null, isLoading: false });
          return;
        }
        throw error;
      }
      
      // Transform from database structure to application model
      const soapNote: SOAPNote = {
        id: data.id,
        examinationId: data.examination_id,
        patientId: data.patient_id,
        doctorId: data.doctor_id,
        subjective: data.subjective,
        objective: data.objective,
        assessment: data.assessment,
        plan: data.plan,
        icd10Codes: data.icd10_codes as ICD10Code[],
        mipsCompliant: data.mips_compliant,
        mipsCategories: data.mips_categories || undefined,
        returnToClinic: data.return_to_clinic || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      set({ selectedSoapNote: soapNote, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch SOAP note', isLoading: false });
    }
  },
  
  createSoapNote: async (soapNoteData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Transform from application model to database structure
      const dbSoapNote = {
        examination_id: soapNoteData.examinationId,
        patient_id: soapNoteData.patientId,
        doctor_id: soapNoteData.doctorId,
        subjective: soapNoteData.subjective,
        objective: soapNoteData.objective,
        assessment: soapNoteData.assessment,
        plan: soapNoteData.plan,
        icd10_codes: soapNoteData.icd10Codes,
        mips_compliant: soapNoteData.mipsCompliant,
        mips_categories: soapNoteData.mipsCategories || null,
        return_to_clinic: soapNoteData.returnToClinic || null
      };
      
      const { data, error } = await supabase
        .from('soap_notes')
        .insert(dbSoapNote)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const newSoapNote: SOAPNote = {
        id: data.id,
        examinationId: data.examination_id,
        patientId: data.patient_id,
        doctorId: data.doctor_id,
        subjective: data.subjective,
        objective: data.objective,
        assessment: data.assessment,
        plan: data.plan,
        icd10Codes: data.icd10_codes as ICD10Code[],
        mipsCompliant: data.mips_compliant,
        mipsCategories: data.mips_categories || undefined,
        returnToClinic: data.return_to_clinic || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      set(state => ({ 
        soapNotes: [...state.soapNotes, newSoapNote],
        selectedSoapNote: newSoapNote,
        isLoading: false 
      }));
      
      return newSoapNote;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create SOAP note', isLoading: false });
      throw error;
    }
  },
  
  updateSoapNote: async (id: string, soapNoteData: Partial<SOAPNote>) => {
    set({ isLoading: true, error: null });
    
    try {
      // Transform from application model to database structure
      const dbSoapNote: any = {};
      
      if (soapNoteData.examinationId !== undefined) dbSoapNote.examination_id = soapNoteData.examinationId;
      if (soapNoteData.patientId !== undefined) dbSoapNote.patient_id = soapNoteData.patientId;
      if (soapNoteData.doctorId !== undefined) dbSoapNote.doctor_id = soapNoteData.doctorId;
      if (soapNoteData.subjective !== undefined) dbSoapNote.subjective = soapNoteData.subjective;
      if (soapNoteData.objective !== undefined) dbSoapNote.objective = soapNoteData.objective;
      if (soapNoteData.assessment !== undefined) dbSoapNote.assessment = soapNoteData.assessment;
      if (soapNoteData.plan !== undefined) dbSoapNote.plan = soapNoteData.plan;
      if (soapNoteData.icd10Codes !== undefined) dbSoapNote.icd10_codes = soapNoteData.icd10Codes;
      if (soapNoteData.mipsCompliant !== undefined) dbSoapNote.mips_compliant = soapNoteData.mipsCompliant;
      if (soapNoteData.mipsCategories !== undefined) dbSoapNote.mips_categories = soapNoteData.mipsCategories;
      if (soapNoteData.returnToClinic !== undefined) dbSoapNote.return_to_clinic = soapNoteData.returnToClinic;
      
      // Add updated_at timestamp
      dbSoapNote.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('soap_notes')
        .update(dbSoapNote)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const updatedSoapNote: SOAPNote = {
        id: data.id,
        examinationId: data.examination_id,
        patientId: data.patient_id,
        doctorId: data.doctor_id,
        subjective: data.subjective,
        objective: data.objective,
        assessment: data.assessment,
        plan: data.plan,
        icd10Codes: data.icd10_codes as ICD10Code[],
        mipsCompliant: data.mips_compliant,
        mipsCategories: data.mips_categories || undefined,
        returnToClinic: data.return_to_clinic || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Update the SOAP note in the state
      set(state => {
        const updatedNotes = state.soapNotes.map(n => 
          n.id === id ? updatedSoapNote : n
        );
        
        return {
          soapNotes: updatedNotes,
          selectedSoapNote: updatedSoapNote,
          isLoading: false
        };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update SOAP note', isLoading: false });
    }
  }
}));