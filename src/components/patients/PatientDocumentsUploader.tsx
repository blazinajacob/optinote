import { useState, useRef } from 'react';
import { 
  Upload, X, FileType, File, FileText, Image, Download, 
  Eye, Trash2, Calendar, Clock, Tag, AlertCircle, Check, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';

export interface PatientDocument {
  id: string;
  patientId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  category: 'medical_record' | 'insurance' | 'prescription' | 'imaging' | 'lab_result' | 'other';
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface PatientDocumentsUploaderProps {
  patientId: string;
  onDocumentUploaded?: (document: PatientDocument) => void;
  className?: string;
}

const PatientDocumentsUploader = ({ patientId, onDocumentUploaded, className }: PatientDocumentsUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [category, setCategory] = useState<PatientDocument['category']>('medical_record');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-accent-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-error-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <File className="h-5 w-5 text-primary-500" />;
    } else {
      return <FileType className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Create a new progress tracker
      const newProgress = files.reduce<Record<string, number>>((acc, file) => {
        acc[file.name] = 0;
        return acc;
      }, {});
      setUploadProgress(newProgress);

      // Upload each file
      for (const file of files) {
        // Generate a unique file name to avoid collisions
        const fileExtension = file.name.split('.').pop();
        const fileName = `${patientId}/${new Date().getTime()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
        
        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
          .from('patient_documents')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress) => {
              const percent = Math.round((progress.loaded / progress.total) * 100);
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: percent
              }));
            }
          });

        if (error) {
          throw new Error(`Error uploading file: ${error.message}`);
        }

        // Get public URL for the file
        const { data: { publicUrl } } = supabase.storage
          .from('patient_documents')
          .getPublicUrl(data.path);

        // Store metadata in the database
        const documentData: Omit<PatientDocument, 'id'> = {
          patientId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl: publicUrl,
          category,
          description: description || undefined,
          uploadedBy: 'current-user', // In a real app, get from auth context
          uploadedAt: new Date().toISOString()
        };

        // In a real app, you would save this to your database
        console.log('Document uploaded:', documentData);
        
        // Simulate document creation with ID
        const newDocument: PatientDocument = {
          ...documentData,
          id: `doc-${new Date().getTime()}`
        };

        if (onDocumentUploaded) {
          onDocumentUploaded(newDocument);
        }
      }

      setUploadSuccess(true);
      setFiles([]);
      setDescription('');
      setCategory('medical_record');

      // Reset success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload medical records, insurance documents, or other files related to this patient.
        </p>
      </div>

      <div className="p-4">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
            <p className="mt-1 text-xs text-gray-500">
              PDF, DOC, DOCX, JPG, PNG up to 10MB each
            </p>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Selected files</h4>
            <ul className="divide-y divide-gray-200">
              {files.map((file, index) => (
                <li key={index} className="py-3 flex items-center">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    {uploadProgress[file.name] > 0 && uploadProgress[file.name] < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary-500 h-1.5 rounded-full" 
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="document-category" className="block text-sm font-medium text-gray-700 mb-1">
                Document Category
              </label>
              <select
                id="document-category"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value as PatientDocument['category'])}
              >
                <option value="medical_record">Medical Record</option>
                <option value="insurance">Insurance Document</option>
                <option value="prescription">Prescription</option>
                <option value="imaging">Imaging Report</option>
                <option value="lab_result">Lab Result</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="document-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="document-description"
                rows={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter a brief description of the document"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        )}

        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 bg-error-50 p-3 rounded-md border border-error-200"
            >
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-error-400 mr-2" />
                <span className="text-error-800 text-sm">{uploadError}</span>
              </div>
            </motion.div>
          )}
          
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 bg-success-50 p-3 rounded-md border border-success-200"
            >
              <div className="flex">
                <Check className="h-5 w-5 text-success-400 mr-2" />
                <span className="text-success-800 text-sm">Files uploaded successfully!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="btn-primary"
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length > 0 ? `(${files.length} ${files.length === 1 ? 'file' : 'files'})` : ''}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDocumentsUploader;