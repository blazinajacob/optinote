import { useState, useEffect } from 'react';
import { 
  DollarSign, CreditCard, Calendar, CheckCircle, 
  AlertCircle, Clock, Building, Receipt, Shield,
  RefreshCw, CheckSquare, XSquare, Info, AlertTriangle
} from 'lucide-react';
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
  network: 'in' | 'out' | 'unknown';
  effectiveDate: string;
  expirationDate?: string;
  groupNumber?: string;
  subscriberId?: string;
  subscriberName?: string;
  relationship?: string;
  verificationDate?: string;
  eligibilityStatus?: 'eligible' | 'ineligible' | 'pending' | 'unknown';
  benefits?: {
    deductible?: {
      individual: number;
      family: number;
      met: number;
      remaining: number;
    };
    outOfPocketMax?: {
      individual: number;
      family: number;
      met: number;
      remaining: number;
    };
    services?: {
      [key: string]: {
        covered: boolean;
        copay?: number;
        coinsurance?: number;
        notes?: string;
      };
    };
  };
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
  previousInsurance?: InsuranceInfo[];
}

const BillingOverview = ({ patientId, className }: BillingOverviewProps) => {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [activeInsuranceTab, setActiveInsuranceTab] = useState<'current' | 'previous'>('current');
  const [showBenefits, setShowBenefits] = useState<string | null>(null);

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
          status: 'active',
          network: 'in',
          effectiveDate: '2024-01-01',
          expirationDate: '2024-12-31',
          groupNumber: 'GRP12345',
          subscriberId: 'SUB98765',
          subscriberName: 'John Doe',
          relationship: 'Self',
          verificationDate: '2024-06-01',
          eligibilityStatus: 'eligible',
          benefits: {
            deductible: {
              individual: 1500,
              family: 3000,
              met: 500,
              remaining: 1000
            },
            outOfPocketMax: {
              individual: 5000,
              family: 10000,
              met: 1200,
              remaining: 3800
            },
            services: {
              'Eye Exam': {
                covered: true,
                copay: 20,
                coinsurance: 0
              },
              'Glasses': {
                covered: true,
                coinsurance: 20,
                notes: 'Once every 24 months'
              },
              'Contact Lenses': {
                covered: true,
                coinsurance: 20,
                notes: 'In lieu of glasses, once every 12 months'
              }
            }
          }
        },
        {
          provider: 'VSP Vision Care',
          policyNumber: 'VSP123456789',
          isPrimary: false,
          coverageType: 'Vision Only',
          copayAmount: 10,
          status: 'active',
          network: 'in',
          effectiveDate: '2024-01-01',
          expirationDate: '2024-12-31',
          groupNumber: 'VSPGRP789',
          subscriberId: 'VSPSUB456',
          subscriberName: 'John Doe',
          relationship: 'Self',
          verificationDate: '2024-05-15',
          eligibilityStatus: 'eligible',
          benefits: {
            services: {
              'Eye Exam': {
                covered: true,
                copay: 10,
                notes: 'Once every 12 months'
              },
              'Frames': {
                covered: true,
                coinsurance: 20,
                notes: 'Up to $150 allowance every 24 months'
              },
              'Lenses': {
                covered: true,
                copay: 25,
                notes: 'Once every 12 months'
              }
            }
          }
        }
      ],
      previousInsurance: [
        {
          provider: 'Aetna',
          policyNumber: 'AET456789012',
          isPrimary: true,
          coverageType: 'Medical and Vision',
          status: 'inactive',
          network: 'in',
          effectiveDate: '2023-01-01',
          expirationDate: '2023-12-31',
          groupNumber: 'AETGRP123',
          subscriberId: 'AETSUB456',
          subscriberName: 'John Doe',
          relationship: 'Self'
        }
      ]
    };
    
    setTimeout(() => {
      setSummary(mockSummary);
      setIsLoading(false);
    }, 500);
  }, [patientId]);

  const handleCheckEligibility = async (insuranceId: string) => {
    setIsCheckingEligibility(true);
    
    // Simulate API call to check eligibility
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update the insurance with verification date and status
    if (summary) {
      const updatedInsurance = summary.insuranceCoverage.map(insurance => {
        if (insurance.policyNumber === insuranceId) {
          return {
            ...insurance,
            verificationDate: new Date().toISOString().split('T')[0],
            eligibilityStatus: 'eligible'
          };
        }
        return insurance;
      });
      
      setSummary({
        ...summary,
        insuranceCoverage: updatedInsurance
      });
    }
    
    setIsCheckingEligibility(false);
  };

  const toggleBenefitsView = (policyNumber: string) => {
    if (showBenefits === policyNumber) {
      setShowBenefits(null);
    } else {
      setShowBenefits(policyNumber);
    }
  };

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
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-gray-900">Insurance Information</h4>
          <div className="flex space-x-2">
            <button
              className={`text-xs px-2 py-1 rounded-md ${
                activeInsuranceTab === 'current' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActiveInsuranceTab('current')}
            >
              Current
            </button>
            <button
              className={`text-xs px-2 py-1 rounded-md ${
                activeInsuranceTab === 'previous' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActiveInsuranceTab('previous')}
            >
              Previous
            </button>
          </div>
        </div>
        
        {activeInsuranceTab === 'current' ? (
          <div className="space-y-4">
            {summary.insuranceCoverage.length > 0 ? (
              summary.insuranceCoverage.map((insurance, index) => (
                <div key={index} className="border rounded-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className={cn(
                        "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                        insurance.status === 'active' ? "bg-success-100" : 
                        insurance.status === 'pending' ? "bg-warning-100" : "bg-gray-100"
                      )}>
                        <Building className={cn(
                          "h-5 w-5",
                          insurance.status === 'active' ? "text-success-600" : 
                          insurance.status === 'pending' ? "text-warning-600" : "text-gray-500"
                        )} />
                      </div>
                      
                      <div className="ml-3 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <p className="text-sm font-medium text-gray-900">{insurance.provider}</p>
                          {insurance.isPrimary && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              <Shield className="mr-1 h-3 w-3" />
                              Primary
                            </span>
                          )}
                          {!insurance.isPrimary && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                              <Shield className="mr-1 h-3 w-3" />
                              Secondary
                            </span>
                          )}
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            insurance.status === 'active' ? "bg-success-100 text-success-800" : 
                            insurance.status === 'pending' ? "bg-warning-100 text-warning-800" : 
                            "bg-gray-100 text-gray-800"
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
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            insurance.network === 'in' ? "bg-success-100 text-success-800" : 
                            insurance.network === 'out' ? "bg-error-100 text-error-800" : 
                            "bg-gray-100 text-gray-800"
                          )}>
                            {insurance.network === 'in' ? (
                              <CheckSquare className="mr-1 h-3 w-3" />
                            ) : insurance.network === 'out' ? (
                              <XSquare className="mr-1 h-3 w-3" />
                            ) : (
                              <Info className="mr-1 h-3 w-3" />
                            )}
                            {insurance.network === 'in' ? 'In-Network' : 
                             insurance.network === 'out' ? 'Out-of-Network' : 'Network Unknown'}
                          </span>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Policy Number</p>
                            <p className="font-medium">{insurance.policyNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Group Number</p>
                            <p className="font-medium">{insurance.groupNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Coverage Type</p>
                            <p className="font-medium">{insurance.coverageType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Copay</p>
                            <p className="font-medium">{insurance.copayAmount ? `$${insurance.copayAmount.toFixed(2)}` : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Effective Date</p>
                            <p className="font-medium">{new Date(insurance.effectiveDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Expiration Date</p>
                            <p className="font-medium">{insurance.expirationDate ? new Date(insurance.expirationDate).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                        
                        {insurance.eligibilityStatus && (
                          <div className="mt-3 flex items-center">
                            <p className="text-xs text-gray-500 mr-2">Eligibility:</p>
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              insurance.eligibilityStatus === 'eligible' ? "bg-success-100 text-success-800" : 
                              insurance.eligibilityStatus === 'ineligible' ? "bg-error-100 text-error-800" : 
                              insurance.eligibilityStatus === 'pending' ? "bg-warning-100 text-warning-800" : 
                              "bg-gray-100 text-gray-800"
                            )}>
                              {insurance.eligibilityStatus === 'eligible' ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : insurance.eligibilityStatus === 'ineligible' ? (
                                <XSquare className="mr-1 h-3 w-3" />
                              ) : insurance.eligibilityStatus === 'pending' ? (
                                <Clock className="mr-1 h-3 w-3" />
                              ) : (
                                <AlertCircle className="mr-1 h-3 w-3" />
                              )}
                              {insurance.eligibilityStatus.charAt(0).toUpperCase() + insurance.eligibilityStatus.slice(1)}
                            </span>
                            {insurance.verificationDate && (
                              <span className="ml-2 text-xs text-gray-500">
                                Verified: {new Date(insurance.verificationDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-md border border-primary-200 flex items-center"
                        onClick={() => toggleBenefitsView(insurance.policyNumber)}
                      >
                        <Info className="h-3 w-3 mr-1.5" />
                        {showBenefits === insurance.policyNumber ? 'Hide Benefits' : 'View Benefits'}
                      </button>
                      
                      <button
                        className="text-xs px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md border border-gray-200 flex items-center"
                        onClick={() => handleCheckEligibility(insurance.policyNumber)}
                        disabled={isCheckingEligibility}
                      >
                        {isCheckingEligibility ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1.5" />
                            Check Eligibility
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {showBenefits === insurance.policyNumber && insurance.benefits && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Benefits Information</h5>
                      
                      {insurance.benefits.deductible && (
                        <div className="mb-4">
                          <h6 className="text-xs font-medium text-gray-700 mb-2">Deductible</h6>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Individual</p>
                              <p className="text-sm font-medium">${insurance.benefits.deductible.individual.toFixed(2)}</p>
                              <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary-500 rounded-full"
                                  style={{ width: `${(insurance.benefits.deductible.met / insurance.benefits.deductible.individual) * 100}%` }}
                                ></div>
                              </div>
                              <div className="mt-1 flex justify-between text-xs">
                                <span>${insurance.benefits.deductible.met.toFixed(2)} met</span>
                                <span>${insurance.benefits.deductible.remaining.toFixed(2)} remaining</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Family</p>
                              <p className="text-sm font-medium">${insurance.benefits.deductible.family.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {insurance.benefits.outOfPocketMax && (
                        <div className="mb-4">
                          <h6 className="text-xs font-medium text-gray-700 mb-2">Out-of-Pocket Maximum</h6>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Individual</p>
                              <p className="text-sm font-medium">${insurance.benefits.outOfPocketMax.individual.toFixed(2)}</p>
                              <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary-500 rounded-full"
                                  style={{ width: `${(insurance.benefits.outOfPocketMax.met / insurance.benefits.outOfPocketMax.individual) * 100}%` }}
                                ></div>
                              </div>
                              <div className="mt-1 flex justify-between text-xs">
                                <span>${insurance.benefits.outOfPocketMax.met.toFixed(2)} met</span>
                                <span>${insurance.benefits.outOfPocketMax.remaining.toFixed(2)} remaining</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Family</p>
                              <p className="text-sm font-medium">${insurance.benefits.outOfPocketMax.family.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {insurance.benefits.services && (
                        <div>
                          <h6 className="text-xs font-medium text-gray-700 mb-2">Covered Services</h6>
                          <div className="border rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Service</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Coverage</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Patient Cost</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {Object.entries(insurance.benefits.services).map(([service, details]) => (
                                  <tr key={service}>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{service}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                                      {details.covered ? (
                                        <span className="inline-flex items-center text-success-700">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Covered
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center text-error-700">
                                          <XSquare className="h-3 w-3 mr-1" />
                                          Not Covered
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                                      {details.copay ? `$${details.copay} copay` : ''}
                                      {details.coinsurance ? `${details.coinsurance}% coinsurance` : ''}
                                      {details.notes && (
                                        <div className="text-xs text-gray-500 mt-1">{details.notes}</div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No insurance information on file</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {summary.previousInsurance && summary.previousInsurance.length > 0 ? (
              summary.previousInsurance.map((insurance, index) => (
                <div key={index} className="border rounded-md p-4 bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Building className="h-5 w-5 text-gray-500" />
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <p className="text-sm font-medium text-gray-900">{insurance.provider}</p>
                        {insurance.isPrimary && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                            <Shield className="mr-1 h-3 w-3" />
                            Primary
                          </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Inactive
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Policy Number</p>
                          <p className="font-medium">{insurance.policyNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Group Number</p>
                          <p className="font-medium">{insurance.groupNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Coverage Type</p>
                          <p className="font-medium">{insurance.coverageType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Coverage Period</p>
                          <p className="font-medium">
                            {new Date(insurance.effectiveDate).toLocaleDateString()} - 
                            {insurance.expirationDate ? new Date(insurance.expirationDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No previous insurance records</p>
              </div>
            )}
          </div>
        )}
        
        {activeInsuranceTab === 'current' && summary.insuranceCoverage.some(ins => ins.eligibilityStatus === 'eligible') && (
          <div className="mt-4 p-3 bg-success-50 border border-success-200 rounded-md">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm font-medium text-success-800">Insurance Eligibility Verified</p>
                <p className="mt-1 text-xs text-success-700">
                  Patient's insurance coverage has been verified and is active. Benefits information is current as of today.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeInsuranceTab === 'current' && summary.insuranceCoverage.some(ins => ins.eligibilityStatus === 'ineligible') && (
          <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-error-500 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm font-medium text-error-800">Insurance Eligibility Issue</p>
                <p className="mt-1 text-xs text-error-700">
                  There may be issues with the patient's insurance coverage. Please verify with the insurance provider.
                </p>
              </div>
            </div>
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