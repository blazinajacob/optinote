import { useState, useEffect } from 'react';
import { 
  Download, Filter, ChevronDown, ArrowUpDown,
  CreditCard, AlertCircle, CheckCircle, Clock,
  FileText, Receipt, DollarSign, ChevronRight,
  Phone
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface BillingTransaction {
  id: string;
  patientId: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'refunded' | 'cancelled';
  description: string;
  invoiceId?: string;
  paymentMethod?: string;
}

interface BillingHistoryProps {
  patientId: string;
}

const BillingHistory = ({ patientId }: BillingHistoryProps) => {
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Load transactions
  useEffect(() => {
    // In a real app, this would fetch from an API
    // For the demo, we'll use mock data
    const mockTransactions: BillingTransaction[] = [
      {
        id: 'tx-001',
        patientId,
        date: '2024-06-01T10:30:00Z',
        amount: 125.00,
        status: 'paid',
        description: 'Comprehensive eye exam',
        invoiceId: 'INV-001',
        paymentMethod: 'Credit Card ending in 4242'
      },
      {
        id: 'tx-002',
        patientId,
        date: '2024-05-15T14:45:00Z',
        amount: 75.50,
        status: 'paid',
        description: 'Contact lens fitting',
        invoiceId: 'INV-002',
        paymentMethod: 'Credit Card ending in 4242'
      },
      {
        id: 'tx-003',
        patientId,
        date: '2024-04-20T09:15:00Z',
        amount: 250.00,
        status: 'pending',
        description: 'Retinal imaging and OCT scan',
        invoiceId: 'INV-003'
      },
      {
        id: 'tx-004',
        patientId,
        date: '2024-03-05T11:00:00Z',
        amount: 45.00,
        status: 'refunded',
        description: 'Prescription glasses deposit',
        invoiceId: 'INV-004',
        paymentMethod: 'Credit Card ending in 4242'
      }
    ];
    
    setTransactions(mockTransactions);
    setIsLoading(false);
  }, [patientId]);

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(tx => {
      if (statusFilter !== 'all' && tx.status !== statusFilter) {
        return false;
      }
      
      if (dateFilter === 'all') return true;
      const txDate = new Date(tx.date);
      const now = new Date();
      
      if (dateFilter === 'last_month') {
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        return txDate >= lastMonth;
      }
      
      if (dateFilter === 'last_3_months') {
        const last3Months = new Date();
        last3Months.setMonth(now.getMonth() - 3);
        return txDate >= last3Months;
      }
      
      if (dateFilter === 'last_6_months') {
        const last6Months = new Date();
        last6Months.setMonth(now.getMonth() - 6);
        return txDate >= last6Months;
      }
      
      if (dateFilter === 'last_year') {
        const lastYear = new Date();
        lastYear.setFullYear(now.getFullYear() - 1);
        return txDate >= lastYear;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortDirection === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
    });

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending when changing fields
    }
  };

  const getStatusBadge = (status: BillingTransaction['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Overdue
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
            <DollarSign className="mr-1 h-3 w-3" />
            Refunded
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <X className="mr-1 h-3 w-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Calculate total paid amount
  const totalPaid = filteredTransactions
    .filter(tx => tx.status === 'paid')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  // Calculate total outstanding amount
  const totalOutstanding = filteredTransactions
    .filter(tx => tx.status === 'pending' || tx.status === 'overdue')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
        <div className="flex space-x-2">
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            
            {/* Filter dropdown would go here */}
          </div>
          
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
      </div>
      
      {/* Billing Stats */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Total Paid</h4>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              ${totalPaid.toFixed(2)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Outstanding Balance</h4>
            <p className="mt-1 text-2xl font-semibold text-primary-600">
              ${totalOutstanding.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Filtering options */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          <select
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="last_year">Last Year</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading billing history...</p>
        </div>
      ) : filteredTransactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    className="group inline-flex items-center"
                    onClick={() => toggleSort('amount')}
                  >
                    Amount
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${
                      sortField === 'amount' ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                  </button>
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
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="font-medium text-gray-900">{transaction.description}</div>
                    {transaction.invoiceId && (
                      <div className="text-xs text-gray-500">
                        Invoice: {transaction.invoiceId}
                      </div>
                    )}
                    {transaction.paymentMethod && (
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {transaction.paymentMethod}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={transaction.status === 'refunded' ? 'text-warning-600' : 'text-gray-900'}>
                      ${transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-primary-600 hover:text-primary-900"
                      onClick={() => {
                        // In a real app, this would open a transaction details view
                        console.log(`View details for ${transaction.id}`);
                      }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <Receipt className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No billing history</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'This patient has no billing records yet'}
          </p>
        </div>
      )}
      
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            onClick={() => {
              // In a real app, this would navigate to a billing dashboard
              console.log('Create new invoice');
            }}
          >
            <FileText className="h-4 w-4 mr-1" />
            Create Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

// X component is used but not imported - add it here
const X = ({ className }: { className?: string }) => (
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
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default BillingHistory;