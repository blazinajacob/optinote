import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AIFormAssistant, { AIFormField } from './AIFormAssistant';
import AIFormInput from './AIFormInput';

interface FormWithAIAssistantProps {
  title: string;
  description?: string;
  fields: AIFormField[];
  onSubmit: (formData: Record<string, any>) => void;
  submitLabel?: string;
  contextHint?: string;
  assistantPosition?: 'bottom' | 'inline';
  className?: string;
}

const FormWithAIAssistant = ({
  title,
  description,
  fields: initialFields,
  onSubmit,
  submitLabel = 'Submit',
  contextHint,
  assistantPosition = 'inline',
  className
}: FormWithAIAssistantProps) => {
  const [fields, setFields] = useState<AIFormField[]>(initialFields);
  const [showAssistant, setShowAssistant] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Update fields if they change externally
    setFields(initialFields);
  }, [initialFields]);
  
  const handleFieldChange = (id: string, value: any) => {
    setFields(prev => prev.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };
  
  const handleFieldsUpdate = (updatedFields: AIFormField[]) => {
    // Map updated fields to existing fields, preserving structure
    const fieldMap = new Map(updatedFields.map(field => [field.id, field]));
    
    setFields(prevFields => {
      return prevFields.map(prevField => {
        const updatedField = fieldMap.get(prevField.id);
        if (!updatedField) return prevField;
        
        return {
          ...prevField,
          value: updatedField.value !== undefined ? updatedField.value : prevField.value
        };
      });
    });
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Convert fields to form data object
    const formData = fields.reduce<Record<string, any>>((acc, field) => {
      acc[field.name] = field.value;
      return acc;
    }, {});
    
    // Submit form data
    onSubmit(formData);
    
    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };
  
  const handleReset = () => {
    setFields(initialFields.map(field => ({ ...field, value: '' })));
  };
  
  return (
    <div className={className}>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-gray-400 hover:text-gray-500"
              title="Reset form"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleFormSubmit}>
          {/* AI Assistant at the top when position is inline */}
          {assistantPosition === 'inline' && (
            <div className="mb-6 border-b border-gray-100 pb-4 px-4 py-5">
              <AIFormAssistant
                fields={fields}
                onFieldsUpdate={handleFieldsUpdate}
                contextHint={contextHint}
                position="inline"
              />
            </div>
          )}
            
          {/* Form Fields */}
          <div className="px-4 py-5 sm:px-6 space-y-4">
            {fields.map((field) => (
              <AIFormInput
                key={field.id}
                field={field}
                onChange={(value) => handleFieldChange(field.id, value)}
                onOpenAssistant={() => setShowAssistant(true)}
              />
            ))}
          </div>
          
          <div className="px-4 py-3 bg-gray-50 sm:px-6 flex justify-end">
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                    <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : submitLabel}
            </button>
          </div>
        </form>
      </div>
      
      {assistantPosition === 'bottom' && (
        <AIFormAssistant
          fields={fields}
          onFieldsUpdate={handleFieldsUpdate}
          contextHint={contextHint}
          position="bottom"
        />
      )}
    </div>
  );
};

export default FormWithAIAssistant;