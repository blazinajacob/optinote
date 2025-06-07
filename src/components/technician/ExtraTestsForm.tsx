import { useState } from 'react';
import { 
  Upload, X, Check, AlertCircle, CheckCircle, Camera, 
  FileText, Eye, PlusCircle, Loader2, Image
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ScanResult, Patient } from '../../types';
import { cn } from '../../lib/utils';

interface ExtraTestsFormProps {
  patient: Patient;
  onUpload: (scanResult: Omit<ScanResult, 'id'>) => Promise<void>;
  className?: string;
}

const ExtraTestsForm = ({ patient, onUpload, className }: ExtraTestsFormProps) => {
  const [selectedType, setSelectedType] = useState<ScanResult['type']>('oct');
  const [notes, setNotes] = useState('');
  const [findings, setFindings] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Create a preview URL for the file
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Clear previous error and success states
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    
    try {
      // In a real app, we would upload the file to storage (e.g., Supabase Storage)
      // and then save the metadata to the database
      
      // Simulate an upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock URL for demonstration purposes
      const mockImageUrl = 'https://example.com/images/scan-123456.jpg';
      
      // Create the scan result object
      const scanResult: Omit<ScanResult, 'id'> = {
        examinationId: 'pending', // This would be filled in when associated with an examination
        patientId: patient.id,
        type: selectedType,
        imageUrl: mockImageUrl,
        date: new Date().toISOString(),
        notes: notes || undefined,
        findings: findings || undefined,
        performedBy: 'Current User', // This would be filled with the current user in a real app
        status: 'pending_review'
      };
      
      // Upload the scan result
      await onUpload(scanResult);
      
      // Show success message
      setUploadSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setSelectedType('oct');
        setNotes('');
        setFindings('');
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setUploadSuccess(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error uploading scan:', error);
      setUploadError(error.message || 'An error occurred while uploading the scan');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
      <div className="px-4 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Additional Diagnostic Tests</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload results from additional diagnostic tests and scans
        </p>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Test Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ScanResult['type'])}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="oct">OCT (Optical Coherence Tomography)</option>
            <option value="fundus">Fundus Photography</option>
            <option value="visual_field">Visual Field</option>
            <option value="topography">Topography</option>
            <option value="pachymetry">Pachymetry</option>
            <option value="iol_master">IOL Master</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Image or Report
          </label>
          
          {!selectedFile ? (
            <div 
              className="mt-1 border-2 border-dashed border-gray-300 rounded-md px-6 pt-5 pb-6 cursor-pointer hover:border-primary-500 transition-colors"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG, PDF up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="mt-1 border border-gray-300 rounded-md p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {previewUrl && selectedFile.type.startsWith('image/') ? (
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-16 w-16 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="ml-2 text-gray-400 hover:text-gray-500"
                  onClick={handleRemoveFile}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {previewUrl && selectedFile.type.startsWith('image/') && (
                <div className="mt-3 flex justify-center">
                  <img src={previewUrl} alt="Preview" className="max-h-60 rounded-md" />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Notes Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Add any notes about the test or scan..."
          />
        </div>
        
        {/* Findings Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Findings (optional)
          </label>
          <textarea
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
            rows={2}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Add any initial findings or observations..."
          />
        </div>
        
        {/* Error/Success Messages */}
        {uploadError && (
          <div className="p-3 bg-error-50 border border-error-200 rounded-md text-error-800 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {uploadError}
          </div>
        )}
        
        {uploadSuccess && (
          <div className="p-3 bg-success-50 border border-success-200 rounded-md text-success-800 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Test uploaded successfully!
          </div>
        )}
        
        {/* Upload Button */}
        <div>
          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Test Result
              </>
            )}
          </button>
          
          <p className="mt-2 text-xs text-gray-500">
            Test results will be attached to the patient's record and can be reviewed by the doctor.
          </p>
        </div>
      </div>
      
      {/* Quick Start Test Buttons */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Quick Start Tests</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100"
            onClick={() => {
              setSelectedType('oct');
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            OCT Scan
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100"
            onClick={() => {
              setSelectedType('fundus');
            }}
          >
            <Camera className="h-3 w-3 mr-1" />
            Fundus Photo
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100"
            onClick={() => {
              setSelectedType('visual_field');
            }}
          >
            <Image className="h-3 w-3 mr-1" />
            Visual Field
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100"
            onClick={() => {
              setSelectedType('topography');
            }}
          >
            <Image className="h-3 w-3 mr-1" />
            Topography
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtraTestsForm;