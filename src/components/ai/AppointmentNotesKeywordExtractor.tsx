import { useState, useEffect } from 'react';
import { Sparkles, Tag, PlusCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AppointmentNotesKeywordExtractorProps {
  notes: string;
  onKeywordClick?: (keyword: string) => void;
  className?: string;
}

interface Keyword {
  text: string;
  category: 'symptom' | 'medication' | 'procedure' | 'condition' | 'other';
}

const categoryColors = {
  symptom: 'bg-warning-100 text-warning-800',
  medication: 'bg-success-100 text-success-800',
  procedure: 'bg-primary-100 text-primary-800',
  condition: 'bg-error-100 text-error-800',
  other: 'bg-gray-100 text-gray-800'
};

const AppointmentNotesKeywordExtractor = ({
  notes,
  onKeywordClick,
  className
}: AppointmentNotesKeywordExtractorProps) => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze notes when they change (but not on every keystroke)
  useEffect(() => {
    if (notes.length > 10) {
      extractKeywords(notes);
    } else {
      setKeywords([]);
    }
  }, [notes]);

  const extractKeywords = async (text: string) => {
    if (!text.trim()) {
      setKeywords([]);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simple keyword extraction logic for demonstration
      // In a production app, this would call an AI service API
      // For this demo, we'll simulate with some basic rules-based extraction
      
      // Delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const extractedKeywords: Keyword[] = [];
      
      // Common eye-related symptoms
      const symptoms = [
        'blurry vision', 'blurred vision', 'headache', 'migraine', 'pain', 'redness',
        'dry eyes', 'tearing', 'itching', 'burning', 'discharge', 'photophobia',
        'light sensitivity', 'floaters', 'flashes', 'double vision', 'diplopia',
        'vision loss', 'blind spot', 'halos', 'glare'
      ];
      
      // Common eye medications
      const medications = [
        'latanoprost', 'timolol', 'brimonidine', 'dorzolamide', 'bimatoprost',
        'travoprost', 'prednisolone', 'ketorolac', 'artificial tears',
        'cyclopentolate', 'tropicamide', 'atropine', 'pilocarpine', 'restasis',
        'xiidra', 'olopatadine', 'moxifloxacin', 'tobramycin'
      ];
      
      // Common eye procedures
      const procedures = [
        'cataract surgery', 'lasik', 'prk', 'vitrectomy', 'laser', 'trabeculectomy',
        'iridotomy', 'yag', 'intravitreal injection', 'injection', 'crosslinking',
        'corneal transplant', 'pterygium removal', 'iStent', 'selective laser trabeculoplasty',
        'slt', 'fundus photography', 'oct', 'visual field', 'refraction'
      ];
      
      // Common eye conditions
      const conditions = [
        'cataract', 'glaucoma', 'macular degeneration', 'amd', 'diabetic retinopathy', 
        'dry eye', 'conjunctivitis', 'pink eye', 'astigmatism', 'myopia', 
        'hyperopia', 'presbyopia', 'retinal detachment', 'uveitis', 'keratitis',
        'amblyopia', 'strabismus'
      ];
      
      const textLower = text.toLowerCase();
      
      // Check for symptoms
      symptoms.forEach(symptom => {
        if (textLower.includes(symptom)) {
          extractedKeywords.push({
            text: symptom,
            category: 'symptom'
          });
        }
      });
      
      // Check for medications
      medications.forEach(medication => {
        if (textLower.includes(medication)) {
          extractedKeywords.push({
            text: medication,
            category: 'medication'
          });
        }
      });
      
      // Check for procedures
      procedures.forEach(procedure => {
        if (textLower.includes(procedure)) {
          extractedKeywords.push({
            text: procedure,
            category: 'procedure'
          });
        }
      });
      
      // Check for conditions
      conditions.forEach(condition => {
        if (textLower.includes(condition)) {
          extractedKeywords.push({
            text: condition,
            category: 'condition'
          });
        }
      });
      
      // Add some additional keywords based on common patterns
      if (textLower.includes('follow') && (textLower.includes('up') || textLower.includes('week') || textLower.includes('month'))) {
        extractedKeywords.push({
          text: 'follow-up',
          category: 'procedure'
        });
      }
      
      if (textLower.includes('referral') || textLower.includes('referred')) {
        extractedKeywords.push({
          text: 'referral',
          category: 'procedure'
        });
      }
      
      if (textLower.includes('insurance')) {
        extractedKeywords.push({
          text: 'insurance',
          category: 'other'
        });
      }
      
      if (textLower.includes('urgent') || textLower.includes('emergency')) {
        extractedKeywords.push({
          text: 'urgent',
          category: 'other'
        });
      }
      
      // Remove duplicates
      const uniqueKeywords = Array.from(new Set(extractedKeywords.map(k => k.text)))
        .map(text => extractedKeywords.find(k => k.text === text)!);
      
      setKeywords(uniqueKeywords);
    } catch (error) {
      console.error("Error extracting keywords:", error);
      setError("Failed to analyze notes. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to manually add a keyword
  const addKeyword = (text: string, category: Keyword['category']) => {
    if (!text.trim()) return;
    
    // Check if keyword already exists
    const exists = keywords.some(k => k.text.toLowerCase() === text.toLowerCase());
    if (exists) return;
    
    setKeywords([...keywords, { text, category }]);
  };

  if (notes.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-4", className)}>
      <AnimatePresence>
        {keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mt-2"
          >
            {keywords.map((keyword, index) => (
              <motion.div 
                key={`${keyword.text}-${index}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                  categoryColors[keyword.category]
                )}
                onClick={() => onKeywordClick?.(keyword.text)}
              >
                <Tag className="h-3 w-3 mr-1" />
                {keyword.text}
                <button
                  className="ml-1 p-0.5 rounded-full hover:bg-black/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setKeywords(keywords.filter((_, i) => i !== index));
                  }}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {isAnalyzing && (
          <div className="text-xs text-gray-500 mt-2 flex items-center">
            <div className="mr-2 h-3 w-3 animate-spin rounded-full border border-solid border-primary-500 border-r-transparent"></div>
            Analyzing notes with AI...
          </div>
        )}

        {error && (
          <div className="text-xs text-error-600 mt-2">
            {error}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentNotesKeywordExtractor;