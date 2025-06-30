import { cn } from '../../lib/utils';

interface BoltBadgeProps {
  className?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

const BoltBadge = ({ 
  className,
  position = 'bottom-right'
}: BoltBadgeProps) => {
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  };

  return (
    <a 
      href="https://bolt.new" 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn(
        "fixed z-50 flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-gray-800",
        positionClasses[position],
        className
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.37488 0L0 9.37495H4.49993L3.93745 16L12.9374 6.50005H7.87482L8.37488 0Z" fill="white"/>
      </svg>
      Made with Bolt
    </a>
  );
};

export default BoltBadge;