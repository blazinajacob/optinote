import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, Save, Check, Clock, 
  CheckCircle, AlertCircle, FileText, Loader2,
  Eye, Clipboard, Microscope, Activity, Image
} from 'lucide-react';
import { usePatientStore } from '../../stores/patientStore';
import { useExaminationStore } from '../../stores/examinationStore';
import { useAuthStore } from '../../stores/authStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { formatDate } from '../../lib/utils';
import { PreTestData, ScanResult } from '../../types';
import { motion } from 'framer-motion';

// Import technician components
import PatientIntakeForm from '../../components/technician/PatientIntakeForm';
import PreTestingForm from '../../components/technician/PreTestingForm';
import IopMeasurementForm from '../../components/technician/IopMeasurementForm';
import ExtraTestsForm from '../../components/technician/ExtraTestsForm';
import PatientPretestingSummary from '../../components/technician/PatientPretestingSummary';
import TestResultsList from '../../components/technician/TestResultsList';

// Mock data for scan results
const mockScanResults: ScanResult[] = [
  {
    id: 'scan-1',
    examinationId: 'pending',
    patientId: 'PT-123456',
    type: 'oct',
    imageUrl: 'https://example.com/images/oct-scan.jpg',
    date: new Date().toISOString(),
    notes: 'Macular OCT scan',
    performedBy: 'Michael Rodriguez',
    status: 'pending_review'
  },
  {
    id: 'scan-2',
    examinationId: 'pending',
    patientId: 'PT-123456',
    type: 'fundus',
    imageUrl: 'https://example.com/images/fundus.jpg',
    date: new Date().toISOString(),
    notes: 'Standard fundus photography',
    performedBy: 'Michael Rodriguez',
    status: 'pending_review'
  }
];

