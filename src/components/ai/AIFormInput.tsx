import React, { useState, useEffect } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AIFormField } from './AIFormAssistant';

interface AIFormInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  field: AIFormField;
  onChange: (value: any) => void;
  onOpenAssistant?: () => void;
  enhancedLabel?: boolean;
}

const AIFormInput = ({
  field,
  onChange,
  onOpenAssistant,
  enhancedLabel = true,
  className,
  ...props
}: AIFormInputProps) => {
  const [isFilled, setIsFilled] = useState(false);
  const [isAIFilled, setIsAIFilled] = useState(false);
  
  useEffect(() => {
    // Check if the field has a value
    const hasValue = field.value !== undefined && field.value !== null && field.value !== '';
    setIsFilled(hasValue);
    
    // For demonstration purposes, we're simulating AI-filled detection
    // In a real app, you would track which fields were filled by AI
    if (hasValue && !isAIFilled) {
      setIsAIFilled(Math.random() > 0.5); // Randomly determine if AI filled for demo
    }
  }, [field.value]);
  
  // Render different input types based on field.type
  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            name={field.name}
            value={field.value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            className={cn(
              "w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500",
              isFilled && (isAIFilled ? "border-primary-300 bg-primary-50" : "border-success-300 bg-success-50"),
              className
            )}
            required={field.required}
            {...props}
          />
        );
        
      case 'select':
        return (
          <select
            id={field.id}
            name={field.name}
            value={field.value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500",
              isFilled && (isAIFilled ? "border-primary-300 bg-primary-50" : "border-success-300 bg-success-50"),
              className
            )}
            required={field.required}
            {...props}
          >
            <option value="">{field.placeholder || `Select ${field.label}`}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            name={field.name}
            value={field.value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500",
              isFilled && (isAIFilled ? "border-primary-300 bg-primary-50" : "border-success-300 bg-success-50"),
              className
            )}
            required={field.required}
            {...props}
          />
        );
        
      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={field.id}
            name={field.name}
            checked={field.value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            required={field.required}
            {...props}
          />
        );
        
      case 'radio':
        return field.options?.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              id={`${field.id}-${option.value}`}
              name={field.name}
              value={option.value}
              checked={field.value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              required={field.required}
              {...props}
            />
            <label 
              htmlFor={`${field.id}-${option.value}`} 
              className="ml-2 block text-sm text-gray-700"
            >
              {option.label}
            </label>
          </div>
        ));
        
      default:
        return (
          <input
            type={field.type}
            id={field.id}
            name={field.name}
            value={field.value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            className={cn(
              "w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500",
              isFilled && (isAIFilled ? "border-primary-300 bg-primary-50" : "border-success-300 bg-success-50"),
              className
            )}
            required={field.required}
            {...props}
          />
        );
    }
  };
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <label 
          htmlFor={field.id} 
          className={cn(
            "block text-sm font-medium mb-1",
            isFilled && (isAIFilled ? "text-primary-700" : "text-success-700"),
            !isFilled && "text-gray-700"
          )}
        >
          {field.label}
          {field.required && <span className="text-error-600 ml-1">*</span>}
        </label>
        
        {enhancedLabel && onOpenAssistant && (
          <button
            type="button"
            onClick={onOpenAssistant}
            className="ml-2 text-primary-600 hover:text-primary-800 text-xs flex items-center"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI fill
          </button>
        )}
      </div>
      
      <div className="relative">
        {renderInput()}
        
        {isFilled && isAIFilled && (
          <div className="absolute right-2 top-2 text-primary-600 bg-white rounded-full p-0.5">
            <Sparkles className="h-4 w-4" />
          </div>
        )}
        
        {isFilled && !isAIFilled && (
          <div className="absolute right-2 top-2 text-success-600 bg-white rounded-full p-0.5">
            <Info className="h-4 w-4" />
          </div>
        )}
      </div>
      
      {field.required && (
        <p className="mt-1 text-xs text-gray-500">
          Required field
        </p>
      )}
    </div>
  );
};

export default AIFormInput;