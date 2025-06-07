import { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FilterButtonProps {
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

const FilterButton = ({
  isActive,
  onClick,
  className
}: FilterButtonProps) => {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center px-3 py-2.5 border shadow-sm text-sm font-medium rounded-md transition-colors",
        isActive 
          ? "bg-primary-50 text-primary-700 border-primary-200" 
          : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300",
        className
      )}
      onClick={onClick}
    >
      <Filter className="h-4 w-4 mr-2" />
      Filters
      <ChevronDown className={cn(
        "ml-1 h-4 w-4 transform transition-transform",
        isActive ? 'rotate-180' : ''
      )} />
    </button>
  );
};

export default FilterButton;