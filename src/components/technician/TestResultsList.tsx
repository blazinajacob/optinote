import { useState } from 'react';
import { Eye, Download, FileText, Calendar, Filter, ChevronDown, X, Image, ArrowUpDown } from 'lucide-react';
import { ScanResult } from '../../types';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface TestResultsListProps {
  patientId: string;
  results: ScanResult[];
  onOpenResult?: (result: ScanResult) => void;
  className?: string;
}

const TestResultsList = ({ patientId, results, onOpenResult, className }: TestResultsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'type'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort test results
  const filteredResults = results
    .filter(result => {
      if (typeFilter !== 'all' && result.type !== typeFilter) {
        return false;
      }
      
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        result.type.toLowerCase().includes(searchLower) ||
        (result.findings && result.findings.toLowerCase().includes(searchLower)) ||
        (result.notes && result.notes.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortDirection === 'asc'
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }
    });
  
  const toggleSort = (field: 'date' | 'type') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Get test type display name
  const getTestTypeDisplay = (type: ScanResult['type']) => {
    switch (type) {
      case 'oct':
        return 'OCT Scan';
      case 'fundus':
        return 'Fundus Photography';
      case 'visual_field':
        return 'Visual Field';
      case 'topography':
        return 'Topography';
      case 'pachymetry':
        return 'Pachymetry';
      case 'iol_master':
        return 'IOL Master';
      default:
        return 'Other Test';
    }
  };

  // Get icon for test type
  const getTestIcon = (type: ScanResult['type']) => {
    switch (type) {
      case 'oct':
      case 'fundus':
      case 'topography':
        return <Image className="h-5 w-5 text-primary-500" />;
      case 'visual_field':
        return <Eye className="h-5 w-5 text-accent-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
      <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
        
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tests..."
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Test Types</option>
            <option value="oct">OCT</option>
            <option value="fundus">Fundus Photos</option>
            <option value="visual_field">Visual Fields</option>
            <option value="topography">Topography</option>
            <option value="pachymetry">Pachymetry</option>
            <option value="iol_master">IOL Master</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      {filteredResults.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="group inline-flex items-center"
                    onClick={() => toggleSort('type')}
                  >
                    Test Type
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${
                      sortField === 'type' ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="group inline-flex items-center"
                    onClick={() => toggleSort('date')}
                  >
                    Date
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${
                      sortField === 'date' ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes/Findings
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-gray-100">
                        {getTestIcon(result.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{getTestTypeDisplay(result.type)}</div>
                        <div className="text-xs text-gray-500">{result.performedBy}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(result.date)}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(result.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm text-gray-900 truncate">
                      {result.findings || result.notes || 'No notes or findings recorded'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      result.status === 'completed' 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-warning-100 text-warning-800'
                    }`}>
                      {result.status === 'completed' ? 'Completed' : 'Pending Review'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      className="text-primary-600 hover:text-primary-900 mr-3"
                      onClick={() => onOpenResult && onOpenResult(result)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => window.open(result.imageUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No test results</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'This patient has no recorded test results yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TestResultsList;