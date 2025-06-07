import { useState } from 'react';
import { Save, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface IopMeasurementFormProps {
  initialData?: {
    rightEye?: number;
    leftEye?: number;
    method?: 'ncf' | 'applanation' | 'other';
    time?: string;
    notes?: string;
  };
  onSave: (data: {
    rightEye?: number;
    leftEye?: number;
    method?: 'ncf' | 'applanation' | 'other';
    time?: string;
    notes?: string;
  }) => Promise<void>;
  className?: string;
}

const IopMeasurementForm = ({ initialData, onSave, className }: IopMeasurementFormProps) => {
  const [rightEye, setRightEye] = useState<number | undefined>(initialData?.rightEye);
  const [leftEye, setLeftEye] = useState<number | undefined>(initialData?.leftEye);
  const [method, setMethod] = useState<'ncf' | 'applanation' | 'other'>(initialData?.method || 'ncf');
  const [time, setTime] = useState<string>(initialData?.time || new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rightEye === undefined && leftEye === undefined) {
      setError('Please enter at least one IOP measurement');
      return;
    }
    
    if ((rightEye !== undefined && (rightEye < 0 || rightEye > 70)) || 
        (leftEye !== undefined && (leftEye < 0 || leftEye > 70))) {
      setError('IOP values must be between 0 and 70 mmHg');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      await onSave({
        rightEye,
        leftEye,
        method,
        time,
        notes: notes.trim() || undefined
      });
      
      setSuccess('IOP measurements saved successfully');
      
      // Reset success message after 2 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to save IOP measurements');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to determine color based on IOP value
  const getIopColor = (iop: number | undefined) => {
    if (iop === undefined) return 'bg-gray-100 text-gray-500';
    if (iop <= 10) return 'bg-success-100 text-success-800';
    if (iop <= 21) return 'bg-primary-100 text-primary-800';
    if (iop <= 30) return 'bg-warning-100 text-warning-800';
    return 'bg-error-100 text-error-800';
  };

  // Helper function to determine risk level based on IOP value
  const getIopRiskLevel = (iop: number | undefined) => {
    if (iop === undefined) return { level: 'unknown', message: 'Not measured' };
    if (iop <= 10) return { level: 'low', message: 'Low - Normal to Low' };
    if (iop <= 21) return { level: 'normal', message: 'Normal' };
    if (iop <= 30) return { level: 'elevated', message: 'Elevated - Consider rechecking' };
    return { level: 'high', message: 'High - Refer to doctor immediately' };
  };

  return (
    <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
      <div className="px-4 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Intraocular Pressure (IOP)</h3>
        <p className="mt-1 text-sm text-gray-500">
          Record IOP measurements for both eyes
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-error-400 mr-2" />
              <span className="text-error-800 text-sm">{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-success-50 border border-success-200 rounded-md"
          >
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-success-400 mr-2" />
              <span className="text-success-800 text-sm">{success}</span>
            </div>
          </motion.div>
        )}
        
        <div className="space-y-4">
          {/* IOP Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Right Eye */}
            <div>
              <label htmlFor="right-eye-iop" className="block text-sm font-medium text-gray-700">
                Right Eye (OD) mmHg
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="right-eye-iop"
                  min="0"
                  max="70"
                  step="1"
                  value={rightEye === undefined ? '' : rightEye}
                  onChange={(e) => setRightEye(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              {rightEye !== undefined && (
                <div className={`mt-2 text-xs p-1.5 rounded ${getIopColor(rightEye)}`}>
                  {getIopRiskLevel(rightEye).message}
                </div>
              )}
            </div>
            
            {/* Left Eye */}
            <div>
              <label htmlFor="left-eye-iop" className="block text-sm font-medium text-gray-700">
                Left Eye (OS) mmHg
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="left-eye-iop"
                  min="0"
                  max="70"
                  step="1"
                  value={leftEye === undefined ? '' : leftEye}
                  onChange={(e) => setLeftEye(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              
              {leftEye !== undefined && (
                <div className={`mt-2 text-xs p-1.5 rounded ${getIopColor(leftEye)}`}>
                  {getIopRiskLevel(leftEye).message}
                </div>
              )}
            </div>
          </div>
          
          {/* Measurement Method */}
          <div>
            <label htmlFor="iop-method" className="block text-sm font-medium text-gray-700">
              Measurement Method
            </label>
            <div className="mt-1">
              <select
                id="iop-method"
                value={method}
                onChange={(e) => setMethod(e.target.value as 'ncf' | 'applanation' | 'other')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="ncf">Non-contact Tonometry (Air puff)</option>
                <option value="applanation">Applanation Tonometry</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          {/* Time */}
          <div>
            <label htmlFor="iop-time" className="block text-sm font-medium text-gray-700">
              Time of Measurement
            </label>
            <div className="mt-1">
              <input
                type="time"
                id="iop-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label htmlFor="iop-notes" className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <div className="mt-1">
              <textarea
                id="iop-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Any additional observations or notes about the measurements..."
              />
            </div>
          </div>
          
          {/* IOP Reference Info */}
          <div className="rounded-md bg-gray-50 p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3 text-sm text-gray-500">
                <p>
                  <span className="font-medium text-gray-700">Normal IOP:</span>{' '}
                  10-21 mmHg
                </p>
                <p className="mt-1">
                  <span className="font-medium text-gray-700">Reference ranges:</span>
                  <br />
                  • Below 10 mmHg: Low
                  <br />
                  • 10-21 mmHg: Normal
                  <br />
                  • 22-30 mmHg: Elevated (recheck)
                  <br />
                  • Above 30 mmHg: High (immediate doctor review)
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving || (rightEye === undefined && leftEye === undefined)}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                  <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save IOP Measurements
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IopMeasurementForm;