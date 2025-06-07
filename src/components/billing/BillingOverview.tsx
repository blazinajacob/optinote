import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Calendar, CheckCircle, 
         AlertCircle, Clock, Building, Receipt } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BillingOverviewProps {
  patientId: string;
  className?: string;
}

interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  isPrimary: boolean;
  coverageType: string;
  copayAmount?: number;
  status: 'active' | 'inactive' | 'pending';
}

interface BillingSummary {
  balance: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  nextInvoiceDueDate?: string;
  paymentMethod?: string;
  discountEligible: boolean;
  discountPercent?: number;
  insuranceCoverage: InsuranceInfo[];
}

const BillingOverview = ({ patientId, className }: BillingOverviewProps) => {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For this demo, we'll use mock data
    const mockSummary: BillingSummary = {
      balance: 250.75,
      lastPaymentDate: '2024-05-15',
      lastPaymentAmount: 125.00,
      nextInvoiceDueDate: '2024-07-01',
      paymentMethod: 'Credit Card ending in 4242',
      discountEligible: true,
      discountPercent: 10,
      insuranceCoverage: [
        {
          provider: 'Blue Cross Blue Shield',
          policyNumber: 'BC987654321',
          isPrimary: true,
          coverageType: 'Medical and Vision',
          copayAmount: 20,
          status: 'active'
        }
      ]
    };
    
    setTimeout(() => {
      setSummary(mockSummary);
      setIsLoading(false);
    }, 500);
  }, [patientId]);

  if (isLoading) {
    return (
      <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden min-h-[200px] flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading billing summary...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
        <div className="p-4">
          <div className="text-center py-8">
            <DollarSign className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No billing information</h3>
            <p className="mt-1 text-sm text-gray-500">
              There is no billing information available for this patient
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Billing Overview</h3>
      </div>
      
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">Current Balance</p>
            <p className="text-2xl font-semibold text-gray-900">${summary.balance.toFixed(2)}</p>
          </div>
          <DollarSign className="h-10 w-10 text-primary-500" />
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500 mb-1">Last Payment</p>
          <p className="text-lg font-semibold text-gray-900">${summary.lastPaymentAmount.toFixed(2)}</p>
          <div className="mt-1 flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(summary.lastPaymentDate).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Insurance Information</h4>
        
        {summary.insuranceCoverage.length > 0 ? (
          <div className="space-y-3">
            {summary.insuranceCoverage.map((insurance, index) => (
              <div key={index} className="flex items-start">
                <div className={cn(
                  "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                  insurance.status === 'active' ? 'bg-success-100' : 
                  insurance.status === 'pending' ? 'bg-warning-100' : 'bg-gray-100'
                )}>
                  <Building className={cn(
                    "h-5 w-5",
                    insurance.status === 'active' ? 'text-success-600' : 
                    insurance.status === 'pending' ? 'text-warning-600' : 'text-gray-500'
                  )} />
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900">{insurance.provider}</p>
                    {insurance.isPrimary && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Primary
                      </span>
                    )}
                    <span className={cn(
                      "ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      insurance.status === 'active' ? 'bg-success-100 text-success-800' : 
                      insurance.status === 'pending' ? 'bg-warning-100 text-warning-800' : 
                      'bg-gray-100 text-gray-800'
                    )}>
                      {insurance.status === 'active' ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : insurance.status === 'pending' ? (
                        <Clock className="mr-1 h-3 w-3" />
                      ) : (
                        <AlertCircle className="mr-1 h-3 w-3" />
                      )}
                      {insurance.status.charAt(0).toUpperCase() + insurance.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Policy: {insurance.policyNumber} • {insurance.coverageType}
                  </p>
                  {insurance.copayAmount !== undefined && (
                    <p className="text-sm text-gray-500 mt-1">
                      Copay: ${insurance.copayAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No insurance information on file</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Payment Information</h4>
        
        <div className="space-y-4">
          {summary.paymentMethod ? (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary-600" />
              </div>
              
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Default Payment Method</p>
                <p className="text-sm text-gray-500">{summary.paymentMethod}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500">No payment method on file</p>
            </div>
          )}
          
          {summary.discountEligible && (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-success-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success-600" />
              </div>
              
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Self-Pay Discount</p>
                <p className="text-sm text-gray-500">
                  Patient is eligible for a {summary.discountPercent}% discount on self-pay services
                </p>
              </div>
            </div>
          )}
          
          {summary.nextInvoiceDueDate && (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-warning-100 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-warning-600" />
              </div>
              
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Next Invoice Due</p>
                <p className="text-sm text-gray-500">
                  {new Date(summary.nextInvoiceDueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingOverview;