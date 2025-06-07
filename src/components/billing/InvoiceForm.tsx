import { useState } from 'react';
import { 
  Save, X, Plus, Trash2, DollarSign, Calendar,
  CheckCircle, AlertCircle, Calculator, Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  cptCode?: string;
  icd10Code?: string;
}

interface InvoiceFormProps {
  patientId: string;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const InvoiceForm = ({
  patientId,
  onSave,
  onCancel
}: InvoiceFormProps) => {
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Due in 30 days by default
    return date.toISOString().split('T')[0];
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('net_30');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    
    setItems([...items, newItem]);
  };
  
  const updateItem = (id: string, data: Partial<InvoiceItem>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...data };
        
        // Recalculate total
        if (data.quantity !== undefined || data.unitPrice !== undefined) {
          updatedItem.total = (updatedItem.quantity || 0) * (updatedItem.unitPrice || 0);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };
  
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  // Calculate subtotal, tax, discount, and total
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + taxAmount - discountAmount;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    
    try {
      if (items.length === 0) {
        throw new Error('Please add at least one item to the invoice');
      }
      
      // Validate items
      for (const item of items) {
        if (!item.description) {
          throw new Error('All items must have a description');
        }
        if (item.quantity <= 0) {
          throw new Error('All items must have a quantity greater than 0');
        }
        if (item.unitPrice < 0) {
          throw new Error('Item prices cannot be negative');
        }
      }
      
      const invoiceData = {
        invoiceNumber,
        patientId,
        invoiceDate,
        dueDate,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        discountAmount,
        total,
        notes,
        paymentTerms,
        status: 'pending'
      };
      
      await onSave(invoiceData);
      setSuccess('Invoice created successfully');
      
      // Reset form or close
      setTimeout(() => {
        onCancel();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to create invoice');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Create New Invoice</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onCancel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-3 bg-error-50 border border-error-200 rounded-md"
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
          className="mx-4 mt-4 p-3 bg-success-50 border border-success-200 rounded-md"
        >
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-success-500 mr-2" />
            <span className="text-success-800">{success}</span>
          </div>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="p-4 space-y-6">
          {/* Invoice Header Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="invoice-number">
                Invoice Number
              </label>
              <input
                type="text"
                id="invoice-number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="invoice-date">
                Invoice Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="invoice-date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="due-date">
                Due Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="due-date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Invoice Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-medium text-gray-900">Items & Services</h4>
              <button
                type="button"
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                onClick={addItem}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Item
              </button>
            </div>
            
            {items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-md">
                <Receipt className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add items to this invoice
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Item
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        CPT Code
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Qty
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Unit Price
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Total
                      </th>
                      <th scope="col" className="relative px-4 py-3 w-10">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Item description"
                            required
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.cptCode || ''}
                            onChange={(e) => updateItem(item.id, { cptCode: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="CPT Code"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            min="1"
                            required
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                              className="block w-full pl-7 pr-4 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                              step="0.01"
                              min="0"
                              required
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              value={item.total.toFixed(2)}
                              readOnly
                              className="block w-full pl-7 pr-4 bg-gray-50 border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-error-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Invoice Totals */}
          {items.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center justify-between w-64">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between w-64">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Discount:</span>
                    <div className="relative w-20">
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="block w-full pr-6 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        min="0"
                        max="100"
                      />
                      <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">-${discountAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between w-64">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Tax:</span>
                    <div className="relative w-20">
                      <input
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="block w-full pr-6 border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        min="0"
                        max="100"
                      />
                      <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between w-64 pt-2 border-t border-gray-200">
                  <span className="text-base font-semibold text-gray-900">Total:</span>
                  <span className="text-base font-bold text-primary-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Payment Terms */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="payment-terms">
                  Payment Terms
                </label>
                <select
                  id="payment-terms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="due_on_receipt">Due on Receipt</option>
                  <option value="net_15">Net 15 Days</option>
                  <option value="net_30">Net 30 Days</option>
                  <option value="net_45">Net 45 Days</option>
                  <option value="net_60">Net 60 Days</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="invoice-notes">
                Notes
              </label>
              <textarea
                id="invoice-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                rows={3}
                placeholder="Additional notes to appear on the invoice"
              />
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
          <button
            type="button"
            className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          
          <button
            type="button"
            className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={isSaving || items.length === 0}
          >
            <Calculator className="h-4 w-4 mr-1.5 inline" />
            Preview
          </button>
          
          <button
            type="submit"
            className="px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
            disabled={isSaving || items.length === 0}
          >
            {isSaving ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;