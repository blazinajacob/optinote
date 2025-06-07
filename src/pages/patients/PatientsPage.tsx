import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Search, Filter, ChevronRight, PlusCircle,
  X, ChevronDown, Calendar, Phone, Mail, MapPin
} from 'lucide-react';
import { usePatientStore } from '../../stores/patientStore';
import { useAuthStore } from '../../stores/authStore';
import { formatDate } from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';
import AddPatientModal from './AddPatientModal';

const PatientsPage = () => {
  const { patients, getPatients, isLoading } = usePatientStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    gender?: string;
    ageRange?: string;
    insuranceProvider?: string;
    lastVisit?: string;
  }>({});
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    getPatients();
  }, [getPatients]);
  
  useEffect(() => {
    // Focus search input when page loads
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  // Filter patients based on search term and advanced filters
  const filteredPatients = patients.filter(patient => {
    // Basic search by name, ID, or phone
    const basicSearchMatch = 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) || 
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.medicalHistory && patient.medicalHistory.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.insuranceProvider && patient.insuranceProvider.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!basicSearchMatch) return false;
    
    // Apply advanced filters if they are set
    if (selectedFilters.gender && patient.gender !== selectedFilters.gender) return false;
    
    if (selectedFilters.ageRange) {
      const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
      const [min, max] = selectedFilters.ageRange.split('-').map(Number);
      if (age < min || age > max) return false;
    }
    
    if (selectedFilters.insuranceProvider && 
        (!patient.insuranceProvider || 
         !patient.insuranceProvider.toLowerCase().includes(selectedFilters.insuranceProvider.toLowerCase()))) {
      return false;
    }
    
    if (selectedFilters.lastVisit) {
      const lastVisitDate = new Date(patient.updatedAt);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastVisitDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (selectedFilters.lastVisit) {
        case 'week':
          if (diffDays > 7) return false;
          break;
        case 'month':
          if (diffDays > 30) return false;
          break;
        case 'quarter':
          if (diffDays > 90) return false;
          break;
        case 'year':
          if (diffDays > 365) return false;
          break;
      }
    }
    
    return true;
  });
  
  const clearSearch = () => {
    setSearchTerm('');
    setSelectedFilters({});
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
    if (!showAdvancedSearch && searchInputRef.current) {
      // Focus search input when opening advanced search
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };
  
  // Get unique insurance providers for filter dropdown
  const uniqueInsuranceProviders = Array.from(
    new Set(
      patients
        .filter(p => p.insuranceProvider)
        .map(p => p.insuranceProvider)
    )
  );
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <PageHeader
        title="Patients"
        subtitle="Manage and view patient records"
        actions={
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowAddPatientModal(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Patient
          </button>
        }
      />
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search patients by name, ID, phone, email, insurance or medical history..."
                  className="block w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-10 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    onClick={clearSearch}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className={`flex items-center px-3 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                    showAdvancedSearch 
                      ? "bg-primary-50 text-primary-700 border-primary-200" 
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={toggleAdvancedSearch}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${
                    showAdvancedSearch ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {(searchTerm || Object.keys(selectedFilters).length > 0) && (
                  <button
                    type="button"
                    className="flex items-center px-3 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {showAdvancedSearch && (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-3 animate-fade-in">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Advanced Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="gender-filter" className="block text-xs text-gray-500 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender-filter"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      value={selectedFilters.gender || ''}
                      onChange={(e) => setSelectedFilters({ 
                        ...selectedFilters, 
                        gender: e.target.value || undefined 
                      })}
                    >
                      <option value="">Any gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="age-filter" className="block text-xs text-gray-500 mb-1">
                      Age Range
                    </label>
                    <select
                      id="age-filter"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      value={selectedFilters.ageRange || ''}
                      onChange={(e) => setSelectedFilters({ 
                        ...selectedFilters, 
                        ageRange: e.target.value || undefined 
                      })}
                    >
                      <option value="">Any age</option>
                      <option value="0-18">0-18 years</option>
                      <option value="19-40">19-40 years</option>
                      <option value="41-65">41-65 years</option>
                      <option value="66-120">66+ years</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="insurance-filter" className="block text-xs text-gray-500 mb-1">
                      Insurance Provider
                    </label>
                    <select
                      id="insurance-filter"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      value={selectedFilters.insuranceProvider || ''}
                      onChange={(e) => setSelectedFilters({ 
                        ...selectedFilters, 
                        insuranceProvider: e.target.value || undefined 
                      })}
                    >
                      <option value="">Any provider</option>
                      {uniqueInsuranceProviders.map((provider) => (
                        <option key={provider} value={provider}>
                          {provider}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="visit-filter" className="block text-xs text-gray-500 mb-1">
                      Last Visit
                    </label>
                    <select
                      id="visit-filter"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      value={selectedFilters.lastVisit || ''}
                      onChange={(e) => setSelectedFilters({ 
                        ...selectedFilters, 
                        lastVisit: e.target.value || undefined 
                      })}
                    >
                      <option value="">Any time</option>
                      <option value="week">Within last week</option>
                      <option value="month">Within last month</option>
                      <option value="quarter">Within last 3 months</option>
                      <option value="year">Within last year</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {Object.keys(selectedFilters).length > 0 
                      ? `${Object.keys(selectedFilters).length} filters applied` 
                      : 'No filters applied'}
                  </div>
                  <button
                    type="button"
                    className="text-xs text-primary-600 hover:text-primary-800"
                    onClick={() => setSelectedFilters({})}
                  >
                    Reset all filters
                  </button>
                </div>
              </div>
            )}
            
            {(searchTerm || Object.keys(selectedFilters).length > 0) && (
              <div className="flex items-center pt-2 text-sm text-gray-500">
                <span>
                  Found <span className="font-medium">{filteredPatients.length}</span> patients matching your search
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="min-h-80">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-500">Loading patients...</p>
            </div>
          ) : filteredPatients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DOB
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Insurance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr 
                      key={patient.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 font-semibold">
                              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              {patient.gender}
                              <span className="mx-1">•</span>
                              {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(patient.dateOfBirth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Phone className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                          {patient.phone}
                        </div>
                        {patient.email && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                            {patient.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.insuranceProvider || 'Not provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                          {formatDate(patient.updatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ChevronRight className="h-5 w-5 text-gray-400 inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <PlusCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || Object.keys(selectedFilters).length > 0 
                  ? 'Try adjusting your search terms or filters' 
                  : 'Get started by adding a new patient'}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowAddPatientModal(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Patient
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
      />
    </div>
  );
};

export default PatientsPage;