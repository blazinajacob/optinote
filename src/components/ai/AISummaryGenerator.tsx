import { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Loader2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { generateSummary } from '../../lib/openai';
import { Patient, Examination, Appointment } from '../../types';

export type SummaryType = 'patient' | 'examination' | 'appointment' | 'soap';

interface AISummaryGeneratorProps {
  type: SummaryType;
  data: Patient | Examination | Appointment | any;
  className?: string;
  compact?: boolean;
}

const AISummaryGenerator = ({ 
  type, 
  data, 
  className,
  compact = false
}: AISummaryGeneratorProps) => {
  const [summary, setSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const generateEntitySummary = async () => {
    setIsGenerating(true);
    setError(null);
    setSummary('');
    
    try {
      const generatedSummary = await generateSummary(type, data);
      setSummary(generatedSummary);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      setError(error.message || 'Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getTitle = () => {
    switch (type) {
      case 'patient':
        return 'Patient Summary';
      case 'examination':
        return 'Examination Summary';
      case 'appointment':
        return 'Appointment Summary';
      case 'soap':
        return 'SOAP Note Summary';
      default:
        return 'Summary';
    }
  };
  
  const getEmptyStateMessage = () => {
    switch (type) {
      case 'patient':
        return 'Generate a comprehensive summary of this patient\'s medical history, conditions, and key information.';
      case 'examination':
        return 'Generate a summary of the examination findings, diagnosis, and recommendations.';
      case 'appointment':
        return 'Generate a summary of the appointment details, purpose, and outcomes.';
      case 'soap':
        return 'Generate a concise summary of the SOAP note content.';
      default:
        return 'Generate an AI-powered summary for this data.';
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <button
          type="button"
          className="inline-flex items-center text-sm px-3 py-1.5 border border-primary-200 rounded bg-primary-50 text-primary-700 hover:bg-primary-100"
          onClick={generateEntitySummary}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {summary ? 'Regenerate AI Summary' : 'Generate AI Summary'}
        </button>
        
        {summary && (
          <button
            type="button"
            className="inline-flex items-center text-sm px-3 py-1.5 border border-gray-200 rounded bg-white text-gray-700 hover:bg-gray-50"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-success-500" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden", className)}>
      <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <Sparkles className="h-4 w-4 text-primary-600" />
          </div>
          <h3 className="text-base font-medium text-gray-900">
            {getTitle()}
          </h3>
        </div>
        
        {!isGenerating && summary && (
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-5 w-5 text-success-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      <div className="p-4">
        {!summary && !isGenerating ? (
          <div className="flex flex-col items-center justify-center py-6">
            <FileText className="h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500 text-center">
              {getEmptyStateMessage()}
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
              onClick={generateEntitySummary}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Summary
            </button>
          </div>
        ) : isGenerating ? (
          <div className="flex flex-col items-center justify-center py-6">
            <motion.div
              className="h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-600"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <p className="mt-4 text-sm text-gray-500">
              Generating summary with AI...
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="prose max-w-none text-gray-700 text-sm whitespace-pre-wrap">
              {summary}
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="mr-1.5 h-3 w-3 text-success-500" />
                ) : (
                  <Copy className="mr-1.5 h-3 w-3" />
                )}
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
              
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                onClick={generateEntitySummary}
              >
                <RefreshCw className="mr-1.5 h-3 w-3" />
                Regenerate
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-md">
            <p className="text-sm text-error-800">{error}</p>
          </div>
        )}
      </div>
      
      {summary && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          <p>
            AI-generated summary based on available data. Content may need clinical review.
          </p>
        </div>
      )}
    </div>
  );
};

export default AISummaryGenerator;