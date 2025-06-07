export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: string
          phone: string
          email: string | null
          address: string | null
          insurance_provider: string | null
          insurance_policy_number: string | null
          medical_history: string | null
          allergies: string[] | null
          medications: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: string
          phone: string
          email?: string | null
          address?: string | null
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          medical_history?: string | null
          allergies?: string[] | null
          medications?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: string
          phone?: string
          email?: string | null
          address?: string | null
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          medical_history?: string | null
          allergies?: string[] | null
          medications?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      examinations: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          date: string
          chief_complaint: string
          vision: Json
          intraocular_pressure: Json | null
          refraction: Json | null
          pupils: Json | null
          anterior_segment: string | null
          posterior_segment: string | null
          diagnosis: string[] | null
          plan: string | null
          follow_up: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          date: string
          chief_complaint: string
          vision: Json
          intraocular_pressure?: Json | null
          refraction?: Json | null
          pupils?: Json | null
          anterior_segment?: string | null
          posterior_segment?: string | null
          diagnosis?: string[] | null
          plan?: string | null
          follow_up?: string | null
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          date?: string
          chief_complaint?: string
          vision?: Json
          intraocular_pressure?: Json | null
          refraction?: Json | null
          pupils?: Json | null
          anterior_segment?: string | null
          posterior_segment?: string | null
          diagnosis?: string[] | null
          plan?: string | null
          follow_up?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      soap_notes: {
        Row: {
          id: string
          examination_id: string
          patient_id: string
          doctor_id: string
          subjective: string
          objective: string
          assessment: string
          plan: string
          icd10_codes: Json
          mips_compliant: boolean
          mips_categories: string[] | null
          return_to_clinic: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          examination_id: string
          patient_id: string
          doctor_id: string
          subjective: string
          objective: string
          assessment: string
          plan: string
          icd10_codes: Json
          mips_compliant: boolean
          mips_categories?: string[] | null
          return_to_clinic?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          examination_id?: string
          patient_id?: string
          doctor_id?: string
          subjective?: string
          objective?: string
          assessment?: string
          plan?: string
          icd10_codes?: Json
          mips_compliant?: boolean
          mips_categories?: string[] | null
          return_to_clinic?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string | null
          date: string
          start_time: string
          end_time: string
          type: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id?: string | null
          date: string
          start_time: string
          end_time: string
          type: string
          status: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string | null
          date?: string
          start_time?: string
          end_time?: string
          type?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exam_images: {
        Row: {
          id: string
          examination_id: string
          type: string
          url: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          examination_id: string
          type: string
          url: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          examination_id?: string
          type?: string
          url?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}