import { useState } from 'react';
import { 
  Save, CreditCard, Calendar, DollarSign,
  CheckCircle, AlertCircle, Trash2, Percent
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account' | 'cash' | 'other';
  lastFour?: string;
  expiryDate?: string;
  nameOnCard?: string;
  isDefault: boolean;
  notes?: string;
}

interface SelfPaySettings {
  paymentMethods: PaymentMethod[];
  discountEligible: boolean;
  discountPercent?: number;
  discountReason?: string;
  allowPaymentPlans: boolean;
}

interface SelfPayFormProps {
  patientId: string;
  initialData?: SelfPaySettings;
  onSave: (data: SelfPaySettings) => Promise<void>;
  onCancel: () => void;
}

const SelfPayForm = ({
  patientId,
  initialData,
  onSave,
  onCancel
}: SelfPayFormProps) => {
  const [formData, setFormData] = useState<SelfPaySettings>(initialData || {
    paymentMethods: [],
    discountEligible: false,
    allowPaymentPlans: false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardName, setNewCardName] = useState('');
  const [newCardType, setNewCardType] = useState<PaymentMethod['type']>('credit_card');

  const addPaymentMethod = () => {
    if (newCardType === 'credit_card' && !validateCardDetails()) {
      return;
    }

    const lastFour = newCardType === 'credit_card' ? newCardNumber.slice(-4) : undefined;
    
    const newMethod: PaymentMethod = {
      id: `payment-${Date.now()}`,
      type: newCardType,
      lastFour,
      expiryDate: newCardExpiry || undefined,
      nameOnCard: newCardName || undefined,
      isDefault: formData.paymentMethods.length === 0, // First payment method is default
      notes: ''
    };
    
    setFormData({
      ...formData,
      paymentMethods: [...formData.paymentMethods, newMethod]
    });
    
    // Clear form
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardName('');
  };

  const validateCardDetails = () => {
    if (newCardType !== 'credit_card') return true;
    
    if (!newCardNumber || newCardNumber.length < 4) {
      setError('Please enter at least the last 4 digits of the card number');
      return false;
    }
    
    return true;
  };

  const removePaymentMethod = (id: string) => {
    const updatedMethods = formData.paymentMethods.filter(method => method.id !== id);
    
    // If we removed the default method and there are still other methods,
    // make the first one the default
    if (
      formData.paymentMethods.find(m => m.id === id)?.isDefault &&
      updatedMethods.length > 0
    ) {
      updatedMethods[0].isDefault = true;
    }
    
    setFormData({
      ...formData,
      paymentMethods: updatedMethods
    });
  };

  const updatePaymentMethod = (id: string, data: Partial<PaymentMethod>) => {
    const updatedMethods = formData.paymentMethods.map(method => {
      if (method.id === id) {
        return { ...method, ...data };
      }
      
      // If this method is being set as default, make others non-default
      if (data.isDefault && method.id !== id) {
        return { ...method, isDefault: false };
      }
      
      return method;
    });
    
    setFormData({
      ...formData,
      paymentMethods: updatedMethods
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    
    try {
      // Ensure at least one payment method is default if there are any
      if (formData.paymentMethods.length > 0 && !formData.paymentMethods.some(m => m.isDefault)) {
        formData.paymentMethods[0].isDefault = true;
      }
      
      // Validate discount if eligible
      if (formData.discountEligible) {
        if (!formData.discountPercent || formData.discountPercent <= 0 || formData.discountPercent > 100) {
          throw new Error('Please enter a valid discount percentage between 1-100');
        }
      }
      
      // Save data
      await onSave(formData);
      setSuccess('Self-pay information saved successfully');
      
      // Clear success after 2 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to save self-pay information');
    } finally {
      setIsSaving(false);
    }
  };

  // Format card number to show only last 4 digits
  const formatCardNumber = (number: string) => {
    if (number.length <= 4) return number;
    const lastFour = number.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  };

  const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="h-5 w-5 text-primary-500" />;
      case 'bank_account':
        return <Building className="h-5 w-5 text-secondary-500" />;
      case 'cash':
        return <DollarSign className="h-5 w-5 text-success-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Methods Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage stored payment methods for self-pay patients
          </p>
          
          <div className="mt-4 space-y-4">
            {/* Existing Payment Methods */}
            {formData.paymentMethods.map(method => (
              <div 
                key={method.id}
                className="bg-gray-50 border border-gray-200 rounded-md p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {method.type === 'credit_card' ? (
                        <CreditCard className="h-6 w-6 text-primary-500" />
                      ) : method.type === 'bank_account' ? (
                        <Building className="h-6 w-6 text-secondary-500" />
                      ) : method.type === 'cash' ? (
                        <DollarSign className="h-6 w-6 text-success-500" />
                      ) : (
                        <CreditCard className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {method.type === 'credit_card' && method.lastFour 
                            ? `Credit Card ending in ${method.lastFour}`
                            : method.type === 'bank_account' 
                              ? 'Bank Account'
                              : method.type === 'cash'
                                ? 'Cash'
                                : 'Other Payment Method'}
                        </p>
                        {method.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Default
                          </span>
                        )}
                      </div>
                      {method.nameOnCard && (
                        <p className="text-xs text-gray-500 mt-1">
                          {method.nameOnCard}
                        </p>
                      )}
                      {method.expiryDate && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Expires: {method.expiryDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-error-500"
                      onClick={() => removePaymentMethod(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={method.isDefault}
                      onChange={(e) => updatePaymentMethod(method.id, { isDefault: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Default payment method</span>
                  </label>
                </div>
              </div>
            ))}
            
            {/* Add New Payment Method */}
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Add Payment Method</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="payment-type">
                    Payment Type
                  </label>
                  <select
                    id="payment-type"
                    value={newCardType}
                    onChange={(e) => setNewCardType(e.target.value as PaymentMethod['type'])}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_account">Bank Account</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {newCardType === 'credit_card' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="card-number">
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="card-number"
                        value={newCardNumber}
                        onChange={(e) => {
                          // Only allow digits
                          const value = e.target.value.replace(/\D/g, '');
                          setNewCardNumber(value);
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter last 4 digits only"
                        maxLength={4}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        For security, enter only last 4 digits
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="expiry-date">
                        Expiration Date
                      </label>
                      <input
                        type="month"
                        id="expiry-date"
                        value={newCardExpiry}
                        onChange={(e) => setNewCardExpiry(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="card-name">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        id="card-name"
                        value={newCardName}
                        onChange={(e) => setNewCardName(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter cardholder name"
                      />
                    </div>
                  </>
                )}
                
                {newCardType === 'bank_account' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="account-name">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        id="account-name"
                        value={newCardName}
                        onChange={(e) => setNewCardName(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter account holder name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="account-last-four">
                        Last 4 Digits of Account
                      </label>
                      <input
                        type="text"
                        id="account-last-four"
                        value={newCardNumber}
                        onChange={(e) => {
                          // Only allow digits
                          const value = e.target.value.replace(/\D/g, '');
                          setNewCardNumber(value);
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Last 4 digits only"
                        maxLength={4}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        For security, enter only last 4 digits
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={addPaymentMethod}
                >
                  Add Method
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Discounts Section */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Discount Eligibility</h3>
          <p className="text-sm text-gray-500 mt-1">
            Set up self-pay discount options for this patient
          </p>
          
          <div className="mt-4">
            <div className="flex items-center">
              <input
                id="discount-eligible"
                name="discount-eligible"
                type="checkbox"
                checked={formData.discountEligible}
                onChange={(e) => setFormData({
                  ...formData,
                  discountEligible: e.target.checked,
                  // Reset discount percent if unchecked
                  discountPercent: e.target.checked ? formData.discountPercent : undefined,
                  discountReason: e.target.checked ? formData.discountReason : undefined
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="discount-eligible" className="ml-2 block text-sm text-gray-900">
                Patient eligible for self-pay discount
              </label>
            </div>
            
            {formData.discountEligible && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="discount-percent">
                    Discount Percentage
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <input
                      type="number"
                      name="discount-percent"
                      id="discount-percent"
                      className="block w-full rounded-md border-gray-300 pr-12 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="0"
                      min="1"
                      max="100"
                      value={formData.discountPercent || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        discountPercent: e.target.value ? Number(e.target.value) : undefined
                      })}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="discount-reason">
                    Reason for Discount
                  </label>
                  <select
                    id="discount-reason"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={formData.discountReason || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      discountReason: e.target.value || undefined
                    })}
                  >
                    <option value="">Select reason</option>
                    <option value="Financial Hardship">Financial Hardship</option>
                    <option value="No Insurance">No Insurance</option>
                    <option value="Employee Discount">Employee Discount</option>
                    <option value="Promotional Offer">Promotional Offer</option>
                    <option value="Senior Citizen">Senior Citizen</option>
                    <option value="Student">Student</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Payment Plan Section */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Payment Plans</h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure payment plan options for this patient
          </p>
          
          <div className="mt-4">
            <div className="flex items-center">
              <input
                id="payment-plan"
                name="payment-plan"
                type="checkbox"
                checked={formData.allowPaymentPlans}
                onChange={(e) => setFormData({
                  ...formData,
                  allowPaymentPlans: e.target.checked
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="payment-plan" className="ml-2 block text-sm text-gray-900">
                Allow payment plans for this patient
              </label>
            </div>
            
            {formData.allowPaymentPlans && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  Payment plans will be configured on a per-invoice basis. When creating an invoice, you'll be able to set up a payment schedule.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Form Buttons */}
        <div className="pt-6 flex justify-end space-x-3">
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
            {isSaving ? 'Saving...' : 'Save Payment Information'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Building component is used but not imported - add it here
const Building = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 14h.01" />
    <path d="M16 14h.01" />
    <path d="M12 14h.01" />
  </svg>
);

export default SelfPayForm;