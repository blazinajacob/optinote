import { create } from 'zustand';
import { Appointment } from '../types';
import dayjs from 'dayjs';
import { supabase } from '../lib/supabase';

interface ScheduleState {
  appointments: Appointment[];
  selectedDate: string; // ISO string format
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getAppointmentsByDate: (date: string) => Promise<void>;
  getAppointmentsByPatientId: (patientId: string) => Promise<void>;
  getAppointmentById: (id: string) => Promise<Appointment | null>;
  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Appointment>;
  updateAppointment: (id: string, appointmentData: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  appointments: [],
  selectedDate: dayjs().format('YYYY-MM-DD'), // Default to today
  isLoading: false,
  error: null,
  
  getAppointmentsByDate: async (date: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', date)
        .order('start_time', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const appointments: Appointment[] = data.map(a => ({
        id: a.id,
        patientId: a.patient_id,
        doctorId: a.doctor_id || undefined,
        date: a.date,
        startTime: a.start_time,
        endTime: a.end_time,
        type: a.type as 'new-patient' | 'follow-up' | 'emergency' | 'other',
        status: a.status as 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled',
        notes: a.notes || undefined,
        createdAt: a.created_at,
        updatedAt: a.updated_at
      }));
      
      set({ 
        appointments,
        selectedDate: date,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch appointments', isLoading: false });
    }
  },
  
  getAppointmentsByPatientId: async (patientId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const appointments: Appointment[] = data.map(a => ({
        id: a.id,
        patientId: a.patient_id,
        doctorId: a.doctor_id || undefined,
        date: a.date,
        startTime: a.start_time,
        endTime: a.end_time,
        type: a.type as 'new-patient' | 'follow-up' | 'emergency' | 'other',
        status: a.status as 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled',
        notes: a.notes || undefined,
        createdAt: a.created_at,
        updatedAt: a.updated_at
      }));
      
      set({ 
        appointments,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch appointments', isLoading: false });
    }
  },
  
  getAppointmentById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const appointment: Appointment = {
        id: data.id,
        patientId: data.patient_id,
        doctorId: data.doctor_id || undefined,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        type: data.type as 'new-patient' | 'follow-up' | 'emergency' | 'other',
        status: data.status as 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled',
        notes: data.notes || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      set({ isLoading: false });
      return appointment;
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch appointment details', isLoading: false });
      return null;
    }
  },
  
  createAppointment: async (appointmentData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Transform from application model to database structure
      const dbAppointment = {
        patient_id: appointmentData.patientId,
        doctor_id: appointmentData.doctorId || null,
        date: appointmentData.date,
        start_time: appointmentData.startTime,
        end_time: appointmentData.endTime,
        type: appointmentData.type,
        status: appointmentData.status,
        notes: appointmentData.notes || null
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(dbAppointment)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const newAppointment: Appointment = {
        id: data.id,
        patientId: data.patient_id,
        doctorId: data.doctor_id || undefined,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        type: data.type as 'new-patient' | 'follow-up' | 'emergency' | 'other',
        status: data.status as 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled',
        notes: data.notes || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Only add to state if it's for the selected date
      if (data.date === get().selectedDate) {
        set(state => ({ 
          appointments: [...state.appointments, newAppointment],
          isLoading: false 
        }));
      } else {
        set({ isLoading: false });
      }
      
      return newAppointment;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create appointment', isLoading: false });
      throw error;
    }
  },
  
  updateAppointment: async (id: string, appointmentData: Partial<Appointment>) => {
    set({ isLoading: true, error: null });
    
    try {
      // Transform from application model to database structure
      const dbAppointment: any = {};
      
      if (appointmentData.patientId !== undefined) dbAppointment.patient_id = appointmentData.patientId;
      if (appointmentData.doctorId !== undefined) dbAppointment.doctor_id = appointmentData.doctorId;
      if (appointmentData.date !== undefined) dbAppointment.date = appointmentData.date;
      if (appointmentData.startTime !== undefined) dbAppointment.start_time = appointmentData.startTime;
      if (appointmentData.endTime !== undefined) dbAppointment.end_time = appointmentData.endTime;
      if (appointmentData.type !== undefined) dbAppointment.type = appointmentData.type;
      if (appointmentData.status !== undefined) dbAppointment.status = appointmentData.status;
      if (appointmentData.notes !== undefined) dbAppointment.notes = appointmentData.notes;
      
      // Add updated_at timestamp
      dbAppointment.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('appointments')
        .update(dbAppointment)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform from database structure to application model
      const updatedAppointment: Appointment = {
        id: data.id,
        patientId: data.patient_id,
        doctorId: data.doctor_id || undefined,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        type: data.type as 'new-patient' | 'follow-up' | 'emergency' | 'other',
        status: data.status as 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled',
        notes: data.notes || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Update in state if it's for the selected date
      set(state => {
        const updatedAppointments = state.appointments.map(a => 
          a.id === id ? updatedAppointment : a
        );
        
        return {
          appointments: updatedAppointments,
          isLoading: false
        };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update appointment', isLoading: false });
    }
  },
  
  cancelAppointment: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update in state
      set(state => {
        const updatedAppointments = state.appointments.map(a => 
          a.id === id ? {
            ...a,
            status: 'cancelled',
            updatedAt: data.updated_at
          } : a
        );
        
        return {
          appointments: updatedAppointments,
          isLoading: false
        };
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to cancel appointment', isLoading: false });
    }
  },
  
  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().getAppointmentsByDate(date);
  }
}));