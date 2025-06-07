import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePatientStore } from '../../stores/patientStore';
import FormWithAIAssistant from '../../components/ai/FormWithAIAssistant';
import { AIFormField } from '../../components/ai/AIFormAssistant';
import { Patient } from '../../types';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPatientModal = ({ isOpen, onClose }: AddPatientModalProps) => {
  const { createPatient, isLoading } = usePatientStore();
  
  const initialFields: AIFormField[] = [
    {
      id: 'firstName',
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      value: '',
      placeholder: 'Enter first name',
      required: true
    },
    {
      id: 'lastName',
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      value: '',
      placeholder: 'Enter last name',
      required: true
    },
    {
      id: 'dateOfBirth',
      name: 'dateOfBirth',
      type: 'date',
      label: 'Date of Birth',
      value: '',
      required: true
    },
    {
      id: 'gender',
      name: 'gender',
      type: 'select',
      label: 'Gender',
      value: '',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' }
      ],
      required: true
    },
    {
      id: 'phone',
      name: 'phone',
      type: 'tel',
      label: 'Phone Number',
      value: '',
      placeholder: '(555) 123-4567',
      required: true
    },
    {
      id: 'email',
      name: 'email',
      type: 'email',
      label: 'Email Address',
      value: '',
      placeholder: 'patient@example.com'
    },
    {
      id: 'address',
      name: 'address',
      type: 'textarea',
      label: 'Address',
      value: '',
      placeholder: 'Street address, city, state, zip code'
    },
    {
      id: 'insuranceProvider',
      name: 'insuranceProvider',
      type: 'text',
      label: 'Insurance Provider',
      value: '',
      placeholder: 'Enter insurance company name'
    },
    {
      id: 'insurancePolicyNumber',
      name: 'insurancePolicyNumber',
      type: 'text',
      label: 'Policy Number',
      value: '',
      placeholder: 'Enter insurance policy number'
    },
    {
      id: 'medicalHistory',
      name: 'medicalHistory',
      type: 'textarea',
      label: 'Medical History',
      value: '',
      placeholder: 'Enter any relevant medical history'
    },
    {
      id: 'allergies',
      name: 'allergies',
      type: 'textarea',
      label: 'Allergies',
      value: '',
      placeholder: 'List any known allergies'
    },
    {
      id: 'medications',
      name: 'medications',
      type: 'textarea',
      label: 'Current Medications',
      value: '',
      placeholder: 'List current medications and dosages'
    }
  ];
  
  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      // Transform allergies and medications from text to arrays if they contain values
      const allergiesArray = formData.allergies ? 
        formData.allergies.split(',').map((item: string) => item.trim()) : 
        undefined;
      
      const medicationsArray = formData.medications ? 
        formData.medications.split(',').map((item: string) => item.trim()) : 
        undefined;
      
      // Transform formData to Patient format
      const newPatient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female' | 'other',
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        insuranceProvider: formData.insuranceProvider || undefined,
        insurancePolicyNumber: formData.insurancePolicyNumber || undefined,
        medicalHistory: formData.medicalHistory || undefined,
        allergies: allergiesArray,
        medications: medicationsArray,
      };
      
      await createPatient(newPatient);
      onClose();
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl z-10"
        >
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <FormWithAIAssistant
            title="Add New Patient"
            description="Fill out patient details to create a new record"
            fields={initialFields}
            onSubmit={handleSubmit}
            submitLabel={isLoading ? 'Creating...' : 'Add Patient'}
            contextHint="I'm adding a new patient named John Smith who is a 45-year-old male, born on 5/15/1978, with phone 555-123-4567 and email john.smith@example.com"
            assistantPosition="inline"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AddPatientModal;