const PatientPreTestingPage = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment');
  const navigate = useNavigate();
  
  const { user } = useAuthStore();
  const { selectedPatient, getPatientById } = usePatientStore();
  const { updateExamination, createExamination, selectedExamination, getExaminationById } = useExaminationStore();
  const { getAppointmentById, updateAppointment } = useScheduleStore();
  
  // Local state
  const [activeTab, setActiveTab] = useState<'intake' | 'pretesting' | 'iop' | 'extras' | 'summary'>('intake');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [examinationId, setExaminationId] = useState<string | null>(null);
  const [pretestData, setPretestData] = useState<PreTestData>({});
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [scanResults, setScanResults] = useState<ScanResult[]>(mockScanResults);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        if (!patientId) throw new Error('Patient ID is required');
        
        // Get patient data
        await getPatientById(patientId);
        
        // Get appointment data if specified
        if (appointmentId) {
          const appointmentData = await getAppointmentById(appointmentId);
          if (appointmentData) {
            setAppointment(appointmentData);
            
            // Update appointment status to in-progress if it's not already
            if (appointmentData.status !== 'in-progress' && appointmentData.status !== 'completed') {
              await updateAppointment(appointmentId, {
                status: 'in-progress'
              });
            }
            
            // Check if there's already an examination for this appointment
            // This would be a database query in a real app
            // For now, we'll just create a new examination
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setErrorMessage('Failed to load patient data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [patientId, appointmentId, getPatientById, getAppointmentById, updateAppointment]);

  // Handle intake form submission
  const handleIntakeSave = async (data: { chiefComplaint: string; notes?: string }) => {
    try {
      setChiefComplaint(data.chiefComplaint);
      
      // Create a new examination if one doesn't exist
      if (!examinationId) {
        const examination = await createExamination({
          patientId: patientId!,
          doctorId: user?.id || '',
          date: new Date().toISOString(),
          chiefComplaint: data.chiefComplaint,
          vision: {
            rightEye: {},
            leftEye: {}
          },
          status: 'in-progress'
        });
        
        setExaminationId(examination.id);
        
        // Update appointment with examination ID if needed
        if (appointmentId) {
          await updateAppointment(appointmentId, {
            notes: data.notes
          });
        }
      } else {
        // Update existing examination
        await updateExamination(examinationId, {
          chiefComplaint: data.chiefComplaint
        });
        
        // Update appointment notes if needed
        if (appointmentId && data.notes) {
          await updateAppointment(appointmentId, {
            notes: data.notes
          });
        }
      }
      
      // Move to the next step
      setActiveTab('pretesting');
    } catch (error) {
      console.error('Error saving intake:', error);
      throw error;
    }
  };

  // Handle pre-testing form submission
  const handlePretestingSave = async (data: PreTestData) => {
    try {
      setPretestData(data);
      
      if (examinationId) {
        // Update examination with pre-testing data
        await updateExamination(examinationId, {
          preTestData: data,
          vision: data.vision
        });
      }
      
      // Note: We don't automatically move to the next step here
      // since the user might want to save partial data
    } catch (error) {
      console.error('Error saving pre-testing data:', error);
      throw error;
    }
  };

  // Handle pre-testing completion
  const handlePretestingComplete = () => {
    setActiveTab('iop');
  };

  // Handle IOP form submission
  const handleIopSave = async (data: {
    rightEye?: number;
    leftEye?: number;
    method?: 'ncf' | 'applanation' | 'other';
    time?: string;
    notes?: string;
  }) => {
    try {
      if (examinationId) {
        // Update examination with IOP data
        await updateExamination(examinationId, {
          intraocularPressure: {
            rightEye: data.rightEye,
            leftEye: data.leftEye
          }
        });
        
        // Update pretestData state
        setPretestData(prev => ({
          ...prev,
          intraocularPressure: {
            rightEye: data.rightEye,
            leftEye: data.leftEye
          }
        }));
      }
      
      // Move to the next step
      setActiveTab('extras');
    } catch (error) {
      console.error('Error saving IOP measurements:', error);
      throw error;
    }
  };

  // Handle additional tests upload
  const handleTestUpload = async (scanResult: Omit<ScanResult, 'id'>) => {
    try {
      // In a real app, this would be saved to the database
      
      // Update local state with new scan result
      // For demo purposes, we'll add a fake ID
      const newScan: ScanResult = {
        ...scanResult,
        id: `scan-${Date.now()}`
      };
      
      setScanResults(prev => [newScan, ...prev]);
      
      return newScan;
    } catch (error) {
      console.error('Error uploading test:', error);
      throw error;
    }
  };

  // Complete pre-testing
  const handleCompletePreTesting = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      if (!examinationId) {
        throw new Error('No active examination found');
      }
      
      // Mark the examination as waiting for the doctor
      await updateExamination(examinationId, {
        status: 'in-progress'
      });
      
      if (appointmentId) {
        // Update appointment status
        await updateAppointment(appointmentId, {
          status: 'in-progress'
        });
      }
      
      // Show success message
      setSuccessMessage('Pre-testing completed successfully. Patient is ready for doctor examination.');
      
      // Navigate back after 2 seconds
      setTimeout(() => {
        if (appointmentId) {
          navigate(`/appointments/${appointmentId}`);
        } else {
          navigate(`/patients/${patientId}`);
        }
      }, 2000);
    } catch (error: any) {
      console.error('Error completing pre-testing:', error);
      setErrorMessage(error.message || 'Failed to complete pre-testing');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !selectedPatient) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500 mx-auto" />
          <p className="mt-4 text-gray-500">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="mr-4 text-gray-500 hover:text-gray-700"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Patient Pre-Testing
            </h1>
            <p className="text-sm text-gray-500">
              {selectedPatient.firstName} {selectedPatient.lastName} • {formatDate(new Date())}
              {appointment && (
                <> • <span className="text-primary-600">From appointment</span></>
              )}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {activeTab === 'intake' ? '1' : 
             activeTab === 'pretesting' ? '2' : 
             activeTab === 'iop' ? '3' : 
             activeTab === 'extras' ? '4' : 
             activeTab === 'summary' ? '5' : ''} of 5
          </div>
          
          {activeTab === 'summary' && (
            <button
              type="button"
              className="btn-primary"
              onClick={handleCompletePreTesting}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Completing...
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Pre-Testing
                </span>
              )}
            </button>
          )}
        </div>
      </div>
      
      {errorMessage && (
        <div className="mb-6 p-3 bg-error-50 border border-error-200 rounded-md text-error-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 bg-success-50 border border-success-200 rounded-md text-success-800 flex items-center"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </motion.div>
      )}
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              activeTab === 'intake'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('intake')}
          >
            <Clipboard className="h-4 w-4 mr-2" />
            Patient Intake
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              activeTab === 'pretesting'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('pretesting')}
            disabled={!chiefComplaint}
          >
            <Eye className="h-4 w-4 mr-2" />
            Pre-Testing
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              activeTab === 'iop'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('iop')}
            disabled={!chiefComplaint}
          >
            <Activity className="h-4 w-4 mr-2" />
            IOP
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              activeTab === 'extras'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('extras')}
            disabled={!chiefComplaint}
          >
            <Microscope className="h-4 w-4 mr-2" />
            Extra Tests
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
              activeTab === 'summary'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('summary')}
            disabled={!chiefComplaint}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Summary
          </button>
        </nav>
      </div>
      
      {/* Active Tab Content */}
      {activeTab === 'intake' && (
        <PatientIntakeForm 
          patient={selectedPatient}
          appointment={appointment}
          onSave={handleIntakeSave}
        />
      )}
      
      {activeTab === 'pretesting' && (
        <PreTestingForm 
          patient={selectedPatient}
          initialData={pretestData}
          onSave={handlePretestingSave}
          onComplete={handlePretestingComplete}
        />
      )}
      
      {activeTab === 'iop' && (
        <IopMeasurementForm
          initialData={pretestData?.intraocularPressure}
          onSave={handleIopSave}
        />
      )}
      
      {activeTab === 'extras' && (
        <div className="space-y-6">
          <ExtraTestsForm 
            patient={selectedPatient}
            onUpload={handleTestUpload}
          />
          
          <TestResultsList 
            patientId={patientId!}
            results={scanResults}
          />
        </div>
      )}
      
      {activeTab === 'summary' && (
        <PatientPretestingSummary
          patient={selectedPatient}
          pretestData={pretestData}
          scans={scanResults}
          chiefComplaint={chiefComplaint}
        />
      )}
    </div>
  );
};

export default PatientPreTestingPage;