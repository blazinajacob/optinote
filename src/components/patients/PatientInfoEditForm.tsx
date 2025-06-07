import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Patient } from '../../types';

interface PatientInfoEditFormProps {
  patient: Patient;
  onUpdate: (data: Partial<Patient>) => Promise<void>;
  onCancel: () => void;
}

const PatientInfoEditForm = ({ patient, onUpdate, onCancel }: PatientInfoEditFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    // New fields
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    language: '',
    ethnicity: '',
    race: '',
    occupation: '',
    bloodType: '',
    height: '',
    weight: '',
    surgeries: '',
    smokingStatus: '',
    alcoholUse: '',
    drugUse: '',
    nutrition: '',
    exercise: '',
    stress: '',
    familyHistory: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Initialize form with patient data
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone,
      email: patient.email || '',
      address: patient.address || '',
      insuranceProvider: patient.insuranceProvider || '',
      insurancePolicyNumber: patient.insurancePolicyNumber || '',
      medicalHistory: patient.medicalHistory || '',
      allergies: patient.allergies ? patient.allergies.join(', ') : '',
      medications: patient.medications ? patient.medications.join(', ') : '',
      // New fields
      emergencyContactName: patient.emergencyContact?.name || '',
      emergencyContactRelationship: patient.emergencyContact?.relationship || '',
      emergencyContactPhone: patient.emergencyContact?.phone || '',
      language: patient.background?.language || '',
      ethnicity: patient.background?.ethnicity || '',
      race: patient.background?.race || '',
      occupation: patient.occupation || '',
      bloodType: patient.bloodType || '',
      height: patient.height ? String(patient.height) : '',
      weight: patient.weight ? String(patient.weight) : '',
      surgeries: patient.surgeries ? patient.surgeries.join(', ') : '',
      smokingStatus: patient.substanceUse?.smoking || '',
      alcoholUse: patient.substanceUse?.alcohol || '',
      drugUse: patient.substanceUse?.drugs || '',
      nutrition: patient.nutrition || '',
      exercise: patient.exercise || '',
      stress: patient.stress || '',
      familyHistory: patient.familyHistory || ''
    });
  }, [patient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    
    try {
      // Transform form data back to patient structure
      const updatedPatient: Partial<Patient> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        insuranceProvider: formData.insuranceProvider || undefined,
        insurancePolicyNumber: formData.insurancePolicyNumber || undefined,
        medicalHistory: formData.medicalHistory || undefined,
      };

      // Process arrays
      if (formData.allergies) {
        updatedPatient.allergies = formData.allergies.split(',').map((item: string) => item.trim()).filter(Boolean);
      }

      if (formData.medications) {
        updatedPatient.medications = formData.medications.split(',').map((item: string) => item.trim()).filter(Boolean);
      }
      
      // New fields: emergency contact
      if (formData.emergencyContactName || formData.emergencyContactPhone) {
        updatedPatient.emergencyContact = {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phone: formData.emergencyContactPhone
        };
      }
      
      // Background information
      if (formData.language || formData.ethnicity || formData.race) {
        updatedPatient.background = {
          language: formData.language,
          ethnicity: formData.ethnicity,
          race: formData.race
        };
      }
      
      // Other new fields
      if (formData.occupation) updatedPatient.occupation = formData.occupation;
      if (formData.bloodType) updatedPatient.bloodType = formData.bloodType;
      if (formData.height) updatedPatient.height = parseFloat(formData.height);
      if (formData.weight) updatedPatient.weight = parseFloat(formData.weight);
      
      // Surgeries
      if (formData.surgeries) {
        updatedPatient.surgeries = formData.surgeries.split(',').map((item: string) => item.trim()).filter(Boolean);
      }
      
      // Substance use
      if (formData.smokingStatus || formData.alcoholUse || formData.drugUse) {
        updatedPatient.substanceUse = {
          smoking: formData.smokingStatus,
          alcohol: formData.alcoholUse,
          drugs: formData.drugUse
        };
      }
      
      // Lifestyle fields
      if (formData.nutrition) updatedPatient.nutrition = formData.nutrition;
      if (formData.exercise) updatedPatient.exercise = formData.exercise;
      if (formData.stress) updatedPatient.stress = formData.stress;
      if (formData.familyHistory) updatedPatient.familyHistory = formData.familyHistory;

      // Update patient
      await onUpdate(updatedPatient);
      setSuccessMessage('Patient information updated successfully');
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        onCancel();
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update patient information');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error-50 p-3 rounded-md border border-error-200"
        >
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-error-400 mr-2" />
            <span className="text-error-800 text-sm">{errorMessage}</span>
          </div>
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success-50 p-3 rounded-md border border-success-200"
        >
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-success-400 mr-2" />
            <span className="text-success-800 text-sm">{successMessage}</span>
          </div>
        </motion.div>
      )}

      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <input
              type="text"
              name="occupation"
              id="occupation"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.occupation}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
              Blood Type
            </label>
            <select
              name="bloodType"
              id="bloodType"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.bloodType}
              onChange={handleInputChange}
            >
              <option value="">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              name="height"
              id="height"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.height}
              onChange={handleInputChange}
              min="0"
              step="0.1"
            />
          </div>
          
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              id="weight"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.weight}
              onChange={handleInputChange}
              min="0"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="emergencyContactName"
              id="emergencyContactName"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.emergencyContactName}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <input
              type="text"
              name="emergencyContactRelationship"
              id="emergencyContactRelationship"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.emergencyContactRelationship}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="emergencyContactPhone"
              id="emergencyContactPhone"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.emergencyContactPhone}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      
      {/* Background */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Background</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Primary Language
            </label>
            <input
              type="text"
              name="language"
              id="language"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.language}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700 mb-1">
              Ethnicity
            </label>
            <input
              type="text"
              name="ethnicity"
              id="ethnicity"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.ethnicity}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="race" className="block text-sm font-medium text-gray-700 mb-1">
              Race
            </label>
            <input
              type="text"
              name="race"
              id="race"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.race}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Provider
            </label>
            <input
              type="text"
              name="insuranceProvider"
              id="insuranceProvider"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.insuranceProvider}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="insurancePolicyNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Policy Number
            </label>
            <input
              type="text"
              name="insurancePolicyNumber"
              id="insurancePolicyNumber"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.insurancePolicyNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
        
        <div className="mb-4">
          <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
            Medical History
          </label>
          <textarea
            name="medicalHistory"
            id="medicalHistory"
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={formData.medicalHistory}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
              Allergies
            </label>
            <textarea
              name="allergies"
              id="allergies"
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter allergies separated by commas"
              value={formData.allergies}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-1">
              Current Medications
            </label>
            <textarea
              name="medications"
              id="medications"
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter medications separated by commas"
              value={formData.medications}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor="surgeries" className="block text-sm font-medium text-gray-700 mb-1">
            Surgeries
          </label>
          <textarea
            name="surgeries"
            id="surgeries"
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Enter past surgeries separated by commas"
            value={formData.surgeries}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      {/* Lifestyle & Health Behaviors */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lifestyle & Health Behaviors</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="smokingStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Smoking Status
            </label>
            <select
              name="smokingStatus"
              id="smokingStatus"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.smokingStatus}
              onChange={handleInputChange}
            >
              <option value="">Select status</option>
              <option value="Never smoker">Never smoker</option>
              <option value="Former smoker">Former smoker</option>
              <option value="Current smoker">Current smoker</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="alcoholUse" className="block text-sm font-medium text-gray-700 mb-1">
              Alcohol Use
            </label>
            <select
              name="alcoholUse"
              id="alcoholUse"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.alcoholUse}
              onChange={handleInputChange}
            >
              <option value="">Select status</option>
              <option value="None">None</option>
              <option value="Occasional">Occasional</option>
              <option value="Moderate">Moderate</option>
              <option value="Heavy">Heavy</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="drugUse" className="block text-sm font-medium text-gray-700 mb-1">
              Recreational Drug Use
            </label>
            <select
              name="drugUse"
              id="drugUse"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.drugUse}
              onChange={handleInputChange}
            >
              <option value="">Select status</option>
              <option value="None">None</option>
              <option value="Past use">Past use</option>
              <option value="Current use">Current use</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="nutrition" className="block text-sm font-medium text-gray-700 mb-1">
              Nutrition
            </label>
            <textarea
              name="nutrition"
              id="nutrition"
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Dietary habits and nutrition information"
              value={formData.nutrition}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="exercise" className="block text-sm font-medium text-gray-700 mb-1">
              Exercise
            </label>
            <textarea
              name="exercise"
              id="exercise"
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Physical activity and exercise habits"
              value={formData.exercise}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="stress" className="block text-sm font-medium text-gray-700 mb-1">
              Stress Level
            </label>
            <textarea
              name="stress"
              id="stress"
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Stress levels and management"
              value={formData.stress}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      
      {/* Family History */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Family History</h3>
        
        <div>
          <label htmlFor="familyHistory" className="block text-sm font-medium text-gray-700 mb-1">
            Family Medical History
          </label>
          <textarea
            name="familyHistory"
            id="familyHistory"
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Relevant family medical history, especially eye conditions"
            value={formData.familyHistory}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default PatientInfoEditForm;