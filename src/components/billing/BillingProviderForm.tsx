import { useState } from 'react';
import { 
  Save, X, CreditCard, Calendar, Shield, DollarSign,
  CheckCircle, AlertCircle, Plus, Trash2, Building
} from 'lucide-react';
import { motion } from 'framer-motion';

interface InsuranceProvider {
  id: string;
  name: string;
  policyNumber: string;
  groupNumber?: string;
  coverageType: string;
  copayAmount?: number;
  contactNumber?: string;
  startDate: string;
  endDate?: string;
  isPrimary: boolean;
  notes?: string;
}

interface BillingProviderFormProps {
  patientId: string;
  initialData?: InsuranceProvider[];
  onSave: (providers: InsuranceProvider[]) => Promise<void>;
  onCancel: () => void;
}

const BillingProviderForm = ({
  patientId,
  initialData = [],
  onSave,
  onCancel
}: BillingProviderFormProps) => {
  const [providers, setProviders] = useState<InsuranceProvider[]>(initialData.length > 0 ? initialData : []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addProvider = () => {
    const newProvider: InsuranceProvider = {
      id: `provider-${Date.now()}`,
      name: '',
      policyNumber: '',
      coverageType: 'Medical',
      startDate: new Date().toISOString().split('T')[0],
      isPrimary: providers.length === 0 // Make the first provider primary by default
    };
    
    setProviders([...providers, newProvider]);
  };

  const removeProvider = (id: string) => {
    setProviders(providers.filter(p => p.id !== id));
  };

  const updateProvider = (id: string, data: Partial<InsuranceProvider>) => {
    setProviders(providers.map(provider => 
      provider.id === id ? { ...provider, ...data } : provider
    ));
    
    // If this provider is being set as primary, make others non-primary
    if (data.isPrimary) {
      setProviders(providers.map(provider => 
        provider.id !== id ? { ...provider, isPrimary: false } : provider
      ));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    
    try {
      // Validate required fields
      for (const provider of providers) {
        if (!provider.name || !provider.policyNumber || !provider.coverageType || !provider.startDate) {
          throw new Error('Please complete all required fields for each insurance provider');
        }
      }
      
      // Ensure at least one provider is primary if there are providers
      if (providers.length > 0 && !providers.some(p => p.isPrimary)) {
        providers[0].isPrimary = true;
      }
      
      // Save data
      await onSave(providers);
      setSuccess('Insurance information saved successfully');
      
      // Clear success after 2 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to save insurance information');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-error-50 border border-error-200 rounded-md"
        >
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-error-500 mr-2" />
            <span className="text-error-800">{error}</span>
          </div>
        </motion.div>
      )}
      
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-success-50 border border-success-200 rounded-md"
        >
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-success-500 mr-2" />
            <span className="text-success-800">{success}</span>
          </div>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {providers.length === 0 ? (
          <div className="text-center py-10">
            <Building className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No insurance providers</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add insurance provider information for this patient
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {providers.map((provider, index) => (
              <div key={provider.id} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                    {provider.isPrimary && (
                      <span className="mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        <Shield className="mr-1 h-3 w-3" />
                        Primary
                      </span>
                    )}
                    Insurance Provider {index + 1}
                  </h4>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-error-500"
                    onClick={() => removeProvider(provider.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`provider-${provider.id}`}>
                      Provider Name <span className="text-error-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`provider-${provider.id}`}
                      value={provider.name}
                      onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="e.g., Blue Cross Blue Shield"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`policy-${provider.id}`}>
                      Policy Number <span className="text-error-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`policy-${provider.id}`}
                      value={provider.policyNumber}
                      onChange={(e) => updateProvider(provider.id, { policyNumber: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="e.g., XYZ123456789"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`group-${provider.id}`}>
                      Group Number
                    </label>
                    <input
                      type="text"
                      id={`group-${provider.id}`}
                      value={provider.groupNumber || ''}
                      onChange={(e) => updateProvider(provider.id, { groupNumber: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="e.g., G12345"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`coverage-${provider.id}`}>
                      Coverage Type <span className="text-error-500">*</span>
                    </label>
                    <select
                      id={`coverage-${provider.id}`}
                      value={provider.coverageType}
                      onChange={(e) => updateProvider(provider.id, { coverageType: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      required
                    >
                      <option value="Medical">Medical</option>
                      <option value="Vision">Vision</option>
                      <option value="Medical and Vision">Medical and Vision</option>
                      <option value="Medicare">Medicare</option>
                      <option value="Medicaid">Medicaid</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`copay-${provider.id}`}>
                      Copay Amount ($)
                    </label>
                    <input
                      type="number"
                      id={`copay-${provider.id}`}
                      value={provider.copayAmount || ''}
                      onChange={(e) => updateProvider(provider.id, { 
                        copayAmount: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="e.g., 20"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`contact-${provider.id}`}>
                      Provider Contact
                    </label>
                    <input
                      type="tel"
                      id={`contact-${provider.id}`}
                      value={provider.contactNumber || ''}
                      onChange={(e) => updateProvider(provider.id, { contactNumber: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="e.g., (800) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`start-${provider.id}`}>
                      Start Date <span className="text-error-500">*</span>
                    </label>
                    <input
                      type="date"
                      id={`start-${provider.id}`}
                      value={provider.startDate}
                      onChange={(e) => updateProvider(provider.id, { startDate: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`end-${provider.id}`}>
                      End Date
                    </label>
                    <input
                      type="date"
                      id={`end-${provider.id}`}
                      value={provider.endDate || ''}
                      onChange={(e) => updateProvider(provider.id, { endDate: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`notes-${provider.id}`}>
                    Notes
                  </label>
                  <textarea
                    id={`notes-${provider.id}`}
                    value={provider.notes || ''}
                    onChange={(e) => updateProvider(provider.id, { notes: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    rows={2}
                    placeholder="Additional details about coverage, authorizations, etc."
                  />
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={provider.isPrimary}
                      onChange={(e) => updateProvider(provider.id, { isPrimary: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Set as primary insurance</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
            onClick={addProvider}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Insurance Provider
          </button>
          
          <div className="flex space-x-3">
            <button
              type="button"
              className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Insurance Information'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BillingProviderForm;