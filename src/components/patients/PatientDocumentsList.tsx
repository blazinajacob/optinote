import { useState, useEffect } from 'react';
import { 
  File, FileText, Image, Download, Eye, Trash2, 
  FileSearch, FileQuestion, Filter, Calendar, Tag, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { formatDate } from '../../lib/utils';
import { PatientDocument } from './PatientDocumentsUploader';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with the relativeTime plugin to enable fromNow() function
dayjs.extend(relativeTime);

interface PatientDocumentsListProps {
  patientId: string;
  documents: PatientDocument[];
  onDeleteDocument?: (documentId: string) => void;
  className?: string;
}

// For the demo, we'll use some sample documents
const sampleDocuments: PatientDocument[] = [
  {
    id: 'doc-1',
    patientId: 'PT-123456',
    fileName: 'medical_history.pdf',
    fileType: 'application/pdf',
    fileSize: 2456000,
    fileUrl: '#',
    category: 'medical_record',
    description: 'Complete medical history from previous provider',
    uploadedBy: 'Dr. Sarah Johnson',
    uploadedAt: '2024-06-01T14:30:00Z'
  },
  {
    id: 'doc-2',
    patientId: 'PT-123456',
    fileName: 'insurance_card.jpg',
    fileType: 'image/jpeg',
    fileSize: 856000,
    fileUrl: '#',
    category: 'insurance',
    description: 'Front and back of insurance card',
    uploadedBy: 'Michael Rodriguez',
    uploadedAt: '2024-05-28T09:15:00Z'
  },
  {
    id: 'doc-3',
    patientId: 'PT-123456',
    fileName: 'recent_prescription.pdf',
    fileType: 'application/pdf',
    fileSize: 1250000,
    fileUrl: '#',
    category: 'prescription',
    description: 'Prescription from Dr. Williams',
    uploadedBy: 'Dr. Sarah Johnson',
    uploadedAt: '2024-05-20T16:45:00Z'
  },
  {
    id: 'doc-4',
    patientId: 'PT-123456',
    fileName: 'retina_scan_2024.png',
    fileType: 'image/png',
    fileSize: 3700000,
    fileUrl: '#',
    category: 'imaging',
    description: 'Annual retina scan',
    uploadedBy: 'Dr. Sarah Johnson',
    uploadedAt: '2024-04-15T11:20:00Z'
  }
];

const PatientDocumentsList = ({ 
  patientId, 
  documents: propDocuments, 
  onDeleteDocument,
  className 
}: PatientDocumentsListProps) => {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PatientDocument['category'] | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'last_week' | 'last_month' | 'last_year'>('all');
  const [previewDocument, setPreviewDocument] = useState<PatientDocument | null>(null);

  useEffect(() => {
    // In a real app, we would fetch documents from the database
    // For this demo, we'll use the sample documents and merge with any passed as props
    setDocuments([...sampleDocuments, ...propDocuments]);
    setIsLoading(false);
  }, [patientId, propDocuments]);

  // Filter documents based on search term and filters
  const filteredDocuments = documents.filter(document => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      document.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (document.description && document.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    // Apply category filter
    if (categoryFilter !== 'all' && document.category !== categoryFilter) return false;
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const uploadDate = dayjs(document.uploadedAt);
      const now = dayjs();
      
      if (dateFilter === 'last_week' && uploadDate.isBefore(now.subtract(1, 'week'))) return false;
      if (dateFilter === 'last_month' && uploadDate.isBefore(now.subtract(1, 'month'))) return false;
      if (dateFilter === 'last_year' && uploadDate.isBefore(now.subtract(1, 'year'))) return false;
    }
    
    return true;
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-accent-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-error-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <File className="h-5 w-5 text-primary-500" />;
    } else {
      return <FileQuestion className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryLabel = (category: PatientDocument['category']): string => {
    switch(category) {
      case 'medical_record': return 'Medical Record';
      case 'insurance': return 'Insurance';
      case 'prescription': return 'Prescription';
      case 'imaging': return 'Imaging';
      case 'lab_result': return 'Lab Result';
      case 'other': return 'Other';
      default: return category;
    }
  };

  const getCategoryColor = (category: PatientDocument['category']): string => {
    switch(category) {
      case 'medical_record': return 'bg-primary-100 text-primary-800';
      case 'insurance': return 'bg-accent-100 text-accent-800';
      case 'prescription': return 'bg-success-100 text-success-800';
      case 'imaging': return 'bg-secondary-100 text-secondary-800';
      case 'lab_result': return 'bg-warning-100 text-warning-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = (documentId: string) => {
    // Confirm before deletion
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      // In a real app, we would delete the document from storage and database
      setDocuments(documents.filter(doc => doc.id !== documentId));
      
      if (onDeleteDocument) {
        onDeleteDocument(documentId);
      }
    }
  };

  const handleDownload = (document: PatientDocument) => {
    // In a real app, we would download the file from the URL
    window.open(document.fileUrl, '_blank');
  };

  const openPreview = (document: PatientDocument) => {
    setPreviewDocument(document);
  };

  return (
    <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Patient Documents</h3>
        
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documents..."
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <select
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
          >
            <option value="all">All Categories</option>
            <option value="medical_record">Medical Records</option>
            <option value="insurance">Insurance</option>
            <option value="prescription">Prescriptions</option>
            <option value="imaging">Imaging</option>
            <option value="lab_result">Lab Results</option>
            <option value="other">Other</option>
          </select>
          
          <select
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
          >
            <option value="all">All Dates</option>
            <option value="last_week">Last Week</option>
            <option value="last_month">Last Month</option>
            <option value="last_year">Last Year</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading documents...</p>
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getFileIcon(document.fileType)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {document.fileName}
                        </div>
                        {document.description && (
                          <div className="text-sm text-gray-500">
                            {document.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getCategoryColor(document.category)
                    )}>
                      <Tag className="mr-1 h-3 w-3" />
                      {getCategoryLabel(document.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(document.fileSize)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(document.uploadedAt)}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {dayjs(document.uploadedAt).fromNow()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {document.uploadedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => openPreview(document)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="text-gray-600 hover:text-primary-600"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="text-gray-600 hover:text-error-600"
                        onClick={() => handleDelete(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileSearch className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter !== 'all' || dateFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Upload documents to keep track of important patient records'}
          </p>
          {(searchTerm || categoryFilter !== 'all' || dateFilter !== 'all') && (
            <button 
              className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setDateFilter('all');
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDocument && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 transition-opacity" 
                aria-hidden="true"
                onClick={() => setPreviewDocument(null)}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </motion.div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                      {getFileIcon(previewDocument.fileType)}
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {previewDocument.fileName}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {previewDocument.description || 'No description provided'}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                          Uploaded on {formatDate(previewDocument.uploadedAt)}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Tag className="mr-1.5 h-4 w-4 text-gray-400" />
                          Category: {getCategoryLabel(previewDocument.category)}
                        </div>
                      </div>
                      
                      <div className="mt-4 border rounded-md p-2 bg-gray-50 h-64 overflow-auto">
                        {previewDocument.fileType.startsWith('image/') ? (
                          <img 
                            src={previewDocument.fileUrl} 
                            alt={previewDocument.fileName} 
                            className="mx-auto max-h-full"
                          />
                        ) : previewDocument.fileType === 'application/pdf' ? (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-sm text-gray-500">
                              PDF preview not available. Click download to view.
                            </p>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-sm text-gray-500">
                              Preview not available for this file type. Click download to view.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="btn-primary sm:ml-3 sm:w-auto"
                    onClick={() => handleDownload(previewDocument)}
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    Download
                  </button>
                  <button
                    type="button"
                    className="btn-outline sm:ml-3 sm:w-auto"
                    onClick={() => setPreviewDocument(null)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDocumentsList;