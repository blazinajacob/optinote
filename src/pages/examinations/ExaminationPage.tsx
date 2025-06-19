import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, FileText, AlertCircle, Menu, X, Plus, Sparkles } from 'lucide-react';
import { Eye, Activity, Microscope, Clipboard, FileCheck } from 'lucide-react';
import { usePatientStore } from '../../stores/patientStore';
import { useExaminationStore } from '../../stores/examinationStore';
import { useAuthStore } from '../../stores/authStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { Examination, Vision, Refraction, PupilTest, ScanResult, PreTestData } from '../../types';
import AIExamFiller from './AIExamFiller';
import AISummaryGenerator from '../../components/ai/AISummaryGenerator';
import { motion, AnimatePresence } from 'framer-motion';

// Import technician components for doctor use
import PatientIntakeForm from '../../components/technician/PatientIntakeForm';
import IopMeasurementForm from '../../components/technician/IopMeasurementForm';
import ExtraTestsForm from '../../components/technician/ExtraTestsForm';
import TestResultsList from '../../components/technician/TestResultsList';
import PreTestingForm from '../../components/technician/PreTestingForm';

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
    performedBy: 'Dr. Sarah Johnson',
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
    performedBy: 'Dr. Sarah Johnson',
    status: 'pending_review'
  }
];

const ExaminationPage = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('exam');
  const appointmentId = searchParams.get('appointment');
  const navigate = useNavigate();
  
  const { user } = useAuthStore();
  const { selectedPatient, getPatientById } = usePatientStore();
  const { 
    selectedExamination, 
    getExaminationById, 
    createExamination, 
    updateExamination,
    isLoading 
  } = useExaminationStore();
  const { getAppointmentById, updateAppointment } = useScheduleStore();
  
  // Form state
  const [formData, setFormData] = useState<Partial<Examination>>({
    chiefComplaint: '',
    vision: {
      rightEye: {},
      leftEye: {}
    },
    intraocularPressure: {
      rightEye: undefined,
      leftEye: undefined
    },
    refraction: {
      rightEye: {},
      leftEye: {}
    },
    pupils: {
      rightEye: {},
      leftEye: {}
    },
    anteriorSegment: '',
    posteriorSegment: '',
    diagnosis: [],
    plan: '',
    followUp: '',
    status: 'in-progress'
  });
  
  const [activeTab, setActiveTab] = useState('main-exam');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const [scanResults, setScanResults] = useState<ScanResult[]>(mockScanResults);
  const [pretestData, setPretestData] = useState<PreTestData>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  
  useEffect(() => {
    if (patientId) {
      getPatientById(patientId);
    }
    
    if (examId) {
      getExaminationById(examId);
    }
    
    // Load appointment data if specified
    if (appointmentId) {
      const loadAppointment = async () => {
        const appointmentData = await getAppointmentById(appointmentId);
        if (appointmentData) {
          setAppointment(appointmentData);
          
          // Pre-populate chief complaint from appointment notes if available
          if (appointmentData.notes && !formData.chiefComplaint) {
            setFormData(prev => ({
              ...prev,
              chiefComplaint: appointmentData.notes || ''
            }));
          }
          
          // Update appointment status to in-progress if it's not already
          if (appointmentData.status === 'scheduled' || appointmentData.status === 'checked-in') {
            updateAppointment(appointmentId, {
              status: 'in-progress'
            });
          }
        }
      };
      
      loadAppointment();
    }
  }, [patientId, examId, appointmentId, getPatientById, getExaminationById, getAppointmentById, updateAppointment]);
  
  useEffect(() => {
    if (selectedExamination && examId) {
      setFormData(selectedExamination);
      
      // If examination has pretest data, load it
      if (selectedExamination.preTestData) {
        setPretestData(selectedExamination.preTestData);
      }
    }
  }, [selectedExamination, examId]);
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNestedInputChange = (
    parentField: 'vision' | 'refraction' | 'intraocularPressure' | 'pupils',
    eye: 'rightEye' | 'leftEye',
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [eye]: {
          ...prev[parentField]?.[eye],
          [field]: value
        }
      }
    }));
  };
  
  // Handle intake form submission
  const handleIntakeSave = async (data: { chiefComplaint: string; notes?: string }) => {
    try {
      setFormData(prev => ({
        ...prev,
        chiefComplaint: data.chiefComplaint
      }));
      
      if (appointment && appointmentId && data.notes) {
        await updateAppointment(appointmentId, {
          notes: data.notes
        });
      }
      
      // Save the examination with updated chief complaint
      await handleSave(false);
    } catch (error) {
      console.error('Error saving intake:', error);
      throw error;
    }
  };

  // Handle pre-testing form submission
  const handlePretestingSave = async (data: PreTestData) => {
    try {
      setPretestData(data);
      
      setFormData(prev => ({
        ...prev,
        preTestData: data,
        vision: data.vision || prev.vision
      }));
      
      // Save the examination with updated pre-testing data
      await handleSave(false);
    } catch (error) {
      console.error('Error saving pre-testing data:', error);
      throw error;
    }
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
      setFormData(prev => ({
        ...prev,
        intraocularPressure: {
          rightEye: data.rightEye,
          leftEye: data.leftEye
        }
      }));
      
      // Save the examination with updated IOP data
      await handleSave(false);
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
  
  const handleSave = async (complete: boolean = false) => {
    if (!patientId || !user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const examData = {
        ...formData,
        patientId,
        doctorId: user.id,
        date: new Date().toISOString(),
        status: complete ? 'completed' : 'in-progress',
        preTestData: pretestData
      } as Omit<Examination, 'id' | 'createdAt' | 'updatedAt'>;
      
      if (examId && selectedExamination) {
        await updateExamination(examId, examData);
      } else {
        const newExam = await createExamination(examData);
        
        // Update appointment status to completed if completing exam
        if (complete && appointmentId) {
          await updateAppointment(appointmentId, {
            status: 'completed'
          });
        }
        
        if (complete) {
          navigate(`/patients/${patientId}/soap?exam=${newExam.id}`);
          return;
        }
      }
      
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save examination:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading || !selectedPatient) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading examination data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="mr-4 text-gray-500 hover:text-gray-700"
            onClick={() => navigate(`/patients/${patientId}`)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {examId ? 'Edit Examination' : 'New Examination'}
            </h1>
            <p className="text-sm text-gray-500">
              Patient: {selectedPatient.firstName} {selectedPatient.lastName} • {formatDate(new Date())}
              {appointment && (
                <> • <span className="text-primary-600">From appointment</span></>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-outline"
            onClick={() => setShowAISummary(!showAISummary)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {showAISummary ? "Hide Summary" : "AI Summary"}
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Save Draft</span>
            <span className="inline sm:hidden">Save</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Complete & Create SOAP</span>
            <span className="inline sm:hidden">Complete</span>
          </button>
        </div>
      </div>
      
      {saveSuccess && (
        <div className="mb-6 p-3 bg-success-50 border border-success-200 rounded-md text-success-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">Examination saved successfully</span>
        </div>
      )}
      
      {/* AI Summary Generator */}
      {showAISummary && examId && selectedExamination && (
        <div className="mb-6">
          <AISummaryGenerator 
            type="examination"
            data={selectedExamination}
          />
        </div>
      )}
      
      {/* AI assistant for faster form filling */}
      <div className="mb-6">
        <AIExamFiller 
          value={formData}
          onChange={(updatedData) => setFormData(prev => ({ ...prev, ...updatedData }))}
        />
      </div>
      
      {/* Mobile Tab Menu */}
      <div className="relative sm:hidden mb-4">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center">
            {activeTab === 'main-exam' && <Eye className="h-4 w-4 mr-2" />}
            {activeTab === 'patient-intake' && <Clipboard className="h-4 w-4 mr-2" />}
            {activeTab === 'pretesting' && <FileCheck className="h-4 w-4 mr-2" />}
            {activeTab === 'iop' && <Activity className="h-4 w-4 mr-2" />}
            {activeTab === 'extra-tests' && <Microscope className="h-4 w-4 mr-2" />}
            <span className="font-medium text-gray-900">
              {activeTab === 'main-exam' ? 'Examination' : 
               activeTab === 'patient-intake' ? 'Patient Intake' : 
               activeTab === 'pretesting' ? 'Pre-Testing' : 
               activeTab === 'iop' ? 'IOP Measurement' : 
               'Additional Tests'}
            </span>
          </div>
          <Menu className="h-5 w-5 text-gray-500" />
        </button>
        
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-md z-10"
            >
              <div className="p-1">
                <button
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left text-sm rounded",
                    activeTab === 'main-exam' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setActiveTab('main-exam');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Eye className="h-4 w-4 mr-3" />
                  Examination
                </button>
                
                <button
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left text-sm rounded",
                    activeTab === 'patient-intake' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setActiveTab('patient-intake');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Clipboard className="h-4 w-4 mr-3" />
                  Patient Intake
                </button>
                
                <button
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left text-sm rounded",
                    activeTab === 'pretesting' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setActiveTab('pretesting');
                    setMobileMenuOpen(false);
                  }}
                >
                  <FileCheck className="h-4 w-4 mr-3" />
                  Pre-Testing
                </button>
                
                <button
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left text-sm rounded",
                    activeTab === 'iop' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setActiveTab('iop');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Activity className="h-4 w-4 mr-3" />
                  IOP Measurement
                </button>
                
                <button
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left text-sm rounded",
                    activeTab === 'extra-tests' ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    setActiveTab('extra-tests');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Microscope className="h-4 w-4 mr-3" />
                  Additional Tests
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Desktop Tab Navigation - Hidden on mobile */}
      <div className="hidden sm:block mb-6">
        <div className="flex space-x-1 overflow-x-auto border-b border-gray-200 pb-px">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'main-exam' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('main-exam')}
          >
            <Eye className="h-4 w-4 inline mr-2" />
            Examination
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'patient-intake' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('patient-intake')}
          >
            <Clipboard className="h-4 w-4 inline mr-2" />
            Patient Intake
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'pretesting' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('pretesting')}
          >
            <FileCheck className="h-4 w-4 inline mr-2" />
            Pre-Testing
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'iop' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('iop')}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            IOP Measurement
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'extra-tests' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('extra-tests')}
          >
            <Microscope className="h-4 w-4 inline mr-2" />
            Additional Tests
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'patient-intake' && (
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
          onComplete={() => setActiveTab('iop')}
        />
      )}
      
      {activeTab === 'iop' && (
        <IopMeasurementForm
          initialData={formData.intraocularPressure}
          onSave={handleIopSave}
        />
      )}
      
      {activeTab === 'extra-tests' && (
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
      
      {activeTab === 'main-exam' && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Chief Complaint</h2>
            <textarea
              className="mt-2 w-full h-24 rounded-md border border-gray-300 p-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter patient's main complaint and reason for visit..."
              value={formData.chiefComplaint || ''}
              onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
            />
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Visual Acuity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Right Eye */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-primary-700 mb-3">Right Eye (OD)</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Uncorrected</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="20/..."
                      value={(formData.vision?.rightEye?.uncorrected) || ''}
                      onChange={(e) => handleNestedInputChange('vision', 'rightEye', 'uncorrected', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Corrected</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="20/..."
                      value={(formData.vision?.rightEye?.corrected) || ''}
                      onChange={(e) => handleNestedInputChange('vision', 'rightEye', 'corrected', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Pinhole</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="20/..."
                      value={(formData.vision?.rightEye?.pinhole) || ''}
                      onChange={(e) => handleNestedInputChange('vision', 'rightEye', 'pinhole', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Left Eye */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-primary-700 mb-3">Left Eye (OS)</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Uncorrected</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="20/..."
                      value={(formData.vision?.leftEye?.uncorrected) || ''}
                      onChange={(e) => handleNestedInputChange('vision', 'leftEye', 'uncorrected', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Corrected</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="20/..."
                      value={(formData.vision?.leftEye?.corrected) || ''}
                      onChange={(e) => handleNestedInputChange('vision', 'leftEye', 'corrected', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Pinhole</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="20/..."
                      value={(formData.vision?.leftEye?.pinhole) || ''}
                      onChange={(e) => handleNestedInputChange('vision', 'leftEye', 'pinhole', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Intraocular Pressure</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Right Eye */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-primary-700 mb-3">Right Eye (OD)</h3>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">IOP (mmHg)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="Enter value..."
                    value={formData.intraocularPressure?.rightEye === undefined ? '' : formData.intraocularPressure.rightEye}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : Number(e.target.value);
                      handleNestedInputChange('intraocularPressure', 'rightEye', '', value);
                    }}
                  />
                </div>
              </div>
              
              {/* Left Eye */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-primary-700 mb-3">Left Eye (OS)</h3>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">IOP (mmHg)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="Enter value..."
                    value={formData.intraocularPressure?.leftEye === undefined ? '' : formData.intraocularPressure.leftEye}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : Number(e.target.value);
                      handleNestedInputChange('intraocularPressure', 'leftEye', '', value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Refraction</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Right Eye */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-primary-700 mb-3">Right Eye (OD)</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Sphere</label>
                    <input
                      type="number"
                      step="0.25"
                      className="input"
                      placeholder="+/-0.00"
                      value={formData.refraction?.rightEye?.sphere ?? ''}
                      onChange={(e) => handleNestedInputChange('refraction', 'rightEye', 'sphere', 
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Cylinder</label>
                    <input
                      type="number"
                      step="0.25"
                      className="input"
                      placeholder="+/-0.00"
                      value={formData.refraction?.rightEye?.cylinder ?? ''}
                      onChange={(e) => handleNestedInputChange('refraction', 'rightEye', 'cylinder', 
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Axis</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="0-180"
                      min="0"
                      max="180"
                      value={formData.refraction?.rightEye?.axis ?? ''}
                      onChange={(e) => handleNestedInputChange('refraction', 'rightEye', 'axis', 
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Add</label>
                    <input
                      type="number"
                      step="0.25"
                      className="input"
                      placeholder="+0.00"
                      value={formData.refraction?.rightEye?.add ?? ''}
                      onChange={(e) => handleNestedInputChange('refraction', 'rightEye', 'add', 
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )}
                    />
                  </div>
                </div>
              </div>
              
              {/* Left Eye */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-primary-700 mb-3">Left Eye (OS)</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Sphere</label>
                    <input
                      type="number"
                      step="0.25"
                      className="input"
                      placeholder="+/-0.00"
                      value={formData.refraction?.leftEye?.sphere ?? ''}
                      onChange={(e) => handleNestedInputChange('refraction', 'leftEye', 'sphere', 
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Cylinder</label>
                    <input
                      type="number"
                      step="0.25"
                      className="input"
                      placeholder="+/-0.00"
                      value={formData.refraction?.leftEye?.cylinder ?? ''}
                      onChange={(e) => handleNestedInputChange('refraction', 'leftEye', 'cylinder', 
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Axis</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="0-180"
                      min="0"
                      max="180"
                      value={formData.refraction?.leftEye?.axis ?? ''}
                      onChange={(e) => handleNestedInputChange('refraction', 'leftEye', 'axis', 
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Add</label>
                    <input
                      type="number"
                      step="0.25"
                      className="input"
                      placeholder="+0.00"
                      value={formData.refraction?.leftEye?.add ?? ''}
                      onChange={(e) => handleNestedInputChange('refraction', 'leftEye', 'add', 
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Pupil Testing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Right Eye */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-primary-700 mb-3">Right Eye (OD)</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Size (mm)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="input"
                      placeholder="Size in mm"
                      value={formData.pupils?.rightEye?.size ?? ''}
                      onChange={(e) => handleNestedInputChange('pupils', 'rightEye', 'size', 
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Reaction</label>
                    <select
                      className="input"
                      value={formData.pupils?.rightEye?.reaction || ''}
                      onChange={(e) => handleNestedInputChange('pupils', 'rightEye', 'reaction', 
                        e.target.value || undefined
                      )}
                    >
                      <option value="">Select...</option>
                      <option value="normal">Normal</option>
                      <option value="sluggish">Sluggish</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <input
                        id="rapd-right"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={formData.pupils?.rightEye?.RAPD || false}
                        onChange={(e) => handleNestedInputChange('pupils', 'rightEye', 'RAPD', e.target.checked)}
                      />
                      <label htmlFor="rapd-right" className="ml-2 block text-sm text-gray-700">
                        Relative Afferent Pupillary Defect (RAPD)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Left Eye */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-primary-700 mb-3">Left Eye (OS)</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Size (mm)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="input"
                      placeholder="Size in mm"
                      value={formData.pupils?.leftEye?.size ?? ''}
                      onChange={(e) => handleNestedInputChange('pupils', 'leftEye', 'size', 
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Reaction</label>
                    <select
                      className="input"
                      value={formData.pupils?.leftEye?.reaction || ''}
                      onChange={(e) => handleNestedInputChange('pupils', 'leftEye', 'reaction', 
                        e.target.value || undefined
                      )}
                    >
                      <option value="">Select...</option>
                      <option value="normal">Normal</option>
                      <option value="sluggish">Sluggish</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <input
                        id="rapd-left"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={formData.pupils?.leftEye?.RAPD || false}
                        onChange={(e) => handleNestedInputChange('pupils', 'leftEye', 'RAPD', e.target.checked)}
                      />
                      <label htmlFor="rapd-left" className="ml-2 block text-sm text-gray-700">
                        Relative Afferent Pupillary Defect (RAPD)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-2">Anterior Segment</h2>
            <textarea
              className="mt-2 w-full h-24 rounded-md border border-gray-300 p-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter anterior segment findings..."
              value={formData.anteriorSegment || ''}
              onChange={(e) => handleInputChange('anteriorSegment', e.target.value)}
            />
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-2">Posterior Segment</h2>
            <textarea
              className="mt-2 w-full h-24 rounded-md border border-gray-300 p-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter posterior segment findings..."
              value={formData.posteriorSegment || ''}
              onChange={(e) => handleInputChange('posteriorSegment', e.target.value)}
            />
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-2">Diagnosis</h2>
            <input
              type="text"
              className="input"
              placeholder="Enter diagnosis (e.g., H52.11 - Myopia, right eye)"
              value={(formData.diagnosis && formData.diagnosis[0]) || ''}
              onChange={(e) => handleInputChange('diagnosis', e.target.value ? [e.target.value] : [])}
            />
            <button 
              type="button" 
              className="mt-2 text-primary-600 hover:text-primary-800 text-sm flex items-center"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add another diagnosis
            </button>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-2">Plan</h2>
            <textarea
              className="mt-2 w-full h-24 rounded-md border border-gray-300 p-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter treatment plan and recommendations..."
              value={formData.plan || ''}
              onChange={(e) => handleInputChange('plan', e.target.value)}
            />
          </div>
          
          <div className="p-4">
            <h2 className="text-lg font-medium mb-2">Follow Up</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Return to clinic in</label>
                <select
                  className="input"
                  value={formData.followUp || ''}
                  onChange={(e) => handleInputChange('followUp', e.target.value)}
                >
                  <option value="">Select timeframe...</option>
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="1 year">1 year</option>
                  <option value="as needed">As needed</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              className="btn-outline"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              <FileText className="h-4 w-4 mr-2" />
              Complete & Create SOAP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminationPage;