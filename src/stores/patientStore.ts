import { create } from 'zustand';
import { Patient } from '../types';
import { supabase } from '../lib/supabase';

interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getPatients: () => Promise<void>;
  getPatientById: (id: string) => Promise<void>;
  createPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePatient: (id: string, patientData: Partial<Patient>) => Promise<void>;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  selectedPatient: null,
  isLoading: false,
  error: null,
  
  getPatients: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('last_name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const patients: Patient[] = data.map(p => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        dateOfBirth: p.date_of_birth,
        gender: p.gender as 'male' | 'female' | 'other',
        phone: p.phone,
        email: p.email || undefined,
        address: p.address || undefined,
        insuranceProvider: p.insurance_provider || undefined,
        insurancePolicyNumber: p.insurance_policy_number || undefined,
        medicalHistory: p.medical_history || undefined,
        allergies: p.allergies || undefined,
        medications: p.medications || undefined,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));
      
      set({ patients, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch patients', isLoading: false });
    }
  },
  
  getPatientById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const patient: Patient = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        dateOfBirth: data.date_of_birth,
        gender: data.gender as 'male' | 'female' | 'other',
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        insuranceProvider: data.insurance_provider || undefined,
        insurancePolicyNumber: data.insurance_policy_number || undefined,
        medicalHistory: data.medical_history || undefined,
        allergies: data.allergies || undefined,
        medications: data.medications || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      set({ selectedPatient: patient, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch patient details', isLoading: false });
    }
  },
  
  createPatient: async (patientData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Transform from application model to database structure
      const dbPatient = {
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        date_of_birth: patientData.dateOfBirth,
        gender: patientData.gender,
        phone: patientData.phone,
        email: patientData.email || null,
        address: patientData.address || null,
        insurance_provider: patientData.insuranceProvider || null,
        insurance_policy_number: patientData.insurancePolicyNumber || null,
        medical_history: patientData.medicalHistory || null,
        allergies: patientData.allergies || null,
        medications: patientData.medications || null,
      };
      
      const { data, error } = await supabase
        .from('patients')
        .insert(dbPatient)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Add the new patient to the state
      const newPatient: Patient = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        dateOfBirth: data.date_of_birth,
        gender: data.gender as 'male' | 'female' | 'other',
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        insuranceProvider: data.insurance_provider || undefined,
        insurancePolicyNumber: data.insurance_policy_number || undefined,
        medicalHistory: data.medical_history || undefined,
        allergies: data.allergies || undefined,
        medications: data.medications || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      set(state => ({ 
        patients: [...state.patients, newPatient],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create patient', isLoading: false });
    }
  },
  
  updatePatient: async (id: string, patientData: Partial<Patient>) => {
    set({ isLoading: true, error: null });
    
    try {
      // Transform from application model to database structure
      const dbPatient: any = {};
      
      if (patientData.firstName !== undefined) dbPatient.first_name = patientData.firstName;
      if (patientData.lastName !== undefined) dbPatient.last_name = patientData.lastName;
      if (patientData.dateOfBirth !== undefined) dbPatient.date_of_birth = patientData.dateOfBirth;
      if (patientData.gender !== undefined) dbPatient.gender = patientData.gender;
      if (patientData.phone !== undefined) dbPatient.phone = patientData.phone;
      if (patientData.email !== undefined) dbPatient.email = patientData.email;
      if (patientData.address !== undefined) dbPatient.address = patientData.address;
      if (patientData.insuranceProvider !== undefined) dbPatient.insurance_provider = patientData.insuranceProvider;
      if (patientData.insurancePolicyNumber !== undefined) dbPatient.insurance_policy_number = patientData.insurancePolicyNumber;
      if (patientData.medicalHistory !== undefined) dbPatient.medical_history = patientData.medicalHistory;
      if (patientData.allergies !== undefined) dbPatient.allergies = patientData.allergies;
      if (patientData.medications !== undefined) dbPatient.medications = patientData.medications;
      
      // Add updated_at timestamp
      dbPatient.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('patients')
        .update(dbPatient)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const updatedPatient: Patient = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        dateOfBirth: data.date_of_birth,
        gender: data.gender as 'male' | 'female' | 'other',
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        insuranceProvider: data.insurance_provider || undefined,
        insurancePolicyNumber: data.insurance_policy_number || undefined,
        medicalHistory: data.medical_history || undefined,
        allergies: data.allergies || undefined,
        medications: data.medications || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Update the patient in the state
      set(state => {
        const updatedPatients = state.patients.map(p => 
          p.id === id ? updatedPatient : p
        );
        
        return {
          patients: updatedPatients,
          selectedPatient: updatedPatient,
          isLoading: false
        };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update patient', isLoading: false });
    }
  }
}));