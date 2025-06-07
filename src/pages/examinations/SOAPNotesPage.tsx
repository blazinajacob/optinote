import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Download, Printer, Save, 
  AlertCircle, Check, CheckCircle, Sparkles
} from 'lucide-react';
import { usePatientStore } from '../../stores/patientStore';
import { useExaminationStore } from '../../stores/examinationStore';
import { useAuthStore } from '../../stores/authStore';
import { formatDate } from '../../lib/utils';
import AISummaryGenerator from '../../components/ai/AISummaryGenerator';
import { SOAPNote, ICD10Code } from '../../types';

// Mock ICD10 codes for the autocomplete
const MOCK_ICD10_CODES: ICD10Code[] = [
  { code: 'H52.11', description: 'Myopia, right eye' },
  { code: 'H52.12', description: 'Myopia, left eye' },
  { code: 'H52.13', description: 'Myopia, bilateral' },
  { code: 'H52.201', description: 'Astigmatism, right eye' },
  { code: 'H52.202', description: 'Astigmatism, left eye' },
  { code: 'H52.203', description: 'Astigmatism, bilateral' },
  { code: 'H40.11X0', description: 'Primary open-angle glaucoma, stage unspecified' },
  { code: 'H25.11', description: 'Age-related nuclear cataract, right eye' },
  { code: 'H25.12', description: 'Age-related nuclear cataract, left eye' },
  { code: 'H35.361', description: 'Drusen (degenerative) of macula, right eye' },
];

const SOAPNotesPage = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('exam');
  const navigate = useNavigate();
  
  const { user } = useAuthStore();
  const { selectedPatient, getPatientById } = usePatientStore();
  const { 
    selectedExamination, 
    getExaminationById, 
    selectedSoapNote,
    getSoapNoteByExaminationId,
    createSoapNote,
    updateSoapNote,
    isLoading 
  } = useExaminationStore();
  
  const [formData, setFormData] = useState<Partial<SOAPNote>>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    icd10Codes: [],
    mipsCompliant: false,
    mipsCategories: [],
    returnToClinic: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCodeSearch, setShowCodeSearch] = useState(false);
  const [codeSearchTerm, setCodeSearchTerm] = useState('');
  const [filteredCodes, setFilteredCodes] = useState<ICD10Code[]>([]);
  const [showAISummary, setShowAISummary] = useState(false);
  
  useEffect(() => {
    if (patientId) {
      getPatientById(patientId);
    }
    
    if (examId) {
      getExaminationById(examId);
      getSoapNoteByExaminationId(examId);
    }
  }, [patientId, examId, getPatientById, getExaminationById, getSoapNoteByExaminationId]);
  
  useEffect(() => {
    if (selectedSoapNote) {
      setFormData(selectedSoapNote);
    } else if (selectedExamination) {
      // Pre-populate from examination data
      setFormData({
        subjective: `Patient presents with ${selectedExamination.chiefComplaint}`,
        objective: generateObjectiveText(selectedExamination),
        assessment: selectedExamination.diagnosis ? selectedExamination.diagnosis.join('\n') : '',
        plan: selectedExamination.plan || '',
        icd10Codes: selectedExamination.diagnosis 
          ? selectedExamination.diagnosis.map(diag => {
              const parts = diag.split(' - ');
              return { 
                code: parts[0].trim(), 
                description: parts.length > 1 ? parts[1].trim() : ''
              };
            }) 
          : [],
        mipsCompliant: false,
        mipsCategories: [],
        returnToClinic: selectedExamination.followUp || ''
      });
    }
  }, [selectedSoapNote, selectedExamination]);
  
  useEffect(() => {
    if (codeSearchTerm.length > 2) {
      const filtered = MOCK_ICD10_CODES.filter(code => 
        code.code.toLowerCase().includes(codeSearchTerm.toLowerCase()) || 
        code.description.toLowerCase().includes(codeSearchTerm.toLowerCase())
      );
      setFilteredCodes(filtered);
    } else {
      setFilteredCodes([]);
    }
  }, [codeSearchTerm]);
  
  const generateObjectiveText = (exam: any) => {
    const visionText = exam.vision ? `
VA OD ${exam.vision.rightEye.uncorrected || 'N/A'} SC, ${exam.vision.rightEye.corrected || 'N/A'} cc, ${exam.vision.rightEye.pinhole || 'N/A'} ph.
VA OS ${exam.vision.leftEye.uncorrected || 'N/A'} SC, ${exam.vision.leftEye.corrected || 'N/A'} cc, ${exam.vision.leftEye.pinhole || 'N/A'} ph.` : '';
    
    const iopText = exam.intraocularPressure ? `
IOP: ${exam.intraocularPressure.rightEye || 'N/A'} mmHg OD, ${exam.intraocularPressure.leftEye || 'N/A'} mmHg OS.` : '';
    
    const refractionText = exam.refraction ? `
Refraction: OD ${exam.refraction.rightEye.sphere || 'N/A'} ${exam.refraction.rightEye.cylinder || 'N/A'} x ${exam.refraction.rightEye.axis || 'N/A'}, OS ${exam.refraction.leftEye.sphere || 'N/A'} ${exam.refraction.leftEye.cylinder || 'N/A'} x ${exam.refraction.leftEye.axis || 'N/A'}, Add +${exam.refraction.rightEye.add || 'N/A'} OU.` : '';
    
    const pupilsText = exam.pupils ? `
Pupils ${exam.pupils.rightEye.size || 'N/A'}/${exam.pupils.leftEye.size || 'N/A'} mm, ${exam.pupils.rightEye.reaction || 'N/A'}/${exam.pupils.leftEye.reaction || 'N/A'} to light. ${exam.pupils.rightEye.RAPD || exam.pupils.leftEye.RAPD ? 'RAPD present.' : 'No RAPD.'}` : '';
    
    const anteriorSegmentText = exam.anteriorSegment ? `
Anterior segment: ${exam.anteriorSegment}` : '';
    
    const posteriorSegmentText = exam.posteriorSegment ? `
Posterior segment: ${exam.posteriorSegment}` : '';
    
    return `${visionText}${iopText}${refractionText}${pupilsText}${anteriorSegmentText}${posteriorSegmentText}`.trim();
  };
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleAddICD10Code = (code: ICD10Code) => {
    setFormData(prev => ({
      ...prev,
      icd10Codes: [...(prev.icd10Codes || []), code]
    }));
    setShowCodeSearch(false);
    setCodeSearchTerm('');
  };
  
  const handleRemoveICD10Code = (index: number) => {
    setFormData(prev => ({
      ...prev,
      icd10Codes: prev.icd10Codes?.filter((_, i) => i !== index)
    }));
  };
  
  const toggleMipsCategory = (category: string) => {
    setFormData(prev => {
      const currentCategories = prev.mipsCategories || [];
      return {
        ...prev,
        mipsCategories: currentCategories.includes(category)
          ? currentCategories.filter(c => c !== category)
          : [...currentCategories, category]
      };
    });
  };
  
  const handleSave = async (finalize: boolean = false) => {
    if (!patientId || !examId || !user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const soapNoteData = {
        ...formData,
        patientId,
        examinationId: examId,
        doctorId: user.id,
      } as Omit<SOAPNote, 'id' | 'createdAt' | 'updatedAt'>;
      
      if (selectedSoapNote) {
        await updateSoapNote(selectedSoapNote.id, soapNoteData);
      } else {
        await createSoapNote(soapNoteData);
      }
      
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
      if (finalize) {
        navigate(`/patients/${patientId}`);
      }
    } catch (error) {
      console.error('Failed to save SOAP note:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading || !selectedPatient || !selectedExamination) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading SOAP note data...</p>
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
            onClick={() => navigate(`/patients/${patientId}`)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              SOAP Note
            </h1>
            <p className="text-sm text-gray-500">
              Patient: {selectedPatient.firstName} {selectedPatient.lastName} • Exam Date: {formatDate(selectedExamination.date)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
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
            onClick={() => {}}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => {}}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save & Finalize'}
          </button>
        </div>
      </div>
      
      {saveSuccess && (
        <div className="mb-6 p-3 bg-success-50 border border-success-200 rounded-md text-success-800 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          SOAP note saved successfully
        </div>
      )}
      
      {showAISummary && (
        <div className="mb-6">
          <AISummaryGenerator 
            type="soap"
            data={formData}
          />
        </div>
      )}
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">S - Subjective</h2>
            <div className="text-sm text-gray-500">Patient's reported symptoms and history</div>
          </div>
          <textarea
            className="mt-2 w-full h-32 rounded-md border border-gray-300 p-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
            placeholder="Enter patient's subjective symptoms, complaints, and history..."
            value={formData.subjective || ''}
            onChange={(e) => handleInputChange('subjective', e.target.value)}
          />
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">O - Objective</h2>
            <div className="text-sm text-gray-500">Examination findings and test results</div>
          </div>
          <textarea
            className="mt-2 w-full h-40 rounded-md border border-gray-300 p-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
            placeholder="Enter objective examination findings, measurements, and test results..."
            value={formData.objective || ''}
            onChange={(e) => handleInputChange('objective', e.target.value)}
          />
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">A - Assessment</h2>
            <div className="text-sm text-gray-500">Diagnosis and clinical impression</div>
          </div>
          <textarea
            className="mt-2 w-full h-32 rounded-md border border-gray-300 p-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
            placeholder="Enter assessment and diagnosis..."
            value={formData.assessment || ''}
            onChange={(e) => handleInputChange('assessment', e.target.value)}
          />
          
          {/* ICD-10 Codes */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">ICD-10 Codes</h3>
              <button
                type="button"
                className="text-primary-600 text-sm"
                onClick={() => setShowCodeSearch(!showCodeSearch)}
              >
                + Add ICD-10 Code
              </button>
            </div>
            
            {showCodeSearch && (
              <div className="mt-2 relative">
                <input
                  type="text"
                  className="input"
                  placeholder="Search for ICD-10 code or description..."
                  value={codeSearchTerm}
                  onChange={(e) => setCodeSearchTerm(e.target.value)}
                />
                {filteredCodes.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                    {filteredCodes.map((code) => (
                      <button
                        key={code.code}
                        className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                        onClick={() => handleAddICD10Code(code)}
                      >
                        <span className="font-medium">{code.code}</span> - {code.description}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {formData.icd10Codes && formData.icd10Codes.length > 0 ? (
              <div className="mt-3 space-y-2">
                {formData.icd10Codes.map((code, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{code.code}</span> - {code.description}
                    </div>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-error-500"
                      onClick={() => handleRemoveICD10Code(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500 italic">
                No ICD-10 codes added
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">P - Plan</h2>
            <div className="text-sm text-gray-500">Treatment plan and recommendations</div>
          </div>
          <textarea
            className="mt-2 w-full h-32 rounded-md border border-gray-300 p-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
            placeholder="Enter treatment plan, medications, and recommendations..."
            value={formData.plan || ''}
            onChange={(e) => handleInputChange('plan', e.target.value)}
          />
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Return to clinic</label>
            <select
              className="mt-1 input"
              value={formData.returnToClinic || ''}
              onChange={(e) => handleInputChange('returnToClinic', e.target.value)}
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
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">MIPS Compliance</h2>
            <div className="flex items-center">
              <input
                id="mips-compliant"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.mipsCompliant || false}
                onChange={(e) => handleInputChange('mipsCompliant', e.target.checked)}
              />
              <label htmlFor="mips-compliant" className="ml-2 text-sm text-gray-700">
                Mark as MIPS compliant
              </label>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">MIPS Categories</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  id="mips-quality"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={(formData.mipsCategories || []).includes('Quality Measures')}
                  onChange={() => toggleMipsCategory('Quality Measures')}
                />
                <label htmlFor="mips-quality" className="ml-2 text-sm text-gray-700">
                  Quality Measures
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="mips-promoting"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={(formData.mipsCategories || []).includes('Promoting Interoperability')}
                  onChange={() => toggleMipsCategory('Promoting Interoperability')}
                />
                <label htmlFor="mips-promoting" className="ml-2 text-sm text-gray-700">
                  Promoting Interoperability
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="mips-improvement"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={(formData.mipsCategories || []).includes('Improvement Activities')}
                  onChange={() => toggleMipsCategory('Improvement Activities')}
                />
                <label htmlFor="mips-improvement" className="ml-2 text-sm text-gray-700">
                  Improvement Activities
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="mips-cost"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={(formData.mipsCategories || []).includes('Cost')}
                  onChange={() => toggleMipsCategory('Cost')}
                />
                <label htmlFor="mips-cost" className="ml-2 text-sm text-gray-700">
                  Cost
                </label>
              </div>
            </div>
            
            {formData.mipsCompliant && (
              <div className="mt-4 p-3 bg-success-50 text-success-800 rounded-md flex items-center">
                <Check className="h-5 w-5 mr-2" />
                This SOAP note is marked as MIPS compliant
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 flex justify-end space-x-2">
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
            {isSaving ? 'Saving...' : 'Save & Finalize'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOAPNotesPage;