import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, Eye, AlertTriangle, Check, 
  CheckCircle, AlertCircle, 
  ChevronDown, ChevronUp 
} from 'lucide-react';
import { 
  Patient, 
  Vision, 
  AutoRefraction, 
  CoverTest, 
  ConfrontationFields, 
  ColorVisionTest, 
  StereoTest,
  PupilTest,
  PreTestData
} from '../../types';
import { cn } from '../../lib/utils';

interface PreTestingFormProps {
  patient: Patient;
  initialData?: PreTestData;
  onSave: (data: PreTestData) => Promise<void>;
  onComplete: () => void;
  className?: string;
}

const PreTestingForm = ({ 
  patient, 
  initialData, 
  onSave, 
  onComplete,
  className 
}: PreTestingFormProps) => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState<PreTestData>(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // UI state
  const [expandedSections, setExpandedSections] = useState({
    autoRefraction: true,
    vision: true,
    coverTest: true,
    pupils: true,
    confrontation: true,
    colorVision: true,
    stereoVision: true
  });
  
  // Initialize form with any initial data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Handle input changes for simple fields
  const handleInputChange = (section: keyof PreTestData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  // Handle nested changes (e.g. autoRefraction.rightEye.sphere)
  const handleNestedChange = (
    section: keyof PreTestData,
    eye: 'rightEye' | 'leftEye',
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [eye]: {
          ...prev[section]?.[eye],
          [field]: value
        }
      }
    }));
  };
  
  // Save the form data
  const handleSave = async (completePreTesting: boolean = false) => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      await onSave(formData);
      
      setSuccessMessage(completePreTesting 
        ? 'Pre-testing completed successfully' 
        : 'Pre-testing data saved successfully');
      
      if (completePreTesting) {
        // Wait for success message to be visible before completing
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to save pre-testing data');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Initialize auto refraction if it doesn't exist
  const ensureAutoRefraction = () => {
    if (!formData.autoRefraction) {
      setFormData(prev => ({
        ...prev,
        autoRefraction: {
          rightEye: {
            sphere: 0,
            cylinder: 0,
            axis: 0
          },
          leftEye: {
            sphere: 0,
            cylinder: 0,
            axis: 0
          }
        }
      }));
    }
  };
  
  // Initialize cover test if it doesn't exist
  const ensureCoverTest = () => {
    if (!formData.coverTest) {
      setFormData(prev => ({
        ...prev,
        coverTest: {
          distance: 'ortho',
          near: 'ortho'
        }
      }));
    }
  };
  
  // Initialize pupils if they don't exist
  const ensurePupils = () => {
    if (!formData.pupils) {
      setFormData(prev => ({
        ...prev,
        pupils: {
          rightEye: {},
          leftEye: {}
        }
      }));
    }
  };
  
  // Initialize confrontation fields if they don't exist
  const ensureConfrontationFields = () => {
    if (!formData.confrontationFields) {
      setFormData(prev => ({
        ...prev,
        confrontationFields: {
          rightEye: {
            superior: true,
            inferior: true,
            nasal: true,
            temporal: true
          },
          leftEye: {
            superior: true,
            inferior: true,
            nasal: true,
            temporal: true
          }
        }
      }));
    }
  };
  
  // Initialize color vision if it doesn't exist
  const ensureColorVision = () => {
    if (!formData.colorVision) {
      setFormData(prev => ({
        ...prev,
        colorVision: {
          rightEye: {
            performed: false
          },
          leftEye: {
            performed: false
          }
        }
      }));
    }
  };
  
  // Initialize stereo vision if it doesn't exist
  const ensureStereoVision = () => {
    if (!formData.stereoVision) {
      setFormData(prev => ({
        ...prev,
        stereoVision: {
          performed: false
        }
      }));
    }
  };
  
  // Ensure all sections are initialized
  useEffect(() => {
    ensureAutoRefraction();
    ensureCoverTest();
    ensurePupils();
    ensureConfrontationFields();
    ensureColorVision();
    ensureStereoVision();
  }, []);
  
  // Section header component
  const SectionHeader = ({ 
    title, 
    section, 
    isComplete 
  }: { 
    title: string; 
    section: keyof typeof expandedSections;
    isComplete: boolean;
  }) => (
    <div 
      className="flex justify-between items-center py-3 px-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center">
        <h3 className="text-md font-medium text-gray-900">{title}</h3>
        {isComplete && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800">
            <Check className="w-3 h-3 mr-1" />
            Complete
          </span>
        )}
      </div>
      <button 
        className="text-gray-500 hover:text-gray-700"
        aria-label={expandedSections[section] ? 'Collapse section' : 'Expand section'}
      >
        {expandedSections[section] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
    </div>
  );

  return (
    <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
      <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Pre-Testing: {patient.firstName} {patient.lastName}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Record all pre-testing measurements and observations
          </p>
        </div>
      </div>
      
      {errorMessage && (
        <div className="m-4 p-3 bg-error-50 border border-error-200 rounded-md text-error-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="m-4 p-3 bg-success-50 border border-success-200 rounded-md text-success-800 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}
      
      {/* Auto Refraction Section */}
      <div className="border-b border-gray-200">
        <SectionHeader 
          title="Auto Refraction" 
          section="autoRefraction" 
          isComplete={!!(formData.autoRefraction?.rightEye && formData.autoRefraction?.leftEye)}
        />
        
        {expandedSections.autoRefraction && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right Eye */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-primary-700 mb-3">Right Eye (OD)</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Sphere</label>
                  <div className="flex items-center">
                    <select 
                      value={formData.autoRefraction?.rightEye?.sphere >= 0 ? '+' : '-'}
                      onChange={(e) => {
                        const currentValue = formData.autoRefraction?.rightEye?.sphere || 0;
                        const sign = e.target.value === '+' ? 1 : -1;
                        handleNestedChange(
                          'autoRefraction', 
                          'rightEye', 
                          'sphere',
                          Math.abs(currentValue) * sign
                        );
                      }}
                      className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 mr-1 w-14"
                    >
                      <option value="+">+</option>
                      <option value="-">-</option>
                    </select>
                    <input
                      type="number"
                      step="0.25"
                      value={Math.abs(formData.autoRefraction?.rightEye?.sphere || 0)}
                      onChange={(e) => {
                        const currentValue = formData.autoRefraction?.rightEye?.sphere || 0;
                        const sign = currentValue >= 0 ? 1 : -1;
                        handleNestedChange(
                          'autoRefraction', 
                          'rightEye', 
                          'sphere',
                          Math.abs(parseFloat(e.target.value)) * sign
                        );
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Cylinder</label>
                  <div className="flex items-center">
                    <select
                      value={formData.autoRefraction?.rightEye?.cylinder >= 0 ? '+' : '-'}
                      onChange={(e) => {
                        const currentValue = formData.autoRefraction?.rightEye?.cylinder || 0;
                        const sign = e.target.value === '+' ? 1 : -1;
                        handleNestedChange(
                          'autoRefraction', 
                          'rightEye', 
                          'cylinder',
                          Math.abs(currentValue) * sign
                        );
                      }}
                      className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 mr-1 w-14"
                    >
                      <option value="+">+</option>
                      <option value="-">-</option>
                    </select>
                    <input
                      type="number"
                      step="0.25"
                      value={Math.abs(formData.autoRefraction?.rightEye?.cylinder || 0)}
                      onChange={(e) => {
                        const currentValue = formData.autoRefraction?.rightEye?.cylinder || 0;
                        const sign = currentValue >= 0 ? 1 : -1;
                        handleNestedChange(
                          'autoRefraction', 
                          'rightEye', 
                          'cylinder',
                          Math.abs(parseFloat(e.target.value)) * sign
                        );
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Axis</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={formData.autoRefraction?.rightEye?.axis || 0}
                    onChange={(e) => handleNestedChange('autoRefraction', 'rightEye', 'axis', parseInt(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Left Eye */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-primary-700 mb-3">Left Eye (OS)</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Sphere</label>
                  <div className="flex items-center">
                    <select
                      value={formData.autoRefraction?.leftEye?.sphere >= 0 ? '+' : '-'}
                      onChange={(e) => {
                        const currentValue = formData.autoRefraction?.leftEye?.sphere || 0;
                        const sign = e.target.value === '+' ? 1 : -1;
                        handleNestedChange(
                          'autoRefraction', 
                          'leftEye', 
                          'sphere',
                          Math.abs(currentValue) * sign
                        );
                      }}
                      className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 mr-1 w-14"
                    >
                      <option value="+">+</option>
                      <option value="-">-</option>
                    </select>
                    <input
                      type="number"
                      step="0.25"
                      value={Math.abs(formData.autoRefraction?.leftEye?.sphere || 0)}
                      onChange={(e) => {
                        const currentValue = formData.autoRefraction?.leftEye?.sphere || 0;
                        const sign = currentValue >= 0 ? 1 : -1;
                        handleNestedChange(
                          'autoRefraction', 
                          'leftEye', 
                          'sphere',
                          Math.abs(parseFloat(e.target.value)) * sign
                        );
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Cylinder</label>
                  <div className="flex items-center">
                    <select
                      value={formData.autoRefraction?.leftEye?.cylinder >= 0 ? '+' : '-'}
                      onChange={(e) => {
                        const currentValue = formData.autoRefraction?.leftEye?.cylinder || 0;
                        const sign = e.target.value === '+' ? 1 : -1;
                        handleNestedChange(
                          'autoRefraction', 
                          'leftEye', 
                          'cylinder',
                          Math.abs(currentValue) * sign
                        );
                      }}
                      className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 mr-1 w-14"
                    >
                      <option value="+">+</option>
                      <option value="-">-</option>
                    </select>
                    <input
                      type="number"
                      step="0.25"
                      value={Math.abs(formData.autoRefraction?.leftEye?.cylinder || 0)}
                      onChange={(e) => {
                        const currentValue = formData.autoRefraction?.leftEye?.cylinder || 0;
                        const sign = currentValue >= 0 ? 1 : -1;
                        handleNestedChange(
                          'autoRefraction', 
                          'leftEye', 
                          'cylinder',
                          Math.abs(parseFloat(e.target.value)) * sign
                        );
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Axis</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={formData.autoRefraction?.leftEye?.axis || 0}
                    onChange={(e) => handleNestedChange('autoRefraction', 'leftEye', 'axis', parseInt(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Visual Acuity Section */}
      <div className="border-b border-gray-200">
        <SectionHeader 
          title="Visual Acuity" 
          section="vision" 
          isComplete={!!(formData.vision?.rightEye?.uncorrected && formData.vision?.leftEye?.uncorrected)}
        />
        
        {expandedSections.vision && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right Eye */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-primary-700 mb-3">Right Eye (OD)</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Uncorrected</label>
                  <select
                    value={formData.vision?.rightEye?.uncorrected || ''}
                    onChange={(e) => handleNestedChange('vision', 'rightEye', 'uncorrected', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select VA...</option>
                    <option value="20/15">20/15</option>
                    <option value="20/20">20/20</option>
                    <option value="20/25">20/25</option>
                    <option value="20/30">20/30</option>
                    <option value="20/40">20/40</option>
                    <option value="20/50">20/50</option>
                    <option value="20/60">20/60</option>
                    <option value="20/70">20/70</option>
                    <option value="20/80">20/80</option>
                    <option value="20/100">20/100</option>
                    <option value="20/200">20/200</option>
                    <option value="20/400">20/400</option>
                    <option value="CF">Counting Fingers (CF)</option>
                    <option value="HM">Hand Motion (HM)</option>
                    <option value="LP">Light Perception (LP)</option>
                    <option value="NLP">No Light Perception (NLP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Corrected</label>
                  <select
                    value={formData.vision?.rightEye?.corrected || ''}
                    onChange={(e) => handleNestedChange('vision', 'rightEye', 'corrected', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select VA...</option>
                    <option value="20/15">20/15</option>
                    <option value="20/20">20/20</option>
                    <option value="20/25">20/25</option>
                    <option value="20/30">20/30</option>
                    <option value="20/40">20/40</option>
                    <option value="20/50">20/50</option>
                    <option value="20/60">20/60</option>
                    <option value="20/70">20/70</option>
                    <option value="20/80">20/80</option>
                    <option value="20/100">20/100</option>
                    <option value="20/200">20/200</option>
                    <option value="20/400">20/400</option>
                    <option value="CF">Counting Fingers (CF)</option>
                    <option value="HM">Hand Motion (HM)</option>
                    <option value="LP">Light Perception (LP)</option>
                    <option value="NLP">No Light Perception (NLP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Pinhole</label>
                  <select
                    value={formData.vision?.rightEye?.pinhole || ''}
                    onChange={(e) => handleNestedChange('vision', 'rightEye', 'pinhole', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select VA...</option>
                    <option value="20/15">20/15</option>
                    <option value="20/20">20/20</option>
                    <option value="20/25">20/25</option>
                    <option value="20/30">20/30</option>
                    <option value="20/40">20/40</option>
                    <option value="20/50">20/50</option>
                    <option value="20/60">20/60</option>
                    <option value="20/70">20/70</option>
                    <option value="20/80">20/80</option>
                    <option value="20/100">20/100</option>
                    <option value="20/200">20/200</option>
                    <option value="20/400">20/400</option>
                    <option value="CF">Counting Fingers (CF)</option>
                    <option value="HM">Hand Motion (HM)</option>
                    <option value="LP">Light Perception (LP)</option>
                    <option value="NLP">No Light Perception (NLP)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Left Eye */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-primary-700 mb-3">Left Eye (OS)</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Uncorrected</label>
                  <select
                    value={formData.vision?.leftEye?.uncorrected || ''}
                    onChange={(e) => handleNestedChange('vision', 'leftEye', 'uncorrected', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select VA...</option>
                    <option value="20/15">20/15</option>
                    <option value="20/20">20/20</option>
                    <option value="20/25">20/25</option>
                    <option value="20/30">20/30</option>
                    <option value="20/40">20/40</option>
                    <option value="20/50">20/50</option>
                    <option value="20/60">20/60</option>
                    <option value="20/70">20/70</option>
                    <option value="20/80">20/80</option>
                    <option value="20/100">20/100</option>
                    <option value="20/200">20/200</option>
                    <option value="20/400">20/400</option>
                    <option value="CF">Counting Fingers (CF)</option>
                    <option value="HM">Hand Motion (HM)</option>
                    <option value="LP">Light Perception (LP)</option>
                    <option value="NLP">No Light Perception (NLP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Corrected</label>
                  <select
                    value={formData.vision?.leftEye?.corrected || ''}
                    onChange={(e) => handleNestedChange('vision', 'leftEye', 'corrected', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select VA...</option>
                    <option value="20/15">20/15</option>
                    <option value="20/20">20/20</option>
                    <option value="20/25">20/25</option>
                    <option value="20/30">20/30</option>
                    <option value="20/40">20/40</option>
                    <option value="20/50">20/50</option>
                    <option value="20/60">20/60</option>
                    <option value="20/70">20/70</option>
                    <option value="20/80">20/80</option>
                    <option value="20/100">20/100</option>
                    <option value="20/200">20/200</option>
                    <option value="20/400">20/400</option>
                    <option value="CF">Counting Fingers (CF)</option>
                    <option value="HM">Hand Motion (HM)</option>
                    <option value="LP">Light Perception (LP)</option>
                    <option value="NLP">No Light Perception (NLP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Pinhole</label>
                  <select
                    value={formData.vision?.leftEye?.pinhole || ''}
                    onChange={(e) => handleNestedChange('vision', 'leftEye', 'pinhole', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select VA...</option>
                    <option value="20/15">20/15</option>
                    <option value="20/20">20/20</option>
                    <option value="20/25">20/25</option>
                    <option value="20/30">20/30</option>
                    <option value="20/40">20/40</option>
                    <option value="20/50">20/50</option>
                    <option value="20/60">20/60</option>
                    <option value="20/70">20/70</option>
                    <option value="20/80">20/80</option>
                    <option value="20/100">20/100</option>
                    <option value="20/200">20/200</option>
                    <option value="20/400">20/400</option>
                    <option value="CF">Counting Fingers (CF)</option>
                    <option value="HM">Hand Motion (HM)</option>
                    <option value="LP">Light Perception (LP)</option>
                    <option value="NLP">No Light Perception (NLP)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Cover Test Section */}
      <div className="border-b border-gray-200">
        <SectionHeader 
          title="Cover Test" 
          section="coverTest" 
          isComplete={!!(formData.coverTest?.distance && formData.coverTest?.near)}
        />
        
        {expandedSections.coverTest && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Distance */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-primary-700 mb-3">Distance</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Result</label>
                    <select
                      value={formData.coverTest?.distance || 'not_tested'}
                      onChange={(e) => handleInputChange('coverTest', 'distance', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="not_tested">Not Tested</option>
                      <option value="ortho">Orthophoric</option>
                      <option value="eso">Esophoria</option>
                      <option value="exo">Exophoria</option>
                      <option value="hyper">Hyperphoria</option>
                      <option value="hypo">Hypophoria</option>
                    </select>
                  </div>
                  
                  {formData.coverTest?.distance && formData.coverTest.distance !== 'ortho' && formData.coverTest.distance !== 'not_tested' && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Amount (Δ)</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={formData.coverTest?.distanceAmount || ''}
                        onChange={(e) => handleInputChange('coverTest', 'distanceAmount', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Near */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-primary-700 mb-3">Near</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Result</label>
                    <select
                      value={formData.coverTest?.near || 'not_tested'}
                      onChange={(e) => handleInputChange('coverTest', 'near', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="not_tested">Not Tested</option>
                      <option value="ortho">Orthophoric</option>
                      <option value="eso">Esophoria</option>
                      <option value="exo">Exophoria</option>
                      <option value="hyper">Hyperphoria</option>
                      <option value="hypo">Hypophoria</option>
                    </select>
                  </div>
                  
                  {formData.coverTest?.near && formData.coverTest.near !== 'ortho' && formData.coverTest.near !== 'not_tested' && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Amount (Δ)</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={formData.coverTest?.nearAmount || ''}
                        onChange={(e) => handleInputChange('coverTest', 'nearAmount', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.coverTest?.notes || ''}
                onChange={(e) => handleInputChange('coverTest', 'notes', e.target.value)}
                rows={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Any observations or additional information..."
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Pupil Testing */}
      <div className="border-b border-gray-200">
        <SectionHeader 
          title="Pupil Testing" 
          section="pupils" 
          isComplete={!!(formData.pupils?.rightEye?.size && formData.pupils?.leftEye?.size)}
        />
        
        {expandedSections.pupils && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right Eye */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-primary-700 mb-3">Right Eye (OD)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Size (mm)</label>
                  <select
                    value={formData.pupils?.rightEye?.size || ''}
                    onChange={(e) => handleNestedChange('pupils', 'rightEye', 'size', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select size</option>
                    <option value="1">1 mm</option>
                    <option value="1.5">1.5 mm</option>
                    <option value="2">2 mm</option>
                    <option value="2.5">2.5 mm</option>
                    <option value="3">3 mm</option>
                    <option value="3.5">3.5 mm</option>
                    <option value="4">4 mm</option>
                    <option value="4.5">4.5 mm</option>
                    <option value="5">5 mm</option>
                    <option value="5.5">5.5 mm</option>
                    <option value="6">6 mm</option>
                    <option value="6.5">6.5 mm</option>
                    <option value="7">7 mm</option>
                    <option value="7.5">7.5 mm</option>
                    <option value="8">8 mm</option>
                    <option value="8.5">8.5 mm</option>
                    <option value="9">9 mm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Reaction</label>
                  <select
                    value={formData.pupils?.rightEye?.reaction || ''}
                    onChange={(e) => handleNestedChange('pupils', 'rightEye', 'reaction', e.target.value || undefined)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select reaction</option>
                    <option value="normal">Normal</option>
                    <option value="sluggish">Sluggish</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.pupils?.rightEye?.RAPD || false}
                      onChange={(e) => handleNestedChange('pupils', 'rightEye', 'RAPD', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      RAPD Present
                    </span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Left Eye */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-primary-700 mb-3">Left Eye (OS)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Size (mm)</label>
                  <select
                    value={formData.pupils?.leftEye?.size || ''}
                    onChange={(e) => handleNestedChange('pupils', 'leftEye', 'size', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select size</option>
                    <option value="1">1 mm</option>
                    <option value="1.5">1.5 mm</option>
                    <option value="2">2 mm</option>
                    <option value="2.5">2.5 mm</option>
                    <option value="3">3 mm</option>
                    <option value="3.5">3.5 mm</option>
                    <option value="4">4 mm</option>
                    <option value="4.5">4.5 mm</option>
                    <option value="5">5 mm</option>
                    <option value="5.5">5.5 mm</option>
                    <option value="6">6 mm</option>
                    <option value="6.5">6.5 mm</option>
                    <option value="7">7 mm</option>
                    <option value="7.5">7.5 mm</option>
                    <option value="8">8 mm</option>
                    <option value="8.5">8.5 mm</option>
                    <option value="9">9 mm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Reaction</label>
                  <select
                    value={formData.pupils?.leftEye?.reaction || ''}
                    onChange={(e) => handleNestedChange('pupils', 'leftEye', 'reaction', e.target.value || undefined)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select reaction</option>
                    <option value="normal">Normal</option>
                    <option value="sluggish">Sluggish</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.pupils?.leftEye?.RAPD || false}
                      onChange={(e) => handleNestedChange('pupils', 'leftEye', 'RAPD', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      RAPD Present
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Confrontation Visual Fields */}
      <div className="border-b border-gray-200">
        <SectionHeader 
          title="Confrontation Visual Fields" 
          section="confrontation" 
          isComplete={!!(formData.confrontationFields?.rightEye && formData.confrontationFields?.leftEye)}
        />
        
        {expandedSections.confrontation && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right Eye */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-primary-700 mb-3">Right Eye (OD)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.confrontationFields?.rightEye?.superior || false}
                    onChange={(e) => handleNestedChange('confrontationFields', 'rightEye', 'superior', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Superior
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.confrontationFields?.rightEye?.inferior || false}
                    onChange={(e) => handleNestedChange('confrontationFields', 'rightEye', 'inferior', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Inferior
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.confrontationFields?.rightEye?.nasal || false}
                    onChange={(e) => handleNestedChange('confrontationFields', 'rightEye', 'nasal', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Nasal
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.confrontationFields?.rightEye?.temporal || false}
                    onChange={(e) => handleNestedChange('confrontationFields', 'rightEye', 'temporal', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Temporal
                  </span>
                </label>
              </div>
              
              {/* Visual field diagram - simplified representation */}
              <div className="mt-4 relative w-32 h-32 mx-auto border border-gray-300 rounded-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-full bg-gray-300"></div>
                  <div className="h-1 w-full bg-gray-300 absolute top-1/2"></div>
                </div>
                <div 
                  className={`absolute w-4 h-4 rounded-full top-2 left-1/2 transform -translate-x-1/2 ${
                    formData.confrontationFields?.rightEye?.superior ? 'bg-success-500' : 'bg-gray-200'
                  }`}
                ></div>
                <div 
                  className={`absolute w-4 h-4 rounded-full bottom-2 left-1/2 transform -translate-x-1/2 ${
                    formData.confrontationFields?.rightEye?.inferior ? 'bg-success-500' : 'bg-gray-200'
                  }`}
                ></div>
                <div 
                  className={`absolute w-4 h-4 rounded-full left-2 top-1/2 transform -translate-y-1/2 ${
                    formData.confrontationFields?.rightEye?.nasal ? 'bg-success-500' : 'bg-gray-200'
                  }`}
                ></div>
                <div 
                  className={`absolute w-4 h-4 rounded-full right-2 top-1/2 transform -translate-y-1/2 ${
                    formData.confrontationFields?.rightEye?.temporal ? 'bg-success-500' : 'bg-gray-200'
                  }`}
                ></div>
              </div>
            </div>
            
            {/* Left Eye */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-primary-700 mb-3">Left Eye (OS)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.confrontationFields?.leftEye?.superior || false}
                    onChange={(e) => handleNestedChange('confrontationFields', 'leftEye', 'superior', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Superior
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.confrontationFields?.leftEye?.inferior || false}
                    onChange={(e) => handleNestedChange('confrontationFields', 'leftEye', 'inferior', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Inferior
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.confrontationFields?.leftEye?.nasal || false}
                    onChange={(e) => handleNestedChange('confrontationFields', 'leftEye', 'nasal', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Nasal
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.confrontationFields?.leftEye?.temporal || false}
                    onChange={(e) => handleNestedChange('confrontationFields', 'leftEye', 'temporal', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Temporal
                  </span>
                </label>
              </div>
              
              {/* Visual field diagram - simplified representation */}
              <div className="mt-4 relative w-32 h-32 mx-auto border border-gray-300 rounded-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-full bg-gray-300"></div>
                  <div className="h-1 w-full bg-gray-300 absolute top-1/2"></div>
                </div>
                <div 
                  className={`absolute w-4 h-4 rounded-full top-2 left-1/2 transform -translate-x-1/2 ${
                    formData.confrontationFields?.leftEye?.superior ? 'bg-success-500' : 'bg-gray-200'
                  }`}
                ></div>
                <div 
                  className={`absolute w-4 h-4 rounded-full bottom-2 left-1/2 transform -translate-x-1/2 ${
                    formData.confrontationFields?.leftEye?.inferior ? 'bg-success-500' : 'bg-gray-200'
                  }`}
                ></div>
                <div 
                  className={`absolute w-4 h-4 rounded-full left-2 top-1/2 transform -translate-y-1/2 ${
                    formData.confrontationFields?.leftEye?.temporal ? 'bg-success-500' : 'bg-gray-200'
                  }`}
                ></div>
                <div 
                  className={`absolute w-4 h-4 rounded-full right-2 top-1/2 transform -translate-y-1/2 ${
                    formData.confrontationFields?.leftEye?.nasal ? 'bg-success-500' : 'bg-gray-200'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Color Vision Testing */}
      <div className="border-b border-gray-200">
        <SectionHeader 
          title="Color Vision Testing" 
          section="colorVision" 
          isComplete={!!(
            (formData.colorVision?.rightEye?.performed && formData.colorVision?.rightEye?.result) &&
            (formData.colorVision?.leftEye?.performed && formData.colorVision?.leftEye?.result)
          )}
        />
        
        {expandedSections.colorVision && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right Eye */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-primary-700 mb-3">Right Eye (OD)</h3>
              
              <div className="mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.colorVision?.rightEye?.performed || false}
                    onChange={(e) => handleNestedChange('colorVision', 'rightEye', 'performed', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Test Performed
                  </span>
                </label>
              </div>
              
              {formData.colorVision?.rightEye?.performed && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Test Type</label>
                    <select
                      value={formData.colorVision?.rightEye?.type || ''}
                      onChange={(e) => handleNestedChange('colorVision', 'rightEye', 'type', e.target.value || undefined)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Select type</option>
                      <option value="ishihara">Ishihara</option>
                      <option value="hrr">HRR</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Result</label>
                    <select
                      value={formData.colorVision?.rightEye?.result || ''}
                      onChange={(e) => handleNestedChange('colorVision', 'rightEye', 'result', e.target.value || undefined)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Select result</option>
                      <option value="normal">Normal</option>
                      <option value="deficient">Color Deficient</option>
                    </select>
                  </div>
                  
                  {formData.colorVision?.rightEye?.type === 'ishihara' && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Value (out of 14)</label>
                      <input
                        type="number"
                        min="0"
                        max="14"
                        value={formData.colorVision?.rightEye?.value || ''}
                        onChange={(e) => handleNestedChange('colorVision', 'rightEye', 'value', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Left Eye */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-primary-700 mb-3">Left Eye (OS)</h3>
              
              <div className="mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.colorVision?.leftEye?.performed || false}
                    onChange={(e) => handleNestedChange('colorVision', 'leftEye', 'performed', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    Test Performed
                  </span>
                </label>
              </div>
              
              {formData.colorVision?.leftEye?.performed && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Test Type</label>
                    <select
                      value={formData.colorVision?.leftEye?.type || ''}
                      onChange={(e) => handleNestedChange('colorVision', 'leftEye', 'type', e.target.value || undefined)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Select type</option>
                      <option value="ishihara">Ishihara</option>
                      <option value="hrr">HRR</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Result</label>
                    <select
                      value={formData.colorVision?.leftEye?.result || ''}
                      onChange={(e) => handleNestedChange('colorVision', 'leftEye', 'result', e.target.value || undefined)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Select result</option>
                      <option value="normal">Normal</option>
                      <option value="deficient">Color Deficient</option>
                    </select>
                  </div>
                  
                  {formData.colorVision?.leftEye?.type === 'ishihara' && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Value (out of 14)</label>
                      <input
                        type="number"
                        min="0"
                        max="14"
                        value={formData.colorVision?.leftEye?.value || ''}
                        onChange={(e) => handleNestedChange('colorVision', 'leftEye', 'value', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Stereo Vision */}
      <div className="border-b border-gray-200">
        <SectionHeader 
          title="Stereo Vision" 
          section="stereoVision" 
          isComplete={!!(formData.stereoVision?.performed && formData.stereoVision?.result)}
        />
        
        {expandedSections.stereoVision && (
          <div className="p-4">
            <div className="mb-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.stereoVision?.performed || false}
                  onChange={(e) => handleInputChange('stereoVision', 'performed', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">
                  Test Performed
                </span>
              </label>
            </div>
            
            {formData.stereoVision?.performed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Test Type</label>
                  <select
                    value={formData.stereoVision?.test || ''}
                    onChange={(e) => handleInputChange('stereoVision', 'test', e.target.value || undefined)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select type</option>
                    <option value="titmus">Titmus</option>
                    <option value="randot">Randot</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Result (seconds of arc)</label>
                  <select
                    value={formData.stereoVision?.result || ''}
                    onChange={(e) => handleInputChange('stereoVision', 'result', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select result</option>
                    <option value="40">40"</option>
                    <option value="50">50"</option>
                    <option value="60">60"</option>
                    <option value="80">80"</option>
                    <option value="100">100"</option>
                    <option value="140">140"</option>
                    <option value="200">200"</option>
                    <option value="400">400"</option>
                    <option value="800">800"</option>
                    <option value="3000">3000" (Fly only)</option>
                    <option value="0">No stereo</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.stereoVision?.notes || ''}
                    onChange={(e) => handleInputChange('stereoVision', 'notes', e.target.value)}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Any observations or additional information..."
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Form Footer */}
      <div className="p-4 bg-gray-50 flex justify-end space-x-3">
        <button
          type="button"
          className="btn-outline"
          onClick={() => handleSave(false)}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => handleSave(true)}
          disabled={isSaving}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete Pre-Testing
        </button>
      </div>
    </div>
  );
};

export default PreTestingForm